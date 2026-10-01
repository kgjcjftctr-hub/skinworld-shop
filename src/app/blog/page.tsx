import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';
import { formatDate } from '@/utils';

export const metadata = {
  title: 'Blog',
  description:
    'Artículos de dermatología escritos por la Dra. Karina Alfaro López: fotoprotección, lunares, colágeno y cuidado de la piel.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  // Más reciente primero. La dirección sigue siendo /blog por SEO; lo que
  // cambia es el nombre visible de la sección.
  const [principal, ...resto] = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="pb-sw-section pt-12 sm:pt-16">
      <div className="sw-container">
        <header className="border-b border-sw-ink/80 pb-8">
          <p className="sw-label">Skinworld Journal</p>
          <h1 className="mt-3 max-w-[18ch] font-display text-sw-h1 font-semibold text-sw-ink">
            Ciencia, piel y decisiones mejor informadas
          </h1>
          <p className="mt-4 max-w-sw-prose text-sw-lead text-sw-muted">
            Artículos y recursos sobre cuidado dermatológico, escritos por la Dra. Karina Alfaro López.
          </p>
        </header>

        {principal && (
          <article className="group relative mt-10 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-14">
            <div className="overflow-hidden rounded-sw-lg bg-sw-surface">
              <img
                src={principal.image}
                alt=""
                decoding="async"
                className="aspect-[16/10] w-full object-cover transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.03]"
              />
            </div>
            <div>
              <p className="text-sw-small font-semibold text-sw-pink-deep">{principal.category}</p>
              <h2 className="mt-2 font-display text-sw-h2 font-semibold text-sw-ink">
                <Link
                  href={`/blog/${principal.slug}`}
                  className="text-sw-ink after:absolute after:inset-0 after:content-[''] group-hover:text-sw-pink-deep"
                >
                  {principal.title}
                </Link>
              </h2>
              <p className="mt-4 text-sw-lead text-sw-muted">{principal.excerpt}</p>
              <p className="mt-5 text-sw-small text-sw-muted">
                {principal.author}, {formatDate(principal.date)}
              </p>
            </div>
          </article>
        )}

        {resto.length > 0 && (
          <ul className="mt-14 grid gap-x-8 gap-y-12 border-t border-sw-border pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {resto.map((post) => (
              <li key={post.slug}>
                <article className="group relative">
                  <div className="overflow-hidden rounded-sw bg-sw-surface">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={post.image}
                      alt=""
                      className="aspect-[4/3] w-full object-cover transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="mt-4 text-sw-small font-semibold text-sw-pink-deep">{post.category}</p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold leading-snug text-sw-ink">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sw-ink after:absolute after:inset-0 after:content-[''] group-hover:text-sw-pink-deep"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sw-body text-sw-muted">{post.excerpt}</p>
                  <p className="mt-3 text-sw-small text-sw-muted">{formatDate(post.date)}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
