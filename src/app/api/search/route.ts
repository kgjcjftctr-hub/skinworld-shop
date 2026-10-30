import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';
import { normalizar, puntuarBusqueda } from '@/lib/busqueda';
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 120) ?? '';
  if (query.length < 2) return NextResponse.json({ products: [], brands: [], categories: [] });
  try {
    const catalogo = await getAllProducts();
    const products = catalogo.map(p => ({ p, score: puntuarBusqueda(p, query) }))
      .filter((x): x is typeof x & { score: number } => x.score !== null)
      .sort((a,b) => a.score - b.score || a.p.name.localeCompare(b.p.name, 'es'))
      .slice(0, 12).map(({p}) => ({ id:p.id, name:p.name, slug:p.slug, price:p.priceWithIVA, image:p.image, brand:p.brand, presentation:p.variantLabel ?? p.presentation, inStock:Boolean(p.inStock) }));
    const values = (key:'brand'|'category') => Array.from(new Set(catalogo.map(p=>p[key]).filter((v):v is string=>Boolean(v && normalizar(v).includes(normalizar(query)))))).slice(0,5);
    return NextResponse.json({ products, brands: values('brand'), categories:values('category') });
  } catch { return NextResponse.json({ error:'No se pudo buscar' }, { status:503 }); }
}
