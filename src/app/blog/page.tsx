import Link from 'next/link';
import { blogPosts } from '@/lib/blog-data';
import { formatDate } from '@/utils';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-display text-4xl font-bold text-ink sm:text-5xl">
            Blog Educativo
          </h1>
          <p className="text-lg text-slate-600">
            Artículos y recursos sobre cuidado dermatológico.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <article>
                <img
                  src={post.image}
                  alt=""
                  className="mb-5 aspect-[4/3] w-full rounded-xl object-cover transition-shadow group-hover:shadow-md"
                />
                <p className="mb-2 font-accent text-xs font-bold uppercase tracking-wider text-gold-600">
                  {post.category}
                </p>
                <h2 className="mb-2 font-display text-lg font-semibold text-ink transition-colors group-hover:text-primary-700">
                  {post.title}
                </h2>
                <p className="mb-3 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                <p className="text-xs text-slate-400">
                  {post.author} · {formatDate(post.date)}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
