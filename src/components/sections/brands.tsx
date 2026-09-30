import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { ImagenProducto } from '@/components/imagen-producto';
import type { ResumenDeMarca } from '@/lib/products';

const enlaceDeMarca = (nombre: string) => `/tienda?marca=${encodeURIComponent(nombre)}`;

const plural = (n: number) => (n === 1 ? '1 producto' : `${n} productos`);

/**
 * Laboratorios que la tienda tiene. Los cuatro con más catálogo se muestran con
 * la foto de uno de sus productos, porque el empaque es como el cliente los
 * reconoce; el resto va como índice, para que quien busca una marca concreta la
 * encuentre sin tener que entrar a la tienda a ver si está.
 */
export function BrandsSection({ marcas }: { marcas: ResumenDeMarca[] }) {
  if (marcas.length === 0) return null;

  const destacadas = marcas.slice(0, 4);
  const resto = marcas.slice(4);

  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Marcas
            </span>
          </div>
          <h2 className="mb-5 font-display text-4xl font-bold text-ink sm:text-5xl">
            Los laboratorios que trabajamos
          </h2>
          <p className="text-slate-600">
            {marcas.length} laboratorios dermocosméticos, elegidos por su respaldo clínico. Si tu
            dermatóloga te recetó una marca, búscala aquí.
          </p>
        </Reveal>

        <div className="mb-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {destacadas.map((marca, i) => (
            <Reveal key={marca.nombre} delay={i * 80}>
              <Link href={enlaceDeMarca(marca.nombre)} className="group block">
                <div className="mb-5 aspect-[3/4] overflow-hidden rounded-sm bg-white">
                  <ImagenProducto
                    src={marca.imagen}
                    alt={marca.nombre}
                    className="h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                {/* Dos líneas fijas: los nombres largos no desalinean el número
                    de productos respecto a las marcas de al lado. */}
                <h3 className="line-clamp-2 min-h-[2.4em] font-display text-xl font-semibold leading-tight text-ink group-hover:text-primary-700">
                  {marca.nombre}
                </h3>
                <p className="mt-1 text-sm tabular-nums text-slate-500">{plural(marca.productos)}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        {resto.length > 0 && (
          <Reveal>
            <div className="border-t border-slate-200 pt-8">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {resto.map((marca) => (
                  <li key={marca.nombre}>
                    <Link
                      href={enlaceDeMarca(marca.nombre)}
                      className="group inline-flex items-baseline gap-2 text-slate-700 transition-colors hover:text-primary-700"
                    >
                      <span className="font-display text-lg">{marca.nombre}</span>
                      <span className="text-xs tabular-nums text-slate-400 group-hover:text-primary-600">
                        {marca.productos}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
