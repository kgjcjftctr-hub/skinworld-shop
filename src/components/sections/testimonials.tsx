'use client';

import { Star } from 'lucide-react';
import { Reveal } from '@/components/reveal';

const testimonials = [
  {
    quote:
      'Llevo dos años comprando aquí. Los productos son originales y el criterio de la Dra. Karina se nota en cada recomendación.',
    name: 'Fernanda R.',
    detail: 'Piel sensible · CDMX',
  },
  {
    quote:
      'Mi dermatitis mejoró notablemente con la rutina que arme aquí. El respaldo médico hace toda la diferencia frente a comprar a ciegas.',
    name: 'Daniela M.',
    detail: 'Dermatitis atópica · Monterrey',
  },
  {
    quote:
      'Envíos rápidos, productos sellados y atención que realmente entiende de dermatología. Ya no compro en otro lado.',
    name: 'Alejandro V.',
    detail: 'Cuidado antiedad · Guadalajara',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Testimonios
            </span>
          </div>
          <h2 className="mb-5 font-display text-4xl font-bold text-ink sm:text-5xl">
            La confianza de quienes ya nos eligieron
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-card">
                <div className="mb-5 flex gap-0.5 text-gold-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mb-6 flex-1 font-display text-lg italic leading-relaxed text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-accent text-sm font-semibold text-primary-800">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-accent text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.detail}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
