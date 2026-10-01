import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

// Mismo orden que tenía la sección. Los nombres son exactamente las
// categorías del catálogo, porque de ellos depende el filtro de la tienda.
const necesidades = [
  'Acné',
  'Dermatitis',
  'Antiedad',
  'Manchas',
  'Cabello y Uñas',
  'Piel de Bebé',
  'Protección Solar',
  'Suplementos',
];

/**
 * Índice de necesidades de la piel: una lista tipográfica en lugar de ocho
 * cajas con íconos. Cada renglón lleva a la tienda ya filtrada y dice cuántos
 * productos hay, para que se lea de un vistazo dónde hay más opciones.
 */
export function CategoriesSection({ porCategoria }: { porCategoria: Record<string, number> }) {
  return (
    <section aria-labelledby="necesidades-titulo" className="sw-section border-t border-sw-border">
      <div className="sw-container grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="sw-label">Por necesidad</p>
          <h2 id="necesidades-titulo" className="mt-3 font-display text-sw-h2 font-semibold text-sw-ink">
            Encuentra soluciones por problema
          </h2>
          <p className="mt-5 max-w-sw-prose text-sw-body text-sw-muted">
            Navega el catálogo por lo que tu piel necesita. Todos los productos están avalados por
            criterio dermatológico profesional.
          </p>
          <Link href="/tienda" className="sw-link mt-6 inline-block">
            Ver todo el catálogo
          </Link>
        </div>

        <ul className="border-t border-sw-ink/80">
          {necesidades.map((nombre) => {
            const total = porCategoria[nombre] ?? 0;
            return (
              <li key={nombre} className="border-b border-sw-border">
                <Link
                  href={`/tienda?categoria=${encodeURIComponent(nombre)}`}
                  className="group flex min-h-[4rem] items-center gap-4 py-3 text-sw-ink sm:min-h-[5rem]"
                >
                  <span className="flex-1 font-display text-[1.5rem] font-semibold leading-tight transition-colors duration-sw-fast group-hover:text-sw-pink-deep sm:text-sw-h3">
                    {nombre}
                  </span>
                  <span className="text-sw-small tabular-nums text-sw-muted">
                    {total} {total === 1 ? 'producto' : 'productos'}
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-sw-pink-deep transition-transform duration-sw ease-sw group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
