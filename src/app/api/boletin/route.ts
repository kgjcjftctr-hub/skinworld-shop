import { NextRequest, NextResponse } from 'next/server';
import { avisarPorCorreo, guardarMensaje } from '@/lib/mensajes';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
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
