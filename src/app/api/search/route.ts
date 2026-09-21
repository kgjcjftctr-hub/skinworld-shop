import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';

// Quita acentos para que "avene" encuentre "Avène", "protección" encuentre
// "proteccion", etc. — sin esto, buscar sin acentos (lo más común al
// escribir en un teléfono) no encontraba nada.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [], brands: [], categories: [] });
  }

  try {
    const searchTerm = normalize(query);
    const productsData = await getAllProducts();

    const products = productsData
      .filter(
        (p) =>
          normalize(p.name).includes(searchTerm) ||
          (p.description && normalize(p.description).includes(searchTerm)) ||
          (p.brand && normalize(p.brand).includes(searchTerm))
      )
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.priceWithIVA,
        image: p.image,
        brand: p.brand,
      }));

    const brandsSet = new Set(
      productsData
        .filter((p) => p.brand && normalize(p.brand).includes(searchTerm))
        .map((p) => p.brand)
        .filter(Boolean)
    );

    const categoriesSet = new Set(
      productsData
        .filter((p) => p.category && normalize(p.category).includes(searchTerm))
        .map((p) => p.category)
        .filter(Boolean)
    );

    return NextResponse.json({
      products,
      brands: Array.from(brandsSet).slice(0, 5),
      categories: Array.from(categoriesSet).slice(0, 5),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
