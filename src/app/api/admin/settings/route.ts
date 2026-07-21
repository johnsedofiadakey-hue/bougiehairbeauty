import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';
import { readStore, updateStore } from '@/lib/data-store';

// Only these fields may be written via the settings API — keeps a PATCH
// request from injecting arbitrary keys (e.g. overwriting `id`) into the
// single shared settings object.
const EDITABLE_SETTINGS_FIELDS = [
  "companyName",
  "logoUrl",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "textPrimaryColor",
  "textSecondaryColor",
  "fontFamily",
  "heroTitle",
  "heroSubtitle",
  "heroImage",
  "heroVideoUrl",
  "heroBackgroundImage",
  "heroMediaType",
  "aboutHeading",
  "aboutImage",
  "aboutIntro",
  "aboutBody",
  "aboutBadgeNumber",
  "aboutBadgeLabel",
  "contactEmail",
  "contactPhone",
  "address",
  "whatsappNumber",
  "instagramUrl",
  "facebookUrl",
  "tiktokUrl",
  "youtubeUrl",
  "twitterUrl",
  "currencySymbol",
  "stripePublishableKey",
  "enableOTP",
  "requireDeposit",
  "bankDetails",
  "bankAccountName",
  "bookingPolicy",
] as const;

function pickEditableSettings(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_SETTINGS_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  return update;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = (await readStore()).settings;
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const update = pickEditableSettings(body);

    const settings = await updateStore((store) => {
      store.settings = {
        ...store.settings,
        ...update,
        id: 1,
        updatedAt: new Date().toISOString(),
      };
      return store.settings;
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin', 'layout');

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
