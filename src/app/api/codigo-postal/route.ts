import { NextResponse } from 'next/server';
import { buscarCodigoPostal } from '@/lib/codigo-postal';

/**
 * Devuelve estado, municipio y colonias de un código postal para autocompletar
 * la dirección de envío. El catálogo va dentro del proyecto, así que no
 * dependemos de ningún servicio externo.
 */
export async function GET(request: Request) {
  const cp = new URL(request.url).searchParams.get('cp') ?? '';
  const resultado = buscarCodigoPostal(cp);

  if (!resultado) {
    return NextResponse.json({ encontrado: false }, { status: 404 });
  }

  return NextResponse.json(
    { encontrado: true, ...resultado },
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000' } }
  );
}
