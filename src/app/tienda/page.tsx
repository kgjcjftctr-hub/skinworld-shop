import { getAllProducts } from '@/lib/products';
import { ShopClient } from './shop-client';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; marca?: string }>;
}) {
  const { categoria, marca } = await searchParams;
  const products = await getAllProducts();

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
