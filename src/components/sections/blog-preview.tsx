import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';
import { formatDate } from '@/utils';

/**
 * Skinworld Journal en la página de inicio: el artículo más reciente grande y
 * los demás al lado. Los textos y fotos son los del blog; la dirección sigue
 * siendo /blog para no perder lo que ya está indexado.
 */
export function BlogPreview() {
  const ordenados = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
  const [principal, ...resto] = ordenados;
  if (!principal) return null;

  return (
    <section aria-labelledby="journal-titulo" className="sw-section">
      <div className="sw-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="sw-label">Skinworld Journal</p>
            <h2 id="journal-titulo" className="mt-3 font-display text-sw-h2 font-semibold text-sw-ink">
              Ciencia, piel y decisiones mejor informadas
            </h2>
          </div>
          <Link href="/blog" className="sw-link shrink-0 self-start sm:self-auto">
            Ver todos los artículos
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <article className="group relative">
            <div className="overflow-hidden rounded-sw-lg bg-sw-surface">
              <img
                src={principal.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.03]"
              />
            </div>
            <p className="mt-5 text-sw-small font-semibold text-sw-pink-deep">{principal.category}</p>
            <h3 className="mt-2 font-display text-sw-h3 font-semibold text-sw-ink">
              <Link
                href={`/blog/${principal.slug}`}
                className="text-sw-ink after:absolute after:inset-0 after:content-[''] group-hover:text-sw-pink-deep"
              >
                {principal.title}
              </Link>
            </h3>
            <p className="mt-3 max-w-sw-prose text-sw-body text-sw-muted">{principal.excerpt}</p>
            <p className="mt-4 text-sw-small text-sw-muted">
              {principal.author}, {formatDate(principal.date)}
            </p>
          </article>

          <ul className="grid content-start gap-8">
            {resto.map((post) => (
              <li key={post.slug}>
                <article className="group relative grid grid-cols-[7rem_1fr] gap-4 border-t border-sw-border pt-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <img
                    src={post.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full rounded-sw object-cover"
                  />
                  <div>
                    <p className="text-sw-xs font-semibold text-sw-pink-deep">{post.category}</p>
                    <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-sw-ink sm:text-xl">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sw-ink after:absolute after:inset-0 after:content-[''] group-hover:text-sw-pink-deep"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 hidden text-sw-small text-sw-muted sm:line-clamp-2">{post.excerpt}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
