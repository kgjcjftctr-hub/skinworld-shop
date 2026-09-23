import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBlogPost } from '@/lib/blog-data';
import { formatDate } from '@/utils';

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

  return (
    <div className="min-h-screen bg-white">
      <img src={post.image} alt="" className="h-[320px] w-full object-cover sm:h-[400px]" />

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al blog</span>
        </Link>

        <div className="mb-8 text-center">
          <p className="mb-3 font-accent text-xs font-bold uppercase tracking-wider text-gold-600">
            {post.category}
          </p>
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {post.title}
          </h1>
          <p className="text-sm text-slate-400">
            {post.author} · {formatDate(post.date)}
          </p>
        </div>

        <div className="space-y-6 text-justify leading-loose text-slate-600">
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
