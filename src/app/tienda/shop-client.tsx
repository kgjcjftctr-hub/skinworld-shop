'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
  const filtrosActivos = [...selectedCategories, ...selectedBrands];

  return (
    <div className="pb-sw-section pt-10 sm:pt-14">
      <div className="sw-container">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-sw-border pb-6 sm:pb-8">
          <div>
            <p className="sw-label">Catálogo</p>
            <h1 className="mt-2 font-display text-sw-h1 font-semibold text-sw-ink">Tienda</h1>
            <p className="mt-3 text-sw-body text-sw-muted" aria-live="polite">
              {filteredProducts.length} producto{filteredProducts.length !== 1 && 's'} disponible
              {filteredProducts.length !== 1 && 's'}
              {filtrosActivos.length > 0 && (
                <>
                  {' '}en <span className="font-semibold text-sw-ink">{filtrosActivos.join(', ')}</span>
                  {'. '}
                  <Link href="/tienda" className="font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink">
                    Quitar filtros
                  </Link>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isDrawerOpen}
            className="sw-btn sw-btn-secondary h-11 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filtrar
            {filtrosActivos.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sw-pink-deep px-1.5 text-[0.6875rem] font-bold tabular-nums text-white">
                {filtrosActivos.length}
              </span>
            )}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[16.5rem_minmax(0,1fr)]">
          <aside aria-label="Filtros" className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-2">
              <Filters {...filterProps} />
            </div>
          </aside>

          <section aria-label="Productos">
            {filteredProducts.length === 0 ? (
              <div className="rounded-sw-lg border border-dashed border-sw-border px-6 py-16 text-center">
                <p className="font-display text-2xl text-sw-ink">No hay productos con estos filtros</p>
                <Link href="/tienda" className="sw-link mt-4 inline-block">
                  Ver todo el catálogo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} prioritaria={i < 4} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {isDrawerOpen && <CajonDeFiltros onClose={() => setIsDrawerOpen(false)} total={filteredProducts.length}>
        <Filters {...filterProps} />
      </CajonDeFiltros>}
    </div>
  );
}

/**
 * Panel de filtros del celular: diálogo que se cierra con Escape, con el
 * fondo o con el botón, bloquea el scroll de la página mientras está abierto
 * y devuelve el foco al botón que lo abrió.
 */
function CajonDeFiltros({
  onClose,
  total,
  children,
}: {
  onClose: () => void;
  total: number;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  // La función de cierre cambia en cada render del padre; se guarda en una
  // referencia para que el efecto corra una sola vez al abrir el panel.
  const cerrar = useRef(onClose);
  cerrar.current = onClose;

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar.current();
      if (e.key !== 'Tab') return;
      const enfocables = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!enfocables?.length) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previo?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filtros-titulo">
      <div className="absolute inset-0 bg-sw-ink/40 animate-fade-in" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-sw-warm-white shadow-sw-md animate-slide-in-right"
      >
        <div className="flex items-center justify-between border-b border-sw-border px-5 py-4">
          <h2 id="filtros-titulo" className="font-display text-xl font-semibold text-sw-ink">
            Filtrar
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sw-ink hover:bg-sw-pink-pale"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="border-t border-sw-border p-5">
          <button type="button" onClick={onClose} className="sw-btn sw-btn-primary h-12 w-full">
            Ver {total} producto{total !== 1 && 's'}
          </button>
        </div>
      </div>
    </div>
  );
}
