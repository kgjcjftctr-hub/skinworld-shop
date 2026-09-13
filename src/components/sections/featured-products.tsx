'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import productsData from '@/data/products-data.json';

export function FeaturedProducts() {
  const featuredProducts = (productsData as any[]).filter((p) => p.featured);

  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Curaduría experta
            </span>
          </div>
          <h2 className="mb-5 font-display text-4xl font-bold text-ink sm:text-5xl">
            Seleccionados por la Dra. Karina
          </h2>
          <p className="text-lg text-slate-600">
            Los productos más recomendados por criterio dermatológico profesional.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, i) => (
            <Reveal key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 font-accent text-sm font-semibold text-ink underline decoration-slate-300 decoration-1 underline-offset-8 transition-colors hover:decoration-ink"
          >
            <span>Ver todos los productos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
