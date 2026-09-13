'use client';

import Link from 'next/link';
import { Reveal } from '@/components/reveal';

const trustSignals = ['100% Original', 'Envío Gratis >$500', 'Soporte 24/7'];

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,theme(colors.primary.900),transparent)] opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="mb-6 inline-block h-px w-10 bg-gold-500" />
          <h2 className="mb-5 font-display text-4xl font-bold text-white sm:text-5xl">
            Comienza tu transformación hoy
          </h2>
          <p className="mb-10 text-lg text-white/70">
            Productos dermatológicos respaldados por criterio médico profesional.
          </p>

          <Link
            href="/tienda"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-10 py-4 font-accent text-sm font-semibold text-ink shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-400 hover:shadow-gold"
          >
            <span>Explorar Tienda</span>
          </Link>

          <div className="mx-auto mt-14 flex max-w-xl flex-col items-center justify-center gap-3 text-sm text-white/60 sm:flex-row sm:gap-0 sm:divide-x sm:divide-white/15">
            {trustSignals.map((signal) => (
              <span key={signal} className="font-accent font-semibold sm:px-6">
                {signal}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
