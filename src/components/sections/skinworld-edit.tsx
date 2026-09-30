import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/types';

/**
 * Skinworld Edit: la selección que la Dra. Karina marca como destacada en el
 * panel (campo "featured"). No se elige nada desde aquí ni se escriben
 * recomendaciones médicas: cambiar la selección es cambiar ese campo.
 *
 * EDICION es el número de la selección vigente. Cuando la doctora defina un
 * tema para la edición, se puede agregar como TEMA; mientras sea null, la
 * sección solo dice que es su selección.
 */
const EDICION = '001';
const TEMA: string | null = null;

export function SkinworldEdit({ destacados }: { destacados: (Product & Record<string, any>)[] }) {
  if (destacados.length === 0) return null;
  const [principal, ...resto] = destacados;

  return (
    <section aria-labelledby="edit-titulo" className="sw-section bg-sw-surface">
      <div className="sw-container">
        <div className="grid gap-6 border-b border-sw-ink/15 pb-8 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-10">
          <p
            aria-hidden
            className="font-display text-[clamp(4.5rem,3rem+7vw,9rem)] font-semibold leading-[0.8] tracking-tight text-sw-pink"
          >
            {EDICION}
          </p>
          <div className="max-w-2xl">
            <p className="sw-label">Skinworld Edit {EDICION}{TEMA ? `, ${TEMA}` : ''}</p>
            <h2 id="edit-titulo" className="mt-2 font-display text-sw-h2 font-semibold text-sw-ink">
              Seleccionados por la Dra. Karina
            </h2>
            <p className="mt-3 text-sw-body text-sw-muted">
              Los productos más recomendados por criterio dermatológico profesional.
            </p>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <ProductCard product={principal} variante="destacada" />
        </div>

        {resto.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 border-t border-sw-ink/15 pt-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {resto.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        )}

        <Link href="/tienda" className="sw-link mt-12 inline-block">
          Ver todos los productos
        </Link>
      </div>
    </section>
  );
}
