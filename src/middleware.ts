import { NextRequest, NextResponse } from 'next/server';

/** Las vistas de diseño no pueden enviar pedidos, mensajes ni cambios administrativos. */
export function middleware(request: NextRequest) {
  const isPreview = process.env.SKINWORLD_LOCAL_PREVIEW === '1' || process.env.VERCEL_ENV === 'preview';
  if (!isPreview) return NextResponse.next();
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin') || path.startsWith('/api/admin') || path.startsWith('/api/checkout') || (path.startsWith('/api/') && !['GET', 'HEAD'].includes(request.method))) {
    return NextResponse.json({ error: 'Vista previa: pagos, envíos de formularios y administración desactivados.' }, { status: 403 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/api/:path*', '/admin/:path*'] };
