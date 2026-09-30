import { NextRequest, NextResponse } from 'next/server';
import { avisarPorCorreo, guardarMensaje } from '@/lib/mensajes';
import { ipDe, limitar, respuestaDeLimite } from '@/lib/limite';

export async function POST(request: NextRequest) {
  try {
    const { email, website } = await request.json();

    // Trampa para robots, igual que en el formulario de contacto.
    if (typeof website === 'string' && website.length > 0) {
      return NextResponse.json({ message: 'Suscripción registrada' });
    }

    const limite = limitar(`boletin:${ipDe(request)}`, 3, 10 * 60_000);
    if (!limite.permitido) {
      return respuestaDeLimite(
        limite.esperaSegundos,
        'Espera unos minutos antes de volver a suscribirte.'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Correo inválido' }, { status: 400 });
    }

    const guardado = await guardarMensaje({
      tipo: 'boletin',
      email: String(email).trim().slice(0, 200),
    });
    await avisarPorCorreo(guardado);

    return NextResponse.json({ message: 'Suscripción registrada' });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Error al registrar la suscripción' }, { status: 500 });
  }
}
