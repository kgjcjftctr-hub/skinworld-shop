import Link from 'next/link';
import productsData from '@/data/products-data.json';
import { ProductClient } from './product-client';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = (productsData as any[]).find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 font-display text-3xl font-bold text-ink">Producto no encontrado</h1>
          <p className="mb-8 text-slate-600">Lo sentimos, el producto que buscas no existe.</p>
          <Link href="/tienda" className="btn btn-primary">
            Ir a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = (productsData as any[])
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}
