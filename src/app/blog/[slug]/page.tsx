import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { blogPosts, getBlogPost } from '@/lib/blog-data';
import { formatDate } from '@/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(decodeURIComponent(slug));

  if (!post) {
    return { title: 'Artículo no encontrado', robots: { index: false } };
  }

  const ruta = `/blog/${encodeURIComponent(post.slug)}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: ruta },
    openGraph: {
      type: 'article',
      url: ruta,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(decodeURIComponent(slug));

  if (!post) {
    notFound();
  }

  const otros = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="pb-sw-section pt-8 sm:pt-12">
      <div className="sw-container">
        <Link
          href="/blog"
          className="inline-flex min-h-[2.75rem] items-center gap-2 text-sw-small font-semibold text-sw-muted hover:text-sw-pink-deep"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Skinworld Journal
        </Link>

        <header className="mt-6 max-w-4xl">
          <p className="text-sw-small font-semibold text-sw-pink-deep">{post.category}</p>
          <h1 className="mt-3 font-display text-sw-h1 font-semibold text-sw-ink">{post.title}</h1>
          <p className="mt-5 max-w-sw-prose text-sw-lead text-sw-muted">{post.excerpt}</p>
          <p className="mt-6 text-sw-small text-sw-muted">
            {post.author}, {formatDate(post.date)}
          </p>
        </header>

        <img
          src={post.image}
          alt=""
          decoding="async"
          className="mt-10 aspect-[16/9] w-full rounded-sw-lg object-cover sm:aspect-[21/9]"
        />

        <div className="mx-auto mt-12 max-w-[42rem] space-y-6 text-[1.125rem] leading-[1.75] text-sw-text">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <aside className="mx-auto mt-14 flex max-w-[42rem] items-center gap-4 border-t border-sw-border pt-8">
          <img
            src="/images/dra-karina-alfaro.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-lg font-semibold text-sw-ink">{post.author}</p>
            <p className="text-sw-small text-sw-muted">Especialista en dermatología, con 25 años de experiencia.</p>
            <Link href="/sobre-nosotros" className="mt-1 inline-block text-sw-small font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink">
              Conocer su trayectoria
            </Link>
          </div>
        </aside>

        {otros.length > 0 && (
          <section aria-labelledby="mas-articulos" className="mt-sw-section border-t border-sw-border pt-10">
            <h2 id="mas-articulos" className="font-display text-sw-h3 font-semibold text-sw-ink">
              Más en el Journal
            </h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2">
              {otros.map((otro) => (
                <li key={otro.slug}>
                  <article className="group relative grid grid-cols-[7rem_1fr] items-center gap-5 sm:grid-cols-[9rem_1fr]">
                    <img
                      src={otro.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full rounded-sw object-cover"
                    />
                    <div>
                      <p className="text-sw-xs font-semibold text-sw-pink-deep">{otro.category}</p>
                      <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug text-sw-ink">
                        <Link
                          href={`/blog/${otro.slug}`}
                          className="text-sw-ink after:absolute after:inset-0 after:content-[''] group-hover:text-sw-pink-deep"
                        >
                          {otro.title}
                        </Link>
                      </h3>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
