import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { readStore, updateStore } from '@/lib/data-store';
import { sendEmail, buildBookingConfirmationEmail, formatAppointmentWhen, buildAdminNewBookingEmail } from '@/lib/email';
import { generatePortalMagicLink } from '@/lib/magic-link';
import { notifyAdminsOfNewBooking } from '@/lib/admin-notify';

// Confirms a card booking by proving its deposit was actually paid, then flips
// the AWAITING_PAYMENT hold into a real CONFIRMED + paid appointment. This is
// the gate that makes payment validate the booking: until this succeeds, the
// appointment is only an unpaid hold that frees its slot after a few minutes.
//
// Called from the /booking/success page with the Stripe Checkout Session id
// (unguessable) and the appointment id. We never trust the client's word that
// payment happened — we ask Stripe directly (session.payment_status).
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { appointmentId, sessionId } = await request.json();
    if (!appointmentId || !sessionId) {
      return NextResponse.json({ error: 'Missing appointmentId or sessionId' }, { status: 400 });
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const simulated = !STRIPE_SECRET_KEY || String(sessionId).startsWith('SIMULATED_');

    // Real payment check (skipped only in local dev where Stripe isn't wired,
    // which the checkout route already flags with a SIMULATED_ reference).
    if (!simulated) {
      const stripe = new Stripe(STRIPE_SECRET_KEY as string);
      let checkoutSession: Stripe.Checkout.Session;
      try {
        checkoutSession = await stripe.checkout.sessions.retrieve(String(sessionId));
      } catch (err) {
        console.error('[STRIPE_VERIFY_RETRIEVE_ERROR]', err);
        return NextResponse.json({ error: 'Could not verify this payment session.' }, { status: 400 });
      }

      const paid = checkoutSession.payment_status === 'paid';
      const matchesAppointment = checkoutSession.metadata?.appointmentId === appointmentId;
      if (!paid || !matchesAppointment) {
        return NextResponse.json({ paid: false, error: 'Payment not completed.' }, { status: 402 });
      }
    }

    // Idempotent flip to CONFIRMED + paid. `alreadyConfirmed` guards against a
    // page refresh (or double-submit) re-sending the confirmation email.
    let alreadyConfirmed = false;
    const result = await updateStore((store) => {
      const appt = store.appointments.find((item) => item.id === appointmentId);
      if (!appt) return { error: 'Appointment not found', status: 404 } as const;

      if (appt.isPaid && appt.status === 'CONFIRMED') {
        alreadyConfirmed = true;
      } else {
        appt.isPaid = true;
        appt.status = 'CONFIRMED';
        appt.paymentRef = String(sessionId);
        appt.updatedAt = new Date().toISOString();
      }

      const client = store.clients.find((c) => c.id === appt.clientId);
      const user = client ? store.users.find((u) => u.id === client.userId) : undefined;
      const services = (appt.serviceIds as string[])
        .map((id) => store.services.find((s: any) => s.id === id))
        .filter(Boolean);

      return {
        appointment: appt,
        clientName: user?.name || 'Valued Client',
        clientEmail: client?.email || user?.email || '',
        clientPhone: client?.phone || '',
        serviceNames: services.map((s: any) => s.name),
      };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: Number(result.status) || 500 });
    }

    // Send the confirmation + admin alerts once, only on the first confirmation.
    if (!alreadyConfirmed) {
      const settings = (await readStore()).settings;
      const startTimeIso = result.appointment.startTime;
      const totalPrice = result.appointment.totalPrice;

      if (result.clientEmail) {
        try {
          const portalLink = await generatePortalMagicLink(result.clientEmail);
          const { subject, html } = buildBookingConfirmationEmail({
            settings,
            clientName: result.clientName,
            serviceNames: result.serviceNames,
            startTimeIso,
            totalPrice,
            portalLink,
          });
          await sendEmail({ to: { email: result.clientEmail, name: result.clientName }, subject, htmlContent: html });
        } catch (err) {
          console.error('[VERIFY_CONFIRMATION_EMAIL_ERROR]', err);
        }
      }

      try {
        await notifyAdminsOfNewBooking({
          clientName: result.clientName,
          serviceNames: result.serviceNames,
          whenLabel: formatAppointmentWhen(startTimeIso),
        });
      } catch (err) {
        console.error('[VERIFY_ADMIN_PUSH_ERROR]', err);
      }

      try {
        const adminEmail = process.env.SMTP_USER;
        if (adminEmail) {
          const adminPortalLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/appointments`;
          const { subject: adminSubject, html: adminHtml } = buildAdminNewBookingEmail({
            settings,
            clientName: result.clientName,
            clientEmail: result.clientEmail || 'Not provided',
            clientPhone: result.clientPhone || 'Not provided',
            serviceNames: result.serviceNames,
            startTimeIso,
            totalPrice,
            adminPortalLink,
          });
          await sendEmail({ to: { email: adminEmail }, subject: adminSubject, htmlContent: adminHtml });
        }
      } catch (err) {
        console.error('[VERIFY_ADMIN_EMAIL_ERROR]', err);
      }
    }

    return NextResponse.json({ paid: true, appointmentId, simulated });
  } catch (error) {
    console.error('[STRIPE_VERIFY_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
