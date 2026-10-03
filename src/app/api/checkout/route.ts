import type Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';
import { origenSeguro } from '@/lib/sitio';
import { COSTO_DE_ENVIO } from '@/lib/envio';

interface ArticuloDelCarrito {
  id: string;
  cartQuantity?: number;
}

const REQUIRED_ADDRESS_FIELDS = [
  'nombre',
  'telefono',
  'codigoPostal',
  'estado',
  'municipio',
  'colonia',
  'calle',
  'numeroExterior',
];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const cartItems: ArticuloDelCarrito[] = Array.isArray(body?.items)
    ? body.items.filter((item: unknown): item is ArticuloDelCarrito =>
        typeof item === 'object' && item !== null && typeof (item as ArticuloDelCarrito).id === 'string'
      )
    : [];
  const shippingAddress = body?.shippingAddress;

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
  }

  const missingField = REQUIRED_ADDRESS_FIELDS.find(
    (field) => !shippingAddress || !String(shippingAddress[field] ?? '').trim()
  );
  if (missingField) {
    return NextResponse.json({ error: 'Falta completar la dirección de envío' }, { status: 400 });
  }

  const origin = origenSeguro(request);

  // Stripe sólo acepta URLs absolutas para las imágenes; varias fotos del
  // catálogo se guardan como ruta del sitio (/images/...), así que las
  // completamos con el dominio y descartamos cualquier otra cosa.
  const imagenParaStripe = (image: string | null | undefined) => {
    if (!image) return undefined;
    if (/^https?:\/\//i.test(image)) return [image];
    if (image.startsWith('/')) return [`${origin}${image}`];
    return undefined;
  };

  const campo = (valor: unknown) => String(valor ?? '').trim().slice(0, 500);

  const supabase = getSupabase();
  const ids = cartItems.map((item) => item.id).filter(Boolean);
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, description, image, price_with_iva, in_stock')
    .in('id', ids);

  if (error || !products) {
    console.error('Checkout product lookup failed:', error);
    return NextResponse.json({ error: 'Error al validar los productos' }, { status: 500 });
  }

  // Los precios y disponibilidad SIEMPRE se toman de la base de datos,
  // nunca de lo que mande el cliente, para evitar manipulación de precios.
  let subtotal = 0;
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.id);
    if (!product || !product.in_stock) continue;

    const quantity = Math.max(1, Math.min(99, Math.round(Number(item.cartQuantity)) || 1));
    const unitAmount = Math.round(Number(product.price_with_iva) * 100);
    subtotal += (unitAmount / 100) * quantity;

    line_items.push({
      quantity,
      price_data: {
        currency: 'mxn',
        unit_amount: unitAmount,
        product_data: {
          name: product.name,
          description: product.description ? product.description.slice(0, 500) : undefined,
          images: imagenParaStripe(product.image),
        },
      },
    });
  }

  if (line_items.length === 0) {
    return NextResponse.json(
      { error: 'Los productos del carrito ya no están disponibles' },
      { status: 400 }
    );
  }

  // El envío cuesta lo mismo siempre, sin importar el total ni el destino.
  line_items.push({
    quantity: 1,
    price_data: {
      currency: 'mxn',
      unit_amount: COSTO_DE_ENVIO * 100,
      product_data: { name: 'Envío' },
    },
  });

  try {
    const stripe = getStripe();
    // Sin `payment_method_types`, Stripe muestra automáticamente todos los
    // métodos habilitados en el Dashboard (tarjetas, Apple Pay, Google Pay, etc.).
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      // Cada dato va en su propia llave: Stripe corta cualquier valor de más
      // de 500 caracteres, y una dirección larga completa rebasaba ese límite
      // cuando se mandaba como un solo texto.
      metadata: {
        envio_nombre: campo(shippingAddress.nombre),
        envio_telefono: campo(shippingAddress.telefono),
        envio_cp: campo(shippingAddress.codigoPostal),
        envio_estado: campo(shippingAddress.estado),
        envio_municipio: campo(shippingAddress.municipio),
        envio_colonia: campo(shippingAddress.colonia),
        envio_calle: campo(shippingAddress.calle),
        envio_numero_exterior: campo(shippingAddress.numeroExterior),
        envio_numero_interior: campo(shippingAddress.numeroInterior),
        envio_referencias: campo(shippingAddress.referencias),
      },
      success_url: `${origin}/pedido-confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrito`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return NextResponse.json({ error: 'Error al iniciar el pago' }, { status: 500 });
  }
}
