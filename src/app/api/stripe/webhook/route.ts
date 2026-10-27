import type Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';
import { formatPrice } from '@/utils';
import {
  avisarEtapaAlCliente,
  avisarPedidoNuevoALaTienda,
  avisarPedidoNoGuardado,
  confirmarPedidoAlCliente,
  type DireccionDeEnvio,
  type Pedido,
} from '@/lib/pedidos';
import { normalizarEstado, presentacionDe, transicionPermitida, type Estado } from '@/lib/estados-pedido';
import { ErrorDePedido, cambiarEstado, faltaMigracion, registrarCorreo, registrarNota } from '@/lib/pedidos-db';

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

/** Un renglón del cobro tal como se guarda en order_items. */
interface ArticuloCobrado {
  product_id: string | null;
  name: string;
  quantity: number;
  amount_total: number;
  presentation: string | null;
}

/**
 * Separa los productos del envío. El id del producto viaja en los metadatos de
 * cada renglón desde que se creó el cobro; los cobros anteriores no lo traen y
 * esos productos quedan sin relacionar, sin adivinar por el nombre.
 */
function articulosDe(lineas: Stripe.LineItem[]): ArticuloCobrado[] {
  const articulos: ArticuloCobrado[] = [];
  for (const li of lineas) {
    const producto = li.price?.product;
    const metadatos = producto && typeof producto === 'object' && !('deleted' in producto && producto.deleted)
      ? (producto as Stripe.Product).metadata
      : {};
    const nombre = li.description ?? 'Producto';
    if (!metadatos.product_id && nombre === 'Envío') continue;
    articulos.push({
      product_id: metadatos.product_id ?? null,
      name: nombre,
      quantity: li.quantity ?? 1,
      amount_total: (li.amount_total ?? 0) / 100,
      presentation: presentacionDe(nombre),
    });
  }
  return articulos;
}

const intentoDePago = (pago: string | Stripe.PaymentIntent | null) =>
  typeof pago === 'string' ? pago : pago?.id ?? null;

/** Guarda el pedido de una sesión pagada (o con pago pendiente) y manda los avisos. */
async function pedidoCompletado(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  let pedido: Pedido | null = null;

  // Primer bloque: guardar el pedido. Si algo falla aquí respondemos con un
  // error para que Stripe reintente; si respondiéramos 200, Stripe daría el
  // aviso por entregado y la venta se perdería sin dejar rastro.
  try {
    const supabase = getSupabase();
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ['data.price.product'],
    });
    const direccion = direccionDe(session.metadata);
    // OXXO o transferencia: la sesión termina antes de que el dinero llegue.
    const estado: Estado = session.payment_status === 'unpaid' ? 'pending_payment' : 'received';

    const datos = {
      stripe_session_id: session.id,
      stripe_payment_intent: intentoDePago(session.payment_intent),
      customer_email: session.customer_details?.email ?? null,
      customer_phone: direccion?.telefono ?? null,
      shipping_name: direccion?.nombre ?? null,
      shipping_address: direccion,
      amount_total: (session.amount_total ?? 0) / 100,
      currency: session.currency,
      status: estado,
      items: lineItems.data.map((li) => ({
        name: li.description ?? 'Producto',
        quantity: li.quantity ?? 1,
        amount_total: (li.amount_total ?? 0) / 100,
      })),
    };

    // registrar_pedido guarda el pedido, sus productos y el primer renglón del
    // historial en una sola transacción, y no duplica si Stripe reintenta.
    const { data: registro, error } = await supabase.rpc('registrar_pedido', {
      p_pedido: datos,
      p_articulos: articulosDe(lineItems.data),
      p_actor: 'stripe',
    });

    if (error && faltaMigracion(error)) {
      pedido = await guardarSinMigracion(datos);
    } else if (error) {
      throw new Error(error.message);
    } else if (!registro?.nuevo) {
      return NextResponse.json({ received: true, duplicado: true });
    } else {
      pedido = registro.pedido as Pedido;
    }
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
      const pendiente = pedido.status === 'pending_payment';
      const [tienda, cliente] = await Promise.all([
        avisarPedidoNuevoALaTienda(pedido),
        pendiente ? avisarEtapaAlCliente(pedido, 'pending_payment') : confirmarPedidoAlCliente(pedido),
      ]);
      if (!tienda.enviado) console.warn('Aviso de pedido a la tienda no enviado:', tienda.motivo);
      await registrarCorreo(pedido.id, pendiente ? 'pending_payment' : 'confirmacion', cliente);
    } catch (err) {
      console.error('Fallaron los avisos del pedido', pedido.id, err);
    }
  }

  return NextResponse.json({ received: true });
}

/**
 * Mientras no se corra la migración 003 el pedido se guarda como antes, sin
 * renglones ni historial, para no perder ventas si este código sale primero.
 */
async function guardarSinMigracion(datos: Record<string, unknown>) {
  const supabase = getSupabase();
  const { data: yaExiste, error: errorConsulta } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', datos.stripe_session_id as string)
    .maybeSingle();
  if (errorConsulta) throw new Error(errorConsulta.message);
  if (yaExiste) return null;

  const { stripe_payment_intent: _sinColumnaTodavia, ...fila } = datos;
  const { data, error } = await supabase.from('orders').insert(fila).select().maybeSingle();
  if (error) throw new Error(error.message);
  return data as Pedido | null;
}

async function pedidoDeSesion(sesion: string) {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sesion)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Pedido | null;
}

/** OXXO o transferencia: el pago se acreditó (o venció) después de terminar la sesión. */
async function pagoDiferido(session: Stripe.Checkout.Session, acreditado: boolean) {
  const pedido = await pedidoDeSesion(session.id);
  // Si el pedido aún no existe, el aviso de la sesión completada no ha llegado:
  // pedimos a Stripe que reintente más tarde.
  if (!pedido) return NextResponse.json({ error: 'Pedido aún no registrado', reintentar: true }, { status: 500 });
  if (pedido.status !== 'pending_payment') return NextResponse.json({ received: true, sinCambio: true });

  const a: Estado = acreditado ? 'received' : 'cancelled';
  const actualizado = await cambiarEstado({
    pedido: pedido.id,
    de: 'pending_payment',
    a,
    actor: 'stripe',
    nota: acreditado ? 'Stripe acreditó el pago.' : 'El pago no se completó a tiempo.',
  });

  const aviso = acreditado ? await confirmarPedidoAlCliente(actualizado) : await avisarEtapaAlCliente(actualizado, 'cancelled');
  await registrarCorreo(actualizado.id, acreditado ? 'confirmacion' : 'cancelled', aviso);
  if (acreditado) await avisarPedidoNuevoALaTienda(actualizado);
  return NextResponse.json({ received: true });
}

/**
 * Reembolso hecho en Stripe. Si se devolvió todo, el pedido pasa a
 * «Reembolsado»; si fue parcial sólo queda anotado en el historial, porque el
 * pedido puede seguir su curso.
 */
async function reembolso(cargo: Stripe.Charge) {
  const intento = intentoDePago(cargo.payment_intent);
  if (!intento) return NextResponse.json({ received: true });

  const supabase = getSupabase();
  let { data: pedido } = await supabase.from('orders').select('*').eq('stripe_payment_intent', intento).maybeSingle();
  if (!pedido) {
    // Pedidos guardados antes de que se registrara el intento de pago.
    const sesiones = await getStripe().checkout.sessions.list({ payment_intent: intento, limit: 1 });
    const sesion = sesiones.data[0];
    pedido = sesion ? await pedidoDeSesion(sesion.id) : null;
  }
  if (!pedido) return NextResponse.json({ received: true, sinPedido: true });

  const devuelto = cargo.amount_refunded / 100;
  const estado = normalizarEstado(pedido.status);
  if (!cargo.refunded) {
    await registrarNota(pedido.id, 'pago', 'stripe', `Reembolso parcial en Stripe: ${formatPrice(devuelto)} en total.`, {
      reembolsado: devuelto,
    });
    return NextResponse.json({ received: true });
  }
  if (estado === 'refunded' || !transicionPermitida(estado, 'refunded')) return NextResponse.json({ received: true, sinCambio: true });

  const actualizado = await cambiarEstado({
    pedido: pedido.id,
    de: pedido.status as Estado,
    a: 'refunded',
    actor: 'stripe',
    nota: `Reembolso completo en Stripe: ${formatPrice(devuelto)}.`,
  });
  await registrarCorreo(actualizado.id, 'refunded', await avisarEtapaAlCliente(actualizado, 'refunded'));
  return NextResponse.json({ received: true });
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

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        return await pedidoCompletado(event.data.object);
      case 'checkout.session.async_payment_succeeded':
        return await pagoDiferido(event.data.object, true);
      case 'checkout.session.async_payment_failed':
        return await pagoDiferido(event.data.object, false);
      case 'charge.refunded':
        return await reembolso(event.data.object);
      default:
        return NextResponse.json({ received: true });
    }
  } catch (err) {
    // Un cambio que la base rechaza por sus reglas no se arregla reintentando.
    if (err instanceof ErrorDePedido && err.status === 409) {
      console.warn('Aviso de Stripe sin efecto:', event.type, err.message);
      return NextResponse.json({ received: true, sinCambio: true });
    }
    console.error('Falló el aviso de Stripe', event.type, err);
    return NextResponse.json({ error: 'No se pudo procesar', reintentar: true }, { status: 500 });
  }
}
