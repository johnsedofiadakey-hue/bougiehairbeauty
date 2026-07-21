import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateStore } from '@/lib/data-store';

function isAdminOrStaff(session: any) {
  return session && (session.user.role === "ADMIN" || session.user.role === "STAFF");
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrStaff(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await request.json();
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }

  await updateStore((store) => {
    store.pushSubscriptions = (store.pushSubscriptions || []).filter(
      (sub: any) => sub.endpoint !== subscription.endpoint
    );
    store.pushSubscriptions.push(subscription);
    return null;
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminOrStaff(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { endpoint } = await request.json();
  await updateStore((store) => {
    store.pushSubscriptions = (store.pushSubscriptions || []).filter((sub: any) => sub.endpoint !== endpoint);
    return null;
  });

  return NextResponse.json({ ok: true });
}
