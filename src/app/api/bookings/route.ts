import { NextResponse } from 'next/server';
import { addMinutes, differenceInMinutes } from 'date-fns';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, readStore, updateStore, findClientByPhone, occupiesSlot, isAbandonedHold } from '@/lib/data-store';
import { sendEmail, buildBookingConfirmationEmail, formatAppointmentWhen, buildAdminNewBookingEmail } from '@/lib/email';
import { generatePortalMagicLink } from '@/lib/magic-link';
import { notifyAdminsOfNewBooking } from '@/lib/admin-notify';

// A reminder 60 minutes before the appointment is only useful if the
// booking itself was made with more than 60 minutes of runway — otherwise
// there's no meaningful "reminder" to send, so it's skipped up front rather
// than silently never firing later (and never burning a Brevo send on it).
const REMINDER_LEAD_MINUTES = 60;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = await readStore();
    const appointments = store.appointments.map((apt) => {
      const client = store.clients.find((item) => item.id === apt.clientId);
      const user = client ? store.users.find((item) => item.id === client.userId) : null;
      return {
        ...apt,
        services: (apt.serviceIds as string[]).map((id: string) => store.services.find((service: any) => service.id === id)).filter(Boolean),
        client: client ? { ...client, user } : null,
      };
    });
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, email, staffId, serviceIds, startTime, paymentMethod } = await request.json();
    if (!name || !phone || !Array.isArray(serviceIds) || !startTime) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    // "cash" = pay in person on arrival (no online payment). Anything else is
    // treated as a card booking that must clear a Stripe deposit before it
    // counts as a real, confirmed appointment.
    const isCash = paymentMethod === "cash";

    const result = await updateStore((store) => {
      const now = new Date();
      // Opportunistically drop abandoned card holds (unpaid past the hold
      // window) so they neither block slots nor accumulate in the store.
      store.appointments = store.appointments.filter((apt) => !isAbandonedHold(apt, now));

      const selectedServices = store.services.filter((service) => serviceIds.includes(service.id));
      if (selectedServices.length === 0) return { error: 'No valid services found', status: 404 };

      const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration, 0);
      const totalPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);

      let resolvedStaffId = staffId;
      if (staffId === "solo-staff-id" || !staffId) {
        const firstStaff = store.staff.find((item) => item.isActive);
        if (!firstStaff) return { error: 'No active staff members found to handle this booking.', status: 500 };
        resolvedStaffId = firstStaff.id;
      }

      const start = new Date(startTime);
      const end = addMinutes(start, totalDuration);
      const conflict = store.appointments.find((apt) => {
        if (apt.staffId !== resolvedStaffId || !occupiesSlot(apt, now)) return false;
        return new Date(apt.startTime) < end && new Date(apt.endTime) > start;
      });

      if (conflict) return { error: 'This time slot is already booked. Please try another time.', status: 409 };

      // Clients are still identified by phone (the one required field) —
      // email is optional, used only for confirmation/reminder emails and
      // as a second portal login path (see src/lib/auth.ts).
      let client = findClientByPhone(store, phone);
      let user = client ? store.users.find((item) => item.id === client.userId) : undefined;

      if (!user) {
        user = {
          id: createId("user"),
          email: cleanEmail,
          name,
          // Guests don't set a password at booking time; generate a random
          // one (hashed, like any other credential) so the account still
          // works if they later use "forgot password" via OTP or a reset flow.
          password: bcrypt.hashSync(Math.random().toString(36).slice(2) + Date.now(), 10),
          role: 'CLIENT',
          createdAt: new Date().toISOString(),
        };
        store.users.push(user);
      }

      if (!client) {
        client = {
          id: createId("client"),
          userId: user.id,
          phone,
          email: cleanEmail,
          notes: "",
        };
        store.clients.push(client);
      } else {
        client.phone = phone;
        // Only overwrite when a new email is actually supplied — an empty
        // field on a repeat booking shouldn't erase one given previously.
        if (cleanEmail) client.email = cleanEmail;
      }
      if (cleanEmail && !user.email) user.email = cleanEmail;

      const appointment = {
        id: createId("apt"),
        clientId: client.id,
        staffId: resolvedStaffId,
        serviceIds,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalPrice,
        // Cash bookings arrive as PENDING for the salon to accept; card
        // bookings sit as an unpaid hold until Stripe confirms the deposit,
        // at which point they flip to CONFIRMED (see the payment verify route).
        status: isCash ? 'PENDING' : 'AWAITING_PAYMENT',
        paymentMethod: isCash ? 'cash' : 'card',
        isPaid: false,
        paymentRef: null,
        reminderSent: false,
        // No point scheduling a "60 minutes before" reminder when the
        // booking itself was made with less than 60 minutes of runway —
        // skip it up front instead of leaving it to the cron route to
        // notice on every poll for an appointment that's already too close.
        reminderSkipped: differenceInMinutes(start, now) <= REMINDER_LEAD_MINUTES,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      store.appointments.push(appointment);

      return { ...appointment, services: selectedServices, client: { ...client, user } };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: Number(result.status) || 500 });
    }

    // Best-effort side effects, but awaited rather than fire-and-forget —
    // App Hosting's Cloud Run backend can throttle CPU once a response is
    // sent, so work kicked off after `return` isn't guaranteed to finish.
    // Each is isolated in its own try/catch so a failed email or push never
    // fails a booking that already succeeded.
    // Card bookings send their confirmation + admin alerts only after the
    // deposit is verified (see /api/payments/stripe/verify) — otherwise an
    // abandoned checkout would wrongly email "you're booked in" and ping the
    // salon. Cash bookings are real pending appointments the moment they're
    // created, so notify straight away.
    if (isCash) {
    const settings = (await readStore()).settings;
    const serviceNames = result.services.map((s: any) => s.name);
    const whenLabel = formatAppointmentWhen(result.startTime);

    if (cleanEmail) {
      try {
        const portalLink = await generatePortalMagicLink(cleanEmail);
        const { subject, html } = buildBookingConfirmationEmail({
          settings,
          clientName: name,
          serviceNames,
          startTimeIso: result.startTime,
          totalPrice: result.totalPrice,
          portalLink,
        });
        await sendEmail({ to: { email: cleanEmail, name }, subject, htmlContent: html });
      } catch (err) {
        console.error("[BOOKING_CONFIRMATION_EMAIL_ERROR]", err);
      }
    }

    try {
      await notifyAdminsOfNewBooking({ clientName: name, serviceNames, whenLabel });
    } catch (err) {
      console.error("[ADMIN_PUSH_NOTIFY_ERROR]", err);
    }

    try {
      const adminEmail = process.env.SMTP_USER;
      if (adminEmail) {
        const adminPortalLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/appointments`;
        const { subject: adminSubject, html: adminHtml } = buildAdminNewBookingEmail({
          settings,
          clientName: name,
          clientEmail: cleanEmail || "Not provided",
          clientPhone: phone || "Not provided",
          serviceNames,
          startTimeIso: result.startTime,
          totalPrice: result.totalPrice,
          adminPortalLink,
        });
        await sendEmail({ to: { email: adminEmail }, subject: adminSubject, htmlContent: adminHtml });
      }
    } catch (err) {
      console.error("[ADMIN_BOOKING_EMAIL_ERROR]", err);
    }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
