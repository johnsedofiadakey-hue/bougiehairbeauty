import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { readStore, updateStore } from '@/lib/data-store';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Only admins or staff can generate balance links
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "STAFF")) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId, amount } = await request.json();

    if (!appointmentId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const store = await readStore();
    const appointment = store.appointments.find((item) => item.id === appointmentId);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // 1. Get Stripe Secret Key from environment
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    // IF NO KEY, simulate
    if (!STRIPE_SECRET_KEY) {
      console.warn("[STRIPE] No STRIPE_SECRET_KEY found. Simulating checkout session.");
      return NextResponse.json({
        success: true,
        simulated: true,
        checkout_url: `/booking/success?reference=SIMULATED_BALANCE_${Date.now()}&appointmentId=${appointmentId}`
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // 2. Create Stripe Checkout Session for the balance
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Service Balance — Bougie Hair & Beauty' },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in pence
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/booking/success?reference={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}&balance=true`,
      cancel_url: `${baseUrl}/portal`, // if they cancel, send them to their portal
      metadata: { appointmentId, isBalance: "true" },
    });

    return NextResponse.json({
      success: true,
      checkout_url: checkoutSession.url,
      reference: checkoutSession.id,
    });

  } catch (error) {
    console.error('[STRIPE_BALANCE_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
