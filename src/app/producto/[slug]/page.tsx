import type { Metadata } from 'next';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts, getProductVariants } from '@/lib/products';
import { ProductClient } from './product-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Producto no encontrado', robots: { index: false } };
  }

  const titulo = product.brand ? `${product.name} · ${product.brand}` : product.name;
  const descripcion = (product.description ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300) ||
    `${product.name} en Skinworld, seleccionado bajo criterio dermatológico.`;
  const ruta = `/producto/${encodeURIComponent(product.slug)}`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: 'website',
      url: ruta,
      title: titulo,
      description: descripcion,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const product = await getProductBySlug(slug);

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

  const [relatedProducts, variants] = await Promise.all([
    getRelatedProducts(product.category, product.slug),
    getProductVariants(product.variantGroup, product.slug),
  ]);

  return <ProductClient product={product} relatedProducts={relatedProducts} variants={variants} />;
}
