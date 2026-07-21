import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions, verifyPassword } from "@/lib/auth";
import { updateStore } from '@/lib/data-store';

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newEmail, newPassword } = await request.json();
    const userId = (session.user as any).id;

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }
    if (!newEmail && !newPassword) {
      return NextResponse.json({ error: 'Provide a new email or new password to update' }, { status: 400 });
    }
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const result = await updateStore((store) => {
      const user = store.users.find((u) => u.id === userId);
      if (!user) return { error: 'Account not found', status: 404 };

      if (!verifyPassword(currentPassword, user.password)) {
        return { error: 'Current password is incorrect', status: 403 };
      }

      if (newEmail) {
        const normalizedEmail = newEmail.trim().toLowerCase();
        const emailTaken = store.users.some((u) => u.id !== userId && u.email.toLowerCase() === normalizedEmail);
        if (emailTaken) return { error: 'That email is already in use', status: 409 };
        user.email = normalizedEmail;
      }

      if (newPassword) {
        user.password = bcrypt.hashSync(newPassword, 10);
      }

      return { email: user.email };
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: Number(result.status) || 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ACCOUNT_PATCH]", error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
