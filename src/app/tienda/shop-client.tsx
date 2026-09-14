'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Filters } from '@/components/filters';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';

export function ShopClient({
  products,
  initialCategories,
  initialBrands,
}: {
  products: (Product & Record<string, any>)[];
  initialCategories: string[];
  initialBrands: string[];
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const selectedCategories = initialCategories;
  const selectedBrands = initialBrands;

  const { categoryOptions, brandOptions } = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};

    for (const p of products) {
      if (p.category && p.category !== 'Productos') {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
      if (p.brand) {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      }
    }

    return {
      categoryOptions: Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      brandOptions: Object.entries(brandCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategories.length > 0) {
      result = result.filter((p) => p.category && selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    return result;
  }, [products, selectedCategories, selectedBrands]);

  const filterProps = { selectedCategories, selectedBrands, categoryOptions, brandOptions };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="mb-3 font-display text-4xl font-bold text-ink">Tienda</h1>
            <p className="text-slate-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'} disponible
              {filteredProducts.length !== 1 && 's'}
            </p>
          </div>

          {/* Mobile filter trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-ink/20 px-4 py-2.5 font-accent text-sm font-semibold text-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Ver Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-28">
              <Filters {...filterProps} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-slate-600">No hay productos con estos filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-xl animate-slide-in-right">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Filtrar</h2>
              <button onClick={() => setIsDrawerOpen(false)} aria-label="Cerrar">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Filters {...filterProps} />
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="btn btn-primary mt-6 w-full"
            >
              Ver {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
