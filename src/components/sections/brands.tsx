import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ImagenProducto } from '@/components/imagen-producto';
import type { MarcaDelEscaparate } from '@/lib/escaparate';
import { cn } from '@/utils';

const enlaceDeMarca = (nombre: string) => `/tienda?marca=${encodeURIComponent(nombre)}`;
const productos = (n: number) => `${n} ${n === 1 ? 'producto' : 'productos'}`;
// Evita que "LA ROCHE-POSAY" se parta en el guion: un word joiner (U+2060)
// después del guion quita ese punto de corte sin cambiar lo que se ve.
const sinCorteEnGuion = (nombre: string) => nombre.replace(/-/g, '-\u2060');

/**
 * Los laboratorios de la tienda, calculados del catálogo. Es el momento de
 * contraste de la página: fondo carbón, el nombre de cada laboratorio a gran
 * escala y una foto real de uno de sus productos. No se usan logotipos ni
 * campañas de las marcas, porque no hay material autorizado para eso.
 */
export function BrandsSection({ marcas }: { marcas: MarcaDelEscaparate[] }) {
  if (marcas.length === 0) return null;

  const principales = marcas.slice(0, 4);
  const resto = marcas.slice(4);

  return (
    <section aria-labelledby="marcas-titulo" className="sw-section bg-sw-charcoal text-sw-cream">
      <div className="sw-container">
        <div className="max-w-2xl">
          <p className="font-sans text-sw-small font-semibold text-sw-pink">Laboratorios</p>
          <h2 id="marcas-titulo" className="mt-3 font-display text-sw-h2 font-semibold text-sw-cream">
            Los laboratorios que trabajamos
          </h2>
          <p className="mt-4 text-sw-body text-sw-cream-muted">
            {marcas.length} laboratorios dermatológicos en la tienda. Cada uno lleva a su catálogo
            completo.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {principales.map((marca, i) => (
            <li
              key={marca.nombre}
              className={cn(
                i === 0 && 'col-span-2 lg:row-span-2',
                i === 3 && 'col-span-2'
              )}
            >
              <BloqueDeMarca marca={marca} grande={i === 0} ancho={i === 3} />
            </li>
          ))}
        </ul>

        {resto.length > 0 && (
          <div className="mt-12 border-t border-sw-cream/15 pt-8">
            <h3 className="text-sw-small font-semibold text-sw-cream-muted">Más laboratorios</h3>
            <ul className="mt-5 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {resto.map((marca) => (
                <li key={marca.nombre} className="border-b border-sw-cream/10">
                  <Link
                    href={enlaceDeMarca(marca.nombre)}
                    className="group flex min-h-[3.25rem] items-baseline justify-between gap-4 py-3 text-sw-cream"
                  >
                    <span className="font-display text-xl transition-colors duration-sw-fast group-hover:text-sw-pink">
                      {sinCorteEnGuion(marca.nombre)}
                    </span>
                    <span className="text-sw-small tabular-nums text-sw-cream-muted">
                      {productos(marca.productos)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function BloqueDeMarca({
  marca,
  grande,
  ancho,
}: {
  marca: MarcaDelEscaparate;
  grande: boolean;
  ancho: boolean;
}) {
  return (
    <Link
      href={enlaceDeMarca(marca.nombre)}
      className={cn(
        'group relative flex h-full overflow-hidden rounded-sw bg-sw-white text-sw-ink',
        ancho ? 'flex-row' : 'flex-col'
      )}
    >
      <span
        className={cn(
          'relative block overflow-hidden bg-sw-white',
          grande ? 'aspect-[4/3] sm:aspect-square lg:aspect-auto lg:flex-1' : 'aspect-square',
          ancho && 'aspect-auto min-h-[10rem] w-1/2 sm:min-h-[12rem]'
        )}
      >
        <ImagenProducto
          src={marca.muestra?.image}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-contain transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.04]',
            grande ? 'p-[12%]' : 'p-[14%]'
          )}
        />
      </span>
      <span
        className={cn(
          'flex flex-col justify-end border-t border-sw-border p-4 sm:p-5',
          ancho && 'w-1/2 border-l border-t-0'
        )}
      >
        <span
          className={cn(
            'font-display font-semibold leading-[1.05] tracking-tight transition-colors duration-sw-fast group-hover:text-sw-pink-deep',
            grande ? 'text-[clamp(2rem,1.2rem+3.4vw,4.25rem)]' : 'text-[clamp(1.125rem,0.95rem+0.8vw,1.625rem)]'
          )}
        >
          {sinCorteEnGuion(marca.nombre)}
        </span>
        <span className="mt-4 flex items-center justify-between gap-3 text-sw-small text-sw-muted">
          <span className="tabular-nums">{productos(marca.productos)}</span>
          <ArrowUpRight
            aria-hidden
            className="h-5 w-5 text-sw-pink-deep transition-transform duration-sw ease-sw group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </Link>
  );
}
