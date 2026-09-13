import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '@/styles/globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Fuentes del sistema (sin next/font/google): el build de Hostinger no
// tiene acceso de red garantizado para descargar Google Fonts en build time.

export const metadata: Metadata = {
  title: 'Skin World | Dermatología Profesional',
  description:
    'Productos dermatológicos de calidad respaldados por profesional en dermatología. Descubre soluciones para tu piel.',
  keywords: [
    'dermatología',
    'skincare',
    'productos de piel',
    'cuidado dermatológico',
    'México',
  ],
  authors: [{ name: 'Skin World', url: 'https://skinworld.mx' }],
  creator: 'Skin World',
  publisher: 'Skin World',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://skinworld.mx',
    title: 'Skin World | Dermatología Profesional',
    description:
      'Productos dermatológicos de calidad respaldados por profesional en dermatología.',
    siteName: 'Skin World',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skin World | Dermatología Profesional',
    description:
      'Productos dermatológicos de calidad respaldados por profesional en dermatología.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#d4a5af" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
