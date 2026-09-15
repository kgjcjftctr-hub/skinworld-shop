import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 100;

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
  const cartItems = Array.isArray(body?.items) ? body.items : [];
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

  const supabase = getSupabase();
  const ids = cartItems.map((item: any) => item.id).filter(Boolean);
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
  const line_items: any[] = [];

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
          images: product.image ? [product.image] : undefined,
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

  if (subtotal <= FREE_SHIPPING_THRESHOLD) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'mxn',
        unit_amount: SHIPPING_COST * 100,
        product_data: { name: 'Envío' },
      },
    });
  }

  const origin = request.headers.get('origin') || `https://${request.headers.get('host')}`;

  try {
    const stripe = getStripe();
    // Sin `payment_method_types`, Stripe muestra automáticamente todos los
    // métodos habilitados en el Dashboard (tarjetas, Apple Pay, Google Pay, etc.).
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata: {
        shipping_address: JSON.stringify(shippingAddress).slice(0, 500),
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
