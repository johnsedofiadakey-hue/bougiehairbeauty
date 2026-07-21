import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { readStore, updateStore } from '@/lib/data-store';

export async function POST(request: Request) {
  try {
    const { appointmentId, amount } = await request.json();

    if (!appointmentId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const store = await readStore();
    const appointment = store.appointments.find((item) => item.id === appointmentId);

    // 1. Get Stripe Secret Key from environment
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    // IF NO KEY, return a "SIMULATED" success for now so they can test the flow
    if (!STRIPE_SECRET_KEY) {
      console.warn("[STRIPE] No STRIPE_SECRET_KEY found. Simulating checkout session.");
      return NextResponse.json({
        success: true,
        simulated: true,
        checkout_url: `/booking/success?reference=SIMULATED_${Date.now()}&appointmentId=${appointmentId}`
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // 2. Create Stripe Checkout Session for the deposit
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Booking deposit — Bougie Hair & Beauty' },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in pence
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/booking/success?reference={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
      cancel_url: `${baseUrl}/booking`,
      metadata: { appointmentId },
    });

    // 3. Update appointment with payment reference
    await updateStore((store) => {
      const appt = store.appointments.find((item) => item.id === appointmentId);
      if (appt) appt.paymentRef = session.id;
    });

    return NextResponse.json({
      success: true,
      checkout_url: session.url,
      reference: session.id,
    });

  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
