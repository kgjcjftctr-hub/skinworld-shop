import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { CORREO_TIENDA, enviarCorreo, plantilla } from '@/lib/correo';
import { correoConfirmacion, type Pedido } from '@/lib/pedidos';

const PEDIDO_DE_MUESTRA: Pedido = {
  id: 'prueba00-0000-0000-0000-000000000000',
  created_at: new Date().toISOString(),
  status: 'paid',
  customer_email: '',
  customer_phone: '55 1234 5678',
  shipping_name: 'Nombre del cliente',
  shipping_address: {
    nombre: 'Nombre del cliente',
    telefono: '55 1234 5678',
    calle: 'Paseo de las Palmas',
    numeroExterior: '100',
    numeroInterior: '',
    colonia: 'Lomas de Chapultepec I Sección',
    municipio: 'Miguel Hidalgo',
    estado: 'Ciudad de México',
    codigoPostal: '11000',
    referencias: '',
  },
  amount_total: 2349,
  items: [
    { name: 'Fotoultra Age Repair Fusion Water FPS50+ 50 Ml', quantity: 1, amount_total: 749 },
    { name: 'A.G.E. Reverse Day', quantity: 1, amount_total: 1600 },
  ],
};

const ES_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Comprueba desde el panel que el envío de correos funciona. Sin destinatario
 * manda una prueba simple al buzón de la tienda; con destinatario manda la
 * misma confirmación que recibe un cliente, para ver cómo le llega.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const destino = String(body?.para ?? '').trim();

  if (destino && !ES_CORREO.test(destino)) {
    return NextResponse.json({ error: 'Ese correo no parece válido' }, { status: 400 });
  }

  const correo = destino
    ? { ...correoConfirmacion({ ...PEDIDO_DE_MUESTRA, customer_email: destino }), para: destino }
    : {
        para: CORREO_TIENDA,
        asunto: 'Prueba de correo de Skinworld',
        html: plantilla(
          'El correo ya está funcionando',
          `<p style="margin:0;">Si estás leyendo esto, los avisos de pedidos ya salen bien.</p>
           <p style="margin:16px 0 0;">A partir de ahora vas a recibir aquí cada pedido nuevo, y tus clientes van a recibir su confirmación y los avisos de empaquetado y envío.</p>`
        ),
      };

  const resultado = await enviarCorreo(correo);

  if (resultado.enviado) {
    return NextResponse.json({ enviado: true, destino: correo.para });
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
