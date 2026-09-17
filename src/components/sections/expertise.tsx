'use client';

import { ShieldCheck, Award, Star } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/reveal';

const badges = [
  { label: '25 años', icon: ShieldCheck },
  { label: 'Certificada', icon: Award },
  { label: 'Membresías', icon: Star },
];

export function ExpertiseSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left - Content */}
          <Reveal>
            <span className="mb-5 inline-block font-accent text-xs font-bold uppercase tracking-[0.15em] text-gold-600">
              Experta
            </span>
            <h2 className="mb-3 font-display text-4xl font-bold text-ink sm:text-5xl">
              Dra. Karina Alfaro López
            </h2>
            <p className="mb-8 text-slate-600">
              Especialista en Dermatología · 25 años de experiencia
            </p>
            <p className="mb-10 text-lg leading-relaxed text-slate-600">
              Cada producto Skin World es cuidadosamente seleccionado bajo un riguroso criterio médico y científico, garantizando formulaciones seguras y efectivas para el cuidado profesional de tu piel.
            </p>

            {/* Badges */}
            <div className="mb-10 flex flex-wrap gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5"
                  >
                    <Icon className="h-4 w-4 text-primary-700" />
                    <span className="font-accent text-sm font-semibold text-ink">{badge.label}</span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/sobre-nosotros"
              className="inline-flex items-center gap-2 font-accent text-sm font-semibold text-ink underline decoration-slate-300 decoration-1 underline-offset-8 transition-colors hover:decoration-ink"
            >
              <span>Ver credenciales completas</span>
            </Link>
          </Reveal>

          {/* Right - Visual */}
          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-[380px]">
              <div className="absolute -inset-3 rounded-[28px] border border-gold-300/60" />
              <img
                src="/images/dra-karina-alfaro.jpg"
                alt="Dra. Karina Alfaro López"
                className="relative aspect-square w-full rounded-[20px] object-cover shadow-card"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
