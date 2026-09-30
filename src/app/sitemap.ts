import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-data';
import { dedupeVariants, getAllProducts } from '@/lib/products';
import { URL_SITIO } from '@/lib/sitio';

// El catálogo cambia desde el panel, así que el sitemap se regenera cada hora
// en vez de quedarse congelado en el momento de la compilación.
export const revalidate = 3600;

const FIJAS: { ruta: string; prioridad: number; frecuencia: 'daily' | 'weekly' | 'monthly' }[] = [
  { ruta: '', prioridad: 1, frecuencia: 'daily' },
  { ruta: '/tienda', prioridad: 0.9, frecuencia: 'daily' },
  { ruta: '/sobre-nosotros', prioridad: 0.7, frecuencia: 'monthly' },
  { ruta: '/blog', prioridad: 0.7, frecuencia: 'weekly' },
  { ruta: '/contacto', prioridad: 0.6, frecuencia: 'monthly' },
  { ruta: '/preguntas-frecuentes', prioridad: 0.5, frecuencia: 'monthly' },
  { ruta: '/envios', prioridad: 0.4, frecuencia: 'monthly' },
  { ruta: '/terminos', prioridad: 0.3, frecuencia: 'monthly' },
  { ruta: '/privacidad', prioridad: 0.3, frecuencia: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  const paginas: MetadataRoute.Sitemap = FIJAS.map(({ ruta, prioridad, frecuencia }) => ({
    url: `${URL_SITIO}${ruta}`,
    lastModified: ahora,
    changeFrequency: frecuencia,
    priority: prioridad,
  }));

  const productos = dedupeVariants(await getAllProducts()).map((p) => ({
    url: `${URL_SITIO}/producto/${encodeURIComponent(p.slug)}`,
    lastModified: ahora,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const articulos = blogPosts.map((post) => ({
    url: `${URL_SITIO}/blog/${encodeURIComponent(post.slug)}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...paginas, ...productos, ...articulos];
}
