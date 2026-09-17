import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import '@/styles/globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Fuentes auto-alojadas (next/font/local): no dependen de descargar
// Google Fonts en build time, a diferencia de next/font/google, por lo
// que no hay riesgo de que el build falle en Hostinger por falta de red.
const inter = localFont({
  src: './../fonts/inter-variable.woff2',
  variable: '--font-inter',
  weight: '400 700',
  display: 'swap',
});

const playfair = localFont({
  src: [
    { path: './../fonts/playfair-variable.woff2', weight: '400 700', style: 'normal' },
    { path: './../fonts/playfair-italic-variable.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Skinworld – by Karina Alfaro',
  description:
    'Productos dermatológicos de calidad respaldados por profesional en dermatología. Descubre soluciones para tu piel.',
  keywords: [
    'dermatología',
    'skincare',
    'productos de piel',
    'cuidado dermatológico',
    'México',
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  authors: [{ name: 'Skinworld', url: 'https://skinworld.shop' }],
  creator: 'Skinworld',
  publisher: 'Skinworld',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://skinworld.shop',
    title: 'Skinworld – by Karina Alfaro',
    description:
      'Productos dermatológicos de calidad respaldados por profesional en dermatología.',
    siteName: 'Skinworld',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skinworld – by Karina Alfaro',
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
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#d4a5af" />
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
