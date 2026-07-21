import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, readStore, updateStore } from '@/lib/data-store';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await updateStore((store) => {
      const user = store.users.find((item) => item.id === userId);
      if (!user) return null;

      let clientProfile = store.clients.find((client) => client.userId === user.id);
      if (!clientProfile) {
        clientProfile = {
          id: createId("client"),
          userId: user.id,
          phone: "",
          notes: "",
        };
        store.clients.push(clientProfile);
      }

      const appointments = store.appointments
        .filter((apt) => apt.clientId === clientProfile.id)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .map((apt) => ({
          ...apt,
          services: (apt.serviceIds as string[]).map((serviceId: string) => store.services.find((service: any) => service.id === serviceId)).filter(Boolean),
          staff: store.staff.find((staff) => staff.id === apt.staffId),
        }));

      const formulations = store.formulations.filter((item) => item.clientId === clientProfile.id);

      return {
        profile: {
          name: user.name,
          email: user.email,
          phone: clientProfile.phone,
          createdAt: user.createdAt
        },
        appointments,
        formulations
      };
    });

    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
