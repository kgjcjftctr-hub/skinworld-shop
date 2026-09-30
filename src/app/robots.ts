import type { MetadataRoute } from 'next';
import { URL_SITIO } from '@/lib/sitio';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // El panel y las rutas internas no aportan nada en buscadores y el
      // carrito y la confirmación son páginas de un solo uso.
      disallow: ['/admin', '/admin/', '/api/', '/carrito', '/pedido-confirmado'],
    },
    sitemap: `${URL_SITIO}/sitemap.xml`,
    host: URL_SITIO,
  };
}
