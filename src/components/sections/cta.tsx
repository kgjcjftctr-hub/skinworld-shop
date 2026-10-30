import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Mariposa } from '@/components/ui/mariposa';

// Mismas promesas que ya mostraba el sitio; no se agrega ninguna.
const trustSignals = ['100% original', 'Atención lunes a viernes, 10 a 18 h'];

export function CTASection() {
  return (
    <section aria-labelledby="cierre-titulo" className="relative overflow-hidden bg-sw-pink">
      <div className="sw-container relative py-10 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <h2 id="cierre-titulo" className="font-display text-3xl font-semibold text-sw-ink sm:text-4xl">
            Encuentra lo que buscas
          </h2>
          <Link
            href="/tienda"
            className="sw-btn h-12 w-full bg-sw-ink px-7 text-[0.9375rem] text-sw-warm-white hover:bg-sw-pink-deep sm:w-auto"
          >
            Ver productos
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-6 flex flex-col gap-2 border-t border-sw-ink/15 pt-5 text-sm font-medium text-sw-ink sm:flex-row sm:flex-wrap sm:gap-x-8">
          {trustSignals.map((signal) => (
            <li key={signal} className="flex items-center gap-2">
              <Mariposa className="h-3 w-auto text-sw-ink/70" aria-hidden />
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
