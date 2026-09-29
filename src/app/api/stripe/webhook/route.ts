import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';
import {
  avisarPedidoNuevoALaTienda,
  confirmarPedidoAlCliente,
  type Pedido,
} from '@/lib/pedidos';

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

      const metadata = session.metadata ?? {};
      let shippingAddress: any = null;

      if (metadata.envio_calle) {
        shippingAddress = {
          nombre: metadata.envio_nombre ?? '',
          telefono: metadata.envio_telefono ?? '',
          codigoPostal: metadata.envio_cp ?? '',
          estado: metadata.envio_estado ?? '',
          municipio: metadata.envio_municipio ?? '',
          colonia: metadata.envio_colonia ?? '',
          calle: metadata.envio_calle,
          numeroExterior: metadata.envio_numero_exterior ?? '',
          numeroInterior: metadata.envio_numero_interior ?? '',
          referencias: metadata.envio_referencias ?? '',
        };
      } else if (metadata.shipping_address) {
        // Formato anterior: la dirección iba como un solo texto JSON.
        try {
          shippingAddress = JSON.parse(metadata.shipping_address);
        } catch {
          shippingAddress = null;
        }
      }

      // Stripe reintenta el aviso cuando no recibe respuesta, así que primero
      // revisamos que ese pago no esté ya registrado: si no, el mismo pedido
      // se guardaría dos veces y el cliente recibiría dos correos.
      const { data: yaExiste } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_session_id', session.id)
        .maybeSingle();

      if (yaExiste) {
        return NextResponse.json({ received: true, duplicado: true });
      }

      const { data: pedido, error: errorPedido } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email ?? null,
          customer_phone: shippingAddress?.telefono ?? null,
          shipping_name: shippingAddress?.nombre ?? null,
          shipping_address: shippingAddress,
          amount_total: session.amount_total / 100,
          currency: session.currency,
          status: 'paid',
          items: lineItems.data.map((li) => ({
            name: li.description,
            quantity: li.quantity,
            amount_total: (li.amount_total ?? 0) / 100,
          })),
        })
        .select()
        .maybeSingle();

      if (errorPedido) throw new Error(errorPedido.message);

      // Un correo que falla no debe tumbar el webhook: el pedido ya quedó
      // guardado y se ve en el panel.
      if (pedido) {
        const avisos = await Promise.all([
          avisarPedidoNuevoALaTienda(pedido as Pedido),
          confirmarPedidoAlCliente(pedido as Pedido),
        ]);
        for (const aviso of avisos) {
          if (!aviso.enviado) console.warn('Aviso de pedido no enviado:', aviso.motivo);
        }
      }
    } catch (err) {
      console.error('Failed to record order:', err);
    }
  }

  return NextResponse.json({ received: true });
}
