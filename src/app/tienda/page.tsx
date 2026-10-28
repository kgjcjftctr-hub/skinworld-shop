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
  searchParams: Promise<{ categoria?: string; marca?: string; pagina?: string }>;
}) {
  const { categoria, marca, pagina } = await searchParams;
  const products = dedupeVariants(await getAllProducts());

  const initialCategories = categoria ? categoria.split(',').filter(Boolean) : [];
  const initialBrands = marca ? marca.split(',').filter(Boolean) : [];
  const categoryCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};
  for (const product of products) {
    if (product.category && product.category !== 'Productos') {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    }
    if (product.brand) brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
  }
  const categoryOptions = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const brandOptions = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const filtered = products.filter((product) =>
    (initialCategories.length === 0 || Boolean(product.category && initialCategories.includes(product.category))) &&
    (initialBrands.length === 0 || Boolean(product.brand && initialBrands.includes(product.brand)))
  );
  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const requestedPage = Number(pagina);
  const currentPage = Number.isSafeInteger(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;
  const visibleProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <ShopClient
      products={visibleProducts}
      totalProducts={filtered.length}
      currentPage={currentPage}
      totalPages={totalPages}
      categoryOptions={categoryOptions}
      brandOptions={brandOptions}
      initialCategories={initialCategories}
      initialBrands={initialBrands}
    />
  );
}
