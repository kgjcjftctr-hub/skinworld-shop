import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const price = Number(body.price);

  if (!name || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'Nombre y precio son obligatorios' }, { status: 400 });
  }

  const compareAtPrice =
    body.compareAtPrice !== '' && body.compareAtPrice != null ? Number(body.compareAtPrice) : null;
  const priceWithIVA = Math.round(price * 1.16);
  const compareAtPriceWithIVA = compareAtPrice ? Math.round(compareAtPrice * 1.16) : null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .update({
      name,
      slug: typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : undefined,
      description: body.description ?? '',
      short_description: body.shortDescription || null,
      price,
      compare_at_price: compareAtPrice,
      brand: body.brand || null,
      sku: body.sku || null,
      image: body.image || null,
      images: body.image ? [body.image] : [],
      category: body.category || null,
      in_stock: body.inStock !== false,
      featured: Boolean(body.featured),
      price_with_iva: priceWithIVA,
      compare_at_price_with_iva: compareAtPriceWithIVA,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 400 });
  }

  return NextResponse.json({ product: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
