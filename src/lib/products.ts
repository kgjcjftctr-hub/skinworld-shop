import 'server-only';
import { getSupabase } from '@/lib/supabase';
import type { Product } from '@/types';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  brand: string | null;
  sku: string | null;
  image: string | null;
  images: string[] | null;
  category: string | null;
  problem_type: string | null;
  product_type: string | null;
  ingredients: string | null;
  instructions: string | null;
  presentation: string | null;
  variant_group: string | null;
  variant_label: string | null;
  in_stock: boolean;
  featured: boolean;
  price_with_iva: number;
  compare_at_price_with_iva: number | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: ProductRow): Product & Record<string, any> {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description ?? undefined,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    priceWithIVA: Number(row.price_with_iva),
    compareAtPriceWithIVA:
      row.compare_at_price_with_iva != null ? Number(row.compare_at_price_with_iva) : undefined,
    brand: row.brand ?? undefined,
    sku: row.sku ?? undefined,
    image: row.image ?? undefined,
    images: row.images ?? [],
    category: row.category ?? undefined,
    problemType: row.problem_type ?? undefined,
    productType: row.product_type ?? undefined,
    ingredients: row.ingredients ? [row.ingredients] : undefined,
    instructions: row.instructions ?? undefined,
    presentation: row.presentation ?? undefined,
    variantGroup: row.variant_group ?? undefined,
    variantLabel: row.variant_label ?? undefined,
    inStock: row.in_stock ? 1 : 0,
    featured: row.featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }

  return (data as ProductRow[]).map(mapRow);
}

export async function getProductBySlug(slug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as ProductRow);
}

export async function getFeaturedProducts() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }

  return (data as ProductRow[]).map(mapRow);
}

export async function getRelatedProducts(category: string | undefined, excludeSlug: string) {
  if (!category) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .neq('slug', excludeSlug)
    .limit(8);

  if (error) return [];
  return dedupeVariants((data as ProductRow[]).map(mapRow)).slice(0, 4);
}

export async function getProductVariants(variantGroup: string | undefined, excludeSlug: string) {
  if (!variantGroup) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('variant_group', variantGroup)
    .neq('slug', excludeSlug)
    .order('price', { ascending: true });

  if (error) return [];
  return (data as ProductRow[]).map(mapRow);
}

// Cuando varios productos son el mismo pero en distinta presentación (sabor,
// tono, tamaño, concentración), sólo mostramos uno en listados de catálogo;
// las demás opciones aparecen como variantes dentro de la página del producto.
export function dedupeVariants(products: Product[]): Product[] {
  const seenGroups = new Set<string>();
  const result: Product[] = [];
  for (const product of products) {
    if (product.variantGroup) {
      if (seenGroups.has(product.variantGroup)) continue;
      seenGroups.add(product.variantGroup);
    }
    result.push(product);
  }
  return result;
}

export async function getCategoryCounts() {
  const products = dedupeVariants(await getAllProducts());
  return products.reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
}
