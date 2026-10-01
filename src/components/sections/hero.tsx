import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Mariposa, Mariposa3D } from '@/components/ui/mariposa';
import type { Product } from '@/types';

type ProductoDePortada = Product & Record<string, any>;

/**
 * Espacio preparado para una fotografía o video propios de Skinworld. Mientras
 * sea null, la portada se arma con productos reales del catálogo sobre el rosa
 * de la marca. Para usar una foto: súbela a /public/images/ y pon aquí
 * { src: '/images/portada.jpg', alt: 'Descripción de la foto' }.
 */
const FOTOGRAFIA_DE_PORTADA: { src: string; alt: string } | null = null;

const retraso = (ms: number) => ({ animationDelay: `${ms}ms` });

export function HeroSection({
  productCount,
  portada,
}: {
  productCount: number;
  portada: ProductoDePortada[];
}) {
  const senales = [
    `${productCount} productos seleccionados`,
    '25 años de trayectoria clínica',
    'Respaldo dermatológico certificado',
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="sw-container grid items-center gap-10 pb-sw-section pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:pt-16">
        <div>
          <p className="sw-label animate-sw-rise" style={retraso(0)}>
            Dermatología profesional
          </p>
          <h1
            className="mt-4 font-display text-[clamp(2.75rem,2.2rem+2.7vw,4.875rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-sw-ink animate-sw-rise"
            style={retraso(60)}
          >
            Cuidado dermatológico sin compromisos
          </h1>
          <p
            className="mt-6 max-w-[34rem] text-sw-lead text-sw-muted animate-sw-rise"
            style={retraso(120)}
          >
            Productos seleccionados con criterio médico por la Dra. Karina Alfaro López, para una
            piel tratada con ciencia y precisión.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 animate-sw-rise"
            style={retraso(180)}
          >
            <Link href="/tienda" className="sw-btn sw-btn-primary h-12 px-7 text-[0.9375rem]">
              Explorar productos
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/sobre-nosotros" className="sw-link self-center py-2 text-[0.9375rem]">
              Conocer a la Dra. Karina
            </Link>
          </div>

          <ul
            className="mt-10 grid gap-2 border-t border-sw-border pt-6 text-sw-small text-sw-muted sm:mt-12 sm:flex sm:flex-wrap sm:gap-x-8 animate-sw-rise"
            style={retraso(240)}
          >
            {senales.map((senal) => (
              <li key={senal} className="flex items-center gap-2">
                <Mariposa className="h-2.5 w-auto shrink-0 text-sw-pink" />
                {senal}
              </li>
            ))}
          </ul>
        </div>

        <Composicion portada={portada} />
      </div>
    </section>
  );
}

/**
 * Lado visual de la portada: un campo del rosa de la marca con la mariposa
 * y tres productos reales, cada uno con su nombre y enlace a su ficha.
 */
function Composicion({ portada }: { portada: ProductoDePortada[] }) {
  if (FOTOGRAFIA_DE_PORTADA) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden rounded-sw-lg bg-sw-pink-soft lg:aspect-[5/6]">
        <img
          src={FOTOGRAFIA_DE_PORTADA.src}
          alt={FOTOGRAFIA_DE_PORTADA.alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
    );
  }

  const [principal, ...secundarios] = portada;

  return (
    <div className="relative overflow-hidden rounded-sw-lg bg-sw-pink-soft px-5 pb-5 pt-6 sm:px-8 sm:pb-8 sm:pt-10 lg:aspect-[5/6] lg:p-10">
      <Mariposa3D className="pointer-events-none absolute -right-[12%] -top-[10%] w-[70%] text-sw-pink/55" />

      {principal && (
        <div className="relative grid grid-cols-[1.35fr_1fr] gap-3 sm:gap-5 lg:absolute lg:inset-10 lg:grid-cols-[1.4fr_1fr] lg:grid-rows-2">
          <ProductoEnPortada producto={principal} retardo={200} className="row-span-2" grande />
          {secundarios.slice(0, 2).map((producto, i) => (
            <ProductoEnPortada key={producto.id} producto={producto} retardo={280 + i * 80} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductoEnPortada({
  producto,
  retardo,
  className = '',
  grande = false,
}: {
  producto: ProductoDePortada;
  retardo: number;
  className?: string;
  grande?: boolean;
}) {
  return (
    <Link
      href={`/producto/${encodeURIComponent(producto.slug)}`}
      className={`group flex flex-col overflow-hidden rounded-sw bg-sw-white text-sw-ink shadow-sw-sm animate-sw-rise ${className}`}
      style={retraso(retardo)}
    >
      <span className="relative flex min-h-0 flex-1 items-center justify-center p-[10%]">
        <img
          src={producto.image}
          alt=""
          loading="eager"
          decoding="async"
          className={`w-full object-contain transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.04] ${
            grande ? 'aspect-[3/4] lg:h-full lg:aspect-auto' : 'aspect-square lg:h-full lg:aspect-auto'
          }`}
        />
      </span>
      <span className="border-t border-sw-border px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="block truncate text-[0.6875rem] font-semibold tracking-wide text-sw-muted">
          {producto.brand}
        </span>
        <span
          className={`mt-0.5 line-clamp-2 font-display font-semibold leading-tight group-hover:text-sw-pink-deep ${
            grande ? 'text-sw-small sm:text-base' : 'text-sw-xs sm:text-sw-small'
          }`}
        >
          {producto.name}
        </span>
      </span>
    </Link>
  );
}
