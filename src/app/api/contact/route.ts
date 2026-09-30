import { NextRequest, NextResponse } from 'next/server';
import { avisarPorCorreo, guardarMensaje } from '@/lib/mensajes';
import { ipDe, limitar, respuestaDeLimite } from '@/lib/limite';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, website } = await request.json();

    // Trampa para robots: es un campo escondido que una persona nunca llena.
    // Se responde como si todo hubiera salido bien para no darles pistas.
    if (typeof website === 'string' && website.length > 0) {
      return NextResponse.json({ message: 'Tu mensaje ha sido enviado correctamente' });
    }

    const limite = limitar(`contacto:${ipDe(request)}`, 3, 10 * 60_000);
    if (!limite.permitido) {
      return respuestaDeLimite(
        limite.esperaSegundos,
        'Ya recibimos varios mensajes tuyos. Espera unos minutos antes de enviar otro.'
      );
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // El mensaje se guarda primero: si el aviso por correo falla, el mensaje no
    // se pierde y sigue apareciendo en el panel de administración.
    const guardado = await guardarMensaje({
      tipo: 'contacto',
      nombre: String(name).trim().slice(0, 200),
      email: String(email).trim().slice(0, 200),
      asunto: String(subject).trim().slice(0, 300),
      mensaje: String(message).trim().slice(0, 5000),
    });

    await avisarPorCorreo(guardado);

    return NextResponse.json({ message: 'Tu mensaje ha sido enviado correctamente' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Error al procesar el formulario' }, { status: 500 });
  }
}
