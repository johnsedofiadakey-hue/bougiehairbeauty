import { NextResponse } from 'next/server';
import { readStore } from '@/lib/data-store';

export async function GET() {
  try {
    const settings = (await readStore()).settings;
    // Return only public fields
    return NextResponse.json({
      companyName: settings?.companyName,
      logoUrl: settings?.logoUrl,
      currencySymbol: settings?.currencySymbol || "£",
      primaryColor: settings?.primaryColor,
      secondaryColor: settings?.secondaryColor,
      accentColor: settings?.accentColor,
      whatsappNumber: settings?.whatsappNumber,
      instagramUrl: settings?.instagramUrl,
      facebookUrl: settings?.facebookUrl,
      tiktokUrl: settings?.tiktokUrl,
      youtubeUrl: settings?.youtubeUrl,
      twitterUrl: settings?.twitterUrl,
      contactEmail: settings?.contactEmail,
      contactPhone: settings?.contactPhone,
      address: settings?.address,
      enableOTP: settings?.enableOTP || false,
      enableEmailLink: settings?.enableEmailLink || false,
      requireDeposit: settings?.requireDeposit || false,
      bankDetails: settings?.bankDetails,
      bankAccountName: settings?.bankAccountName,
      bookingPolicy: settings?.bookingPolicy,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
