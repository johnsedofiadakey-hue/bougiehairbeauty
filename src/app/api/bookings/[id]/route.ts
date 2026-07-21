import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateStore } from '@/lib/data-store';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existed = await updateStore((store) => {
      const before = store.appointments.length;
      store.appointments = store.appointments.filter((apt) => apt.id !== id);
      return store.appointments.length < before;
    });

    if (!existed) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
