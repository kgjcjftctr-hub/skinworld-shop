import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';

export function SkinworldEdit({ destacados }: { destacados: (Product & Record<string, any>)[] }) {
  if (destacados.length === 0) return null;
  const productos = destacados.slice(0, 4);

  return (
    <section aria-labelledby="edit-titulo" className="bg-sw-surface py-10 sm:py-12 lg:py-14">
      <div className="sw-container">
        <div className="flex items-center justify-between gap-4 border-b border-sw-ink/15 pb-4">
          <div>
            <p className="text-sm font-medium text-sw-muted">Selección de la Dra. Karina</p>
            <h2 id="edit-titulo" className="mt-0.5 font-display text-2xl font-semibold text-sw-ink sm:text-3xl">
              Destacados
            </h2>
          </div>
          <Link href="/tienda" className="sw-link shrink-0 text-sm sm:text-base">
            Ver tienda
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {productos.map((producto, index) => (
            <ProductCard verProducto key={producto.id} product={producto} prioritaria={index < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
