import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { CORREO_TIENDA, enviarCorreo, plantilla } from '@/lib/correo';

/**
 * Manda un correo de prueba a la tienda para comprobar, desde el panel, que el
 * envío de correos está bien configurado.
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const resultado = await enviarCorreo({
    para: CORREO_TIENDA,
    asunto: 'Prueba de correo de Skinworld',
    html: plantilla(
      'El correo ya está funcionando',
      `<p style="margin:0;">Si estás leyendo esto, los avisos de pedidos ya salen bien.</p>
       <p style="margin:16px 0 0;">A partir de ahora vas a recibir aquí cada pedido nuevo, y tus clientes van a recibir su confirmación y los avisos de empaquetado y envío.</p>`
    ),
  });

  if (resultado.enviado) {
    return NextResponse.json({ enviado: true, destino: CORREO_TIENDA });
  }

  const faltaLlave = resultado.motivo === 'sin RESEND_API_KEY';
  return NextResponse.json(
    {
      enviado: false,
      motivo: faltaLlave
        ? 'Todavía no está configurada la llave RESEND_API_KEY en Vercel.'
        : resultado.motivo,
    },
    { status: faltaLlave ? 409 : 502 }
  );
}
