import { NextResponse } from 'next/server';
import { addMinutes } from 'date-fns';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, readStore, updateStore, findClientByPhone } from '@/lib/data-store';

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
    const { name, phone, staffId, serviceIds, startTime } = await request.json();
    if (!name || !phone || !Array.isArray(serviceIds) || !startTime) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    const result = await updateStore((store) => {
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
        if (apt.staffId !== resolvedStaffId || !['PENDING', 'CONFIRMED'].includes(apt.status)) return false;
        return new Date(apt.startTime) < end && new Date(apt.endTime) > start;
      });

      if (conflict) return { error: 'This time slot is already booked. Please try another time.', status: 409 };

      // Clients are identified by phone (not email) — booking never asks for
      // an email address, since the business only needs a phone number to
      // reach customers and customers only ever log in via phone + OTP.
      let client = findClientByPhone(store, phone);
      let user = client ? store.users.find((item) => item.id === client.userId) : undefined;

      if (!user) {
        user = {
          id: createId("user"),
          email: "",
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
          notes: "",
        };
        store.clients.push(client);
      } else {
        client.phone = phone;
      }

      const appointment = {
        id: createId("apt"),
        clientId: client.id,
        staffId: resolvedStaffId,
        serviceIds,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalPrice,
        status: 'PENDING',
        isPaid: false,
        paymentRef: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.appointments.push(appointment);

      return { ...appointment, services: selectedServices, client: { ...client, user } };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: Number(result.status) || 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
