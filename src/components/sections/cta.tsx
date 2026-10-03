import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Mariposa, Mariposa3D } from '@/components/ui/mariposa';

// Mismas promesas que ya mostraba el sitio; no se agrega ninguna.
const trustSignals = ['100% original', 'Atención lunes a viernes, 10 a 18 h'];

export function CTASection() {
  return (
    <section aria-labelledby="cierre-titulo" className="relative overflow-hidden bg-sw-pink">
      <Mariposa3D className="pointer-events-none absolute -bottom-[20%] -right-[7%] w-[min(38rem,72vw)] text-sw-pink-soft/65" />
      <div className="sw-container relative py-sw-section">
        <h2
          id="cierre-titulo"
          className="max-w-[14ch] font-display text-sw-h1 font-semibold text-sw-ink"
        >
          Comienza tu transformación hoy
        </h2>
        <p className="mt-5 max-w-sw-prose text-sw-lead text-sw-ink/80">
          Productos dermatológicos respaldados por criterio médico profesional.
        </p>
        <Link
          href="/tienda"
          className="sw-btn mt-8 h-12 bg-sw-ink px-7 text-[0.9375rem] text-sw-warm-white hover:bg-sw-pink-deep"
        >
          Explorar la tienda
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <ul className="mt-12 flex flex-col gap-2 text-sw-small font-semibold text-sw-ink sm:flex-row sm:flex-wrap sm:gap-x-8">
          {trustSignals.map((signal) => (
            <li key={signal} className="flex items-center gap-2">
              <Mariposa className="h-2.5 w-auto text-sw-ink/70" />
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
