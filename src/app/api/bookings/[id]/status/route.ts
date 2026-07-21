import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createId, updateStore } from '@/lib/data-store';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    const { id } = await params;

    const result = await updateStore((store) => {
      const appointment = store.appointments.find((item) => item.id === id);
      if (!appointment) return null;

      appointment.status = status;
      appointment.updatedAt = new Date().toISOString();

      if (status === 'COMPLETED') {
        appointment.isPaid = true;
        const services = appointment.serviceIds
          .map((serviceId: string) => store.services.find((service: any) => service.id === serviceId))
          .filter(Boolean);

        for (const service of services) {
          for (const material of service.materials || []) {
            const item = store.inventory.find((inventoryItem) => inventoryItem.id === material.inventoryItemId);
            if (item) item.quantity -= material.estimatedUsage;
          }
        }

        store.formulations.push({
          id: createId("formulation"),
          clientId: appointment.clientId,
          title: `Treatment Completed: ${services.map((service: any) => service.name).join(', ')}`,
          description: `Session finalized on ${new Date().toLocaleDateString()}. Your skin/hair is glowing! View your updated history in the portal.`,
          beforeImage: null,
          afterImage: null,
          createdAt: new Date().toISOString(),
        });
      }

      return {
        ...appointment,
        services: appointment.serviceIds
          .map((serviceId: string) => store.services.find((service: any) => service.id === serviceId))
          .filter(Boolean),
      };
    });

    if (!result) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
