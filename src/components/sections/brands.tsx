import Link from 'next/link';
import Image from 'next/image';
import type { MarcaDelEscaparate } from '@/lib/escaparate';

const LOGOTIPOS: Record<string, { archivo: string; ancho: number; alto: number; cuadrado?: boolean }> = {
  isdin: { archivo: 'isdin-icon.png', ancho: 260, alto: 260, cuadrado: true },
  larocheposay: { archivo: 'larocheposay.png', ancho: 200, alto: 51 },
  bioderma: { archivo: 'bioderma.png', ancho: 480, alto: 95 },
  avene: { archivo: 'avene.png', ancho: 244, alto: 100 },
  vichy: { archivo: 'vichy.svg', ancho: 161, alto: 47 },
  uriage: { archivo: 'uriage.svg', ancho: 123, alto: 38 },
  sesderma: { archivo: 'sesderma.svg', ancho: 215, alto: 85 },
  eucerin: { archivo: 'eucerin.svg', ancho: 209, alto: 78 },
};

function claveMarca(nombre: string) {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/** Acceso directo por laboratorio: muestra marcas con logo, sin productos aleatorios ni el listado completo. */
export function BrandsSection({ marcas }: { marcas: MarcaDelEscaparate[] }) {
  const visibles = marcas
    .filter((marca) => Boolean(LOGOTIPOS[claveMarca(marca.nombre)]))
    .slice(0, 8);

  if (visibles.length === 0) return null;

  return (
    <section aria-labelledby="marcas-titulo" className="bg-sw-charcoal py-10 text-sw-cream sm:py-12 lg:py-14">
      <div className="sw-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-sw-pink">Laboratorios</p>
            <h2 id="marcas-titulo" className="mt-1 font-display text-2xl font-semibold text-sw-cream sm:text-3xl">
              Explora por marca
            </h2>
          </div>
          <Link href="/tienda" className="sw-link shrink-0 text-sm text-sw-cream sm:text-base">
            Todas las marcas
          </Link>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {visibles.map((marca) => {
            const logo = LOGOTIPOS[claveMarca(marca.nombre)];
            return (
              <li key={marca.nombre}>
                <Link
                  href={`/tienda?marca=${encodeURIComponent(marca.nombre)}`}
                  aria-label={`Ver productos de ${marca.nombre}`}
                  className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-sw border border-sw-border bg-sw-warm-white px-3 py-4 text-center transition-[border-color,transform] duration-sw-fast hover:-translate-y-0.5 hover:border-sw-pink-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sw-pink"
                >
                  <Image
                    src={`/images/laboratorios/${logo.archivo}`}
                    alt=""
                    width={logo.ancho}
                    height={logo.alto}
                    className={logo.cuadrado ? 'h-12 w-12 object-contain' : 'h-10 w-auto max-w-40 object-contain sm:h-12'}
                    loading="lazy"
                  />
                  <span className="text-xs font-medium text-sw-muted transition-colors group-hover:text-sw-pink-deep">
                    Ver productos
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
