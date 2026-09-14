import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma' }, { status: 400 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const supabase = getSupabase();

      await supabase.from('orders').insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email ?? null,
        amount_total: session.amount_total / 100,
        currency: session.currency,
        status: 'paid',
        items: lineItems.data.map((li) => ({
          name: li.description,
          quantity: li.quantity,
          amount_total: (li.amount_total ?? 0) / 100,
        })),
      });
    } catch (err) {
      console.error('Failed to record order:', err);
    }
  }

  return NextResponse.json({ received: true });
}
