import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products-data.json';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [], brands: [], categories: [] });
  }

  try {
    const searchTerm = query.toLowerCase();

    const products = (productsData as any[])
      .filter((p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.image,
        brand: p.brand,
      }));

    const brandsSet = new Set(
      (productsData as any[])
        .filter((p) => p.brand?.toLowerCase().includes(searchTerm))
        .map((p) => p.brand)
        .filter(Boolean)
    );

    const categoriesSet = new Set(
      (productsData as any[])
        .filter((p) => p.category?.toLowerCase().includes(searchTerm))
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
