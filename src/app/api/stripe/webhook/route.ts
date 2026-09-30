import type Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';
import {
  avisarPedidoNuevoALaTienda,
  avisarPedidoNoGuardado,
  confirmarPedidoAlCliente,
  type DireccionDeEnvio,
  type Pedido,
} from '@/lib/pedidos';

/** Arma la dirección a partir de los datos que viajaron en la sesión de pago. */
function direccionDe(metadata: Stripe.Metadata | null): DireccionDeEnvio | null {
  const datos = metadata ?? {};

  if (datos.envio_calle) {
    return {
      nombre: datos.envio_nombre ?? '',
      telefono: datos.envio_telefono ?? '',
      codigoPostal: datos.envio_cp ?? '',
      estado: datos.envio_estado ?? '',
      municipio: datos.envio_municipio ?? '',
      colonia: datos.envio_colonia ?? '',
      calle: datos.envio_calle,
      numeroExterior: datos.envio_numero_exterior ?? '',
      numeroInterior: datos.envio_numero_interior ?? '',
      referencias: datos.envio_referencias ?? '',
    };
  }

  // Formato anterior: la dirección iba como un solo texto JSON.
  if (datos.shipping_address) {
    try {
      return JSON.parse(datos.shipping_address) as DireccionDeEnvio;
    } catch {
      return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  let pedido: Pedido | null = null;

  // Primer bloque: guardar el pedido. Si algo falla aquí respondemos con un
  // error para que Stripe reintente; si respondiéramos 200, Stripe daría el
  // aviso por entregado y la venta se perdería sin dejar rastro.
  try {
    const supabase = getSupabase();
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const direccion = direccionDe(session.metadata);

    // Stripe reintenta cuando no recibe respuesta, así que comprobamos que ese
    // pago no esté ya registrado antes de volver a guardarlo.
    const { data: yaExiste, error: errorConsulta } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (errorConsulta) throw new Error(errorConsulta.message);
    if (yaExiste) {
      return NextResponse.json({ received: true, duplicado: true });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        customer_email: session.customer_details?.email ?? null,
        customer_phone: direccion?.telefono ?? null,
        shipping_name: direccion?.nombre ?? null,
        shipping_address: direccion,
        amount_total: (session.amount_total ?? 0) / 100,
        currency: session.currency,
        status: 'paid',
        items: lineItems.data.map((li) => ({
          name: li.description ?? 'Producto',
          quantity: li.quantity ?? 1,
          amount_total: (li.amount_total ?? 0) / 100,
        })),
      })
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    pedido = data as Pedido | null;
  } catch (err) {
    console.error('No se pudo guardar el pedido de la sesión', session.id, err);
    // El aviso a la tienda es el que convierte el fallo en algo accionable:
    // sin él, un pago cobrado sin pedido pasaría inadvertido hasta el cierre.
    await avisarPedidoNoGuardado(session.id, err).catch(() => {});
    return NextResponse.json(
      { error: 'No se pudo registrar el pedido', reintentar: true },
      { status: 500 }
    );
  }

  // Segundo bloque: los avisos. El pedido ya está guardado, así que un correo
  // que falle no debe provocar que Stripe reintente y duplique los correos.
  if (pedido) {
    try {
      const avisos = await Promise.all([
        avisarPedidoNuevoALaTienda(pedido),
        confirmarPedidoAlCliente(pedido),
      ]);
      for (const aviso of avisos) {
        if (!aviso.enviado) console.warn('Aviso de pedido no enviado:', aviso.motivo);
      }
    } catch (err) {
      console.error('Fallaron los avisos del pedido', pedido.id, err);
    }
  }

  return NextResponse.json({ received: true });
}
