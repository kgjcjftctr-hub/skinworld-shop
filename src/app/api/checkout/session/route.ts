import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Falta session_id' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      amountTotal: session.amount_total != null ? session.amount_total / 100 : null,
      email: session.customer_details?.email ?? null,
    });
  } catch (err) {
    console.error('Failed to retrieve checkout session:', err);
    return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 500 });
  }
}
