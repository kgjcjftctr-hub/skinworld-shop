import { NextRequest, NextResponse } from 'next/server';
import { avisarPorCorreo, guardarMensaje } from '@/lib/mensajes';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

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
