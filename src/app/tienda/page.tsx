import { getAllProducts, dedupeVariants } from '@/lib/products';
import { ShopClient } from './shop-client';

export const metadata = {
  title: 'Tienda',
  description:
    'Catálogo completo de Skinworld: protectores solares, sérums, antimanchas y cuidado dermatológico seleccionado por la Dra. Karina Alfaro.',
  alternates: { canonical: '/tienda' },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; marca?: string }>;
}) {
  const { categoria, marca } = await searchParams;
  const products = dedupeVariants(await getAllProducts());

  const initialCategories = categoria ? categoria.split(',').filter(Boolean) : [];
  const initialBrands = marca ? marca.split(',').filter(Boolean) : [];

  return (
    <ShopClient
      products={products}
      initialCategories={initialCategories}
      initialBrands={initialBrands}
    />
  );
}
