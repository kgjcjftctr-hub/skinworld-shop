import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

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

  const slug = (typeof body.slug === 'string' && body.slug.trim()) || slugify(name);
  // El admin captura el precio con IVA incluido (es el que ve el cliente en la
  // tienda); `price` guarda la base sin IVA, como el resto del catálogo.
  const priceWithIVA = Math.round(price);
  const basePrice = Math.round(priceWithIVA / 1.16);
  const compareAtPriceWithIVA = compareAtPrice != null ? Math.round(compareAtPrice) : null;
  const baseCompareAtPrice =
    compareAtPriceWithIVA != null ? Math.round(compareAtPriceWithIVA / 1.16) : null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .insert({
      id: randomUUID(),
      name,
      slug,
      description: body.description ?? '',
      short_description: body.shortDescription || null,
      price: basePrice,
      compare_at_price: baseCompareAtPrice,
      brand: body.brand || null,
      sku: body.sku || null,
      image: body.image || null,
      images: body.image ? [body.image] : [],
      category: body.category || null,
      variant_group: body.variantGroup || null,
      variant_label: body.variantLabel || null,
      in_stock: body.inStock !== false,
      featured: Boolean(body.featured),
      price_with_iva: priceWithIVA,
      compare_at_price_with_iva: compareAtPriceWithIVA,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create product:', error);
    const message = error.code === '23505' ? 'Ya existe un producto con ese slug' : 'Error al crear el producto';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
