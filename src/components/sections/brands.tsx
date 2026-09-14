'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';

const brands = [
  {
    name: 'ISDIN',
    tagline: 'Fotoprotección y dermocosmética avalada por dermatólogos',
    images: [
      'https://skinworld.mx/wp-content/uploads/2020/08/ISDIN-Fotoprotector-Isdin-Fusion-Water-50-50Ml-01.jpg',
      'https://skinworld.mx/wp-content/uploads/2020/08/ISDIN-Fotoprotector-Isdin-Fusion-Water-Color-50-50-Ml-01.jpg',
      'https://skinworld.mx/wp-content/uploads/2020/08/ISDIN-Fotoprotector-Isdin-Pediatrics-Lotion-Spray-50-200Ml-01.jpg',
      'https://skinworld.mx/wp-content/uploads/2020/08/ISDIN-Fotoultra-Age-Repair-Fusion-Water-50-50-Ml-01.jpg',
    ],
  },
  {
    name: 'La Roche-Posay',
    tagline: 'Cuidado dermatológico para piel sensible, respaldado por laboratorios',
    images: [
      'https://skinworld.mx/wp-content/uploads/2020/08/Lipikar-Lait-Urea-5-400Ml.png.jpg',
      'https://skinworld.mx/wp-content/uploads/2020/08/Anthelios-Mineral-One-Fps50-Tono-1-30Ml.jpg',
      'https://skinworld.mx/wp-content/uploads/2020/08/Anthelios-Mineral-One-Fps50-Tono-2-30Ml.jpg',
      'https://skinworld.mx/wp-content/uploads/2020/08/Cicaplast-Baume-B5-40Ml.jpg',
    ],
  },
];

export function BrandsSection() {
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
            Las marcas en las que confiamos
          </h2>
          <p className="text-slate-600">
            Trabajamos con laboratorios dermocosméticos reconocidos mundialmente por su
            respaldo científico y calidad.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {brands.map((brand, i) => (
            <Reveal key={brand.name} delay={i * 100}>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 grid grid-cols-4 gap-3">
                  {brand.images.map((src) => (
                    <div
                      key={src}
                      className="aspect-square overflow-hidden rounded-xl bg-slate-100"
                    >
                      <img
                        src={src}
                        alt={brand.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
                <h3 className="mb-2 font-display text-2xl font-semibold text-ink">
                  {brand.name}
                </h3>
                <p className="mb-6 flex-1 text-sm text-slate-600">{brand.tagline}</p>
                <Link
                  href="/tienda"
                  className="inline-flex items-center gap-2 font-accent text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800"
                >
                  <span>Ver productos</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
