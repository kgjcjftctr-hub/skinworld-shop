import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProductVariants } from '@/lib/products';
import { ProductClient } from './product-client';
import { URL_SITIO } from '@/lib/sitio';

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
    notFound();
  }

  const variants = await getProductVariants(product.variantGroup, product.slug);

  const precio = product.priceWithIVA;
  const datosEstructurados = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    url: `${URL_SITIO}/producto/${encodeURIComponent(product.slug)}`,
    ...(product.description ? { description: product.description } : {}),
    ...(product.image ? { image: product.image } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(typeof precio === 'number' && Number.isFinite(precio) && precio > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: precio,
            priceCurrency: 'MXN',
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${URL_SITIO}/producto/${encodeURIComponent(product.slug)}`,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados).replace(/</g, '\\u003c') }}
      />
      <ProductClient product={product} variants={variants} />
    </>
  );
}
