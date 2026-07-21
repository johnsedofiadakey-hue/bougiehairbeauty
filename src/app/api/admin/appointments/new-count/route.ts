import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { readStore } from '@/lib/data-store';

// Backs the admin sidebar badge — counts bookings created after `since`
// (a client-held "last viewed" timestamp, not server state, since this is
// a single-studio/small-staff app and doesn't need per-admin read tracking).
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF") {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const since = new URL(request.url).searchParams.get('since');
  const sinceDate = since ? new Date(since) : new Date(0);

  const store = await readStore();
  const count = store.appointments.filter((apt: any) => new Date(apt.createdAt) > sinceDate).length;

  return NextResponse.json({ count });
}
