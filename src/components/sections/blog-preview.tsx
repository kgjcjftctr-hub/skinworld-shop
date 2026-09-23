'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '@/lib/blog-data';
import { formatDate } from '@/utils';
import { Reveal } from '@/components/reveal';

export function BlogPreview() {
  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 flex items-end justify-between">
          <div className="max-w-2xl">
            <h2 className="mb-5 font-display text-4xl font-bold text-ink sm:text-5xl">
              Aprende sobre tu piel
            </h2>
            <p className="text-lg text-slate-600">
              Artículos y recursos escritos por criterio dermatológico profesional.
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-2 font-accent text-sm font-semibold text-ink underline decoration-slate-300 decoration-1 underline-offset-8 transition-colors hover:decoration-ink sm:inline-flex"
          >
            <span>Ver todo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        {/* Blog list — horizontal cards on desktop, stacked on mobile */}
        <div className="space-y-6">
          {blogPosts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 80}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <article className="flex flex-col overflow-hidden rounded-2xl bg-white transition-shadow duration-300 hover:shadow-lg sm:flex-row sm:items-stretch">
                  <img
                    src={post.image}
                    alt=""
                    className="h-48 w-full shrink-0 object-cover sm:h-auto sm:w-[200px]"
                  />
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <p className="mb-2 font-accent text-xs font-bold uppercase tracking-wider text-gold-600">
                      {post.category}
                    </p>
                    <h3 className="mb-2 font-display text-lg font-semibold text-ink transition-colors group-hover:text-primary-700">
                      {post.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{formatDate(post.date)}</span>
                      <span aria-hidden>·</span>
                      <span className="font-accent font-semibold text-primary-700">Leer más →</span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-accent text-sm font-semibold text-ink underline decoration-slate-300 decoration-1 underline-offset-8"
          >
            <span>Ver todos los artículos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
