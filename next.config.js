/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Hoy todas las imágenes se sirven con <img> y esta configuración no se
    // usa, pero deja listos los dominios del catálogo para cuando se migre a
    // next/image: sin ellos, esos productos dejarían de cargar.
    remotePatterns: [
      { protocol: 'https', hostname: 'skinworld.mx' },
      { protocol: 'https', hostname: 'www.isdin.com' },
      { protocol: 'https', hostname: 'frenchpharmacy.com' },
      { protocol: 'https', hostname: '**.images.lovelyskin.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
