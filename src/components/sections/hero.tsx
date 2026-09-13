'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const trustSignals = ['165+ productos curados', '25 años de trayectoria clínica', 'Respaldo dermatológico certificado'];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[72vh] items-center overflow-hidden bg-white">
      {/* Layered premium background: soft radial glow + fine grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,theme(colors.primary.100),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(26,26,26,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,26,26,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <svg
        className="pointer-events-none absolute -right-24 -top-24 h-[460px] w-[460px] text-primary-900 opacity-[0.05]"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M45.4,-58.5C58.2,-49.6,67.2,-34.5,70.9,-18.1C74.6,-1.7,73,16,65.4,30.8C57.8,45.6,44.3,57.5,29.1,63.9C13.9,70.3,-3,71.2,-19.2,67.1C-35.3,63,-50.7,53.9,-60.5,40.4C-70.4,26.9,-74.7,9,-71.9,-7.4C-69.1,-23.8,-59.2,-38.7,-46.1,-47.8C-33,-56.9,-16.5,-60.2,0.7,-61.1C17.9,-62,35.8,-60.5,45.4,-58.5Z"
          transform="translate(100 100)"
        />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Dermatología Profesional
            </span>
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Cuidado dermatológico <span className="italic text-primary-700">sin compromisos</span>
          </h1>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-slate-600">
            Productos seleccionados con criterio médico por la Dra. Karina Alfaro López, para una piel tratada con ciencia y precisión.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/tienda"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-ink px-8 py-4 font-accent text-sm font-semibold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-card-hover"
            >
              <span>Explorar Productos</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sobre-nosotros"
              className="inline-flex items-center justify-center gap-2 px-2 py-2 font-accent text-sm font-semibold text-ink underline decoration-slate-300 decoration-1 underline-offset-8 transition-colors hover:decoration-gold-500"
            >
              <span>Conocer a la Dra. Karina</span>
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-200 pt-8">
            {trustSignals.map((signal) => (
              <span key={signal} className="font-accent text-xs font-semibold uppercase tracking-wider text-slate-500">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
