'use client';

import Link from 'next/link';
import { Droplet, ShieldCheck, Sparkles, Sun, Scissors, Heart } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import productsData from '@/data/products-data.json';

const categories = [
  { name: 'Acné', slug: 'Acné', bg: 'bg-primary-50', icon: Droplet },
  { name: 'Dermatitis', slug: 'Dermatitis', bg: 'bg-accent-50', icon: ShieldCheck },
  { name: 'Antiedad', slug: 'Antiedad', bg: 'bg-gold-50', icon: Sparkles },
  { name: 'Manchas', slug: 'Manchas', bg: 'bg-slate-50', icon: Sun },
  { name: 'Cabello y Uñas', slug: 'Cabello y Uñas', bg: 'bg-primary-100', icon: Scissors },
  { name: 'Piel de Bebé', slug: 'Piel de Bebé', bg: 'bg-accent-100', icon: Heart },
];

export function CategoriesSection() {
  const counts = (productsData as any[]).reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Catálogo
            </span>
          </div>
          <h2 className="mb-5 font-display text-4xl font-bold text-ink sm:text-5xl">
            Encuentra soluciones por problema
          </h2>
          <p className="text-lg text-slate-600">
            Navega por nuestro catálogo categorizado. Todos nuestros productos están avalados por criterio dermatológico profesional.
          </p>
        </Reveal>

        {/* Mobile carousel / Desktop grid */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
          {categories.map((category, i) => {
            const Icon = category.icon;
            return (
              <Reveal key={category.slug} delay={i * 60} className="min-w-[45%] snap-start sm:min-w-0">
                <Link href={`/tienda?categoria=${encodeURIComponent(category.slug)}`} className="block h-full">
                  <div
                    className={`group flex h-full flex-col items-center justify-center rounded-2xl ${category.bg} p-6 text-center shadow-sm ring-1 ring-inset ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card`}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-colors duration-300 group-hover:bg-primary-800">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="mb-1 font-display text-base font-semibold text-ink">
                      {category.name}
                    </h3>
                    <p className="font-accent text-xs font-medium uppercase tracking-wider text-slate-500">
                      {counts[category.slug] || 0} productos
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
