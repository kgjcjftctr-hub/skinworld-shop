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
      <div className="sw-container py-sw-section text-center">
        <h1 className="font-display text-sw-h2 font-semibold text-sw-ink">Producto no encontrado</h1>
        <p className="mx-auto mt-4 max-w-sw-prose text-sw-body text-sw-muted">
          Este producto ya no está en el catálogo o la dirección cambió.
        </p>
        <Link href="/tienda" className="sw-btn sw-btn-primary mt-8 h-12">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const [relatedProducts, variants] = await Promise.all([
    getRelatedProducts(product.category, product.slug),
    getProductVariants(product.variantGroup, product.slug),
  ]);

  return <ProductClient product={product} relatedProducts={relatedProducts} variants={variants} />;
}
