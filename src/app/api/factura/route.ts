import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ipDe, limitar, respuestaDeLimite } from '@/lib/limite';
import { RFC, REGIMENES_FISCALES, USOS_CFDI } from '@/lib/facturas';
import { avisarSolicitudAlCliente, avisarSolicitudALaTienda, solicitarFactura } from '@/lib/facturas-db';
import { ErrorDePedido, registrarCorreo } from '@/lib/pedidos-db';

const claves = <T extends readonly { clave: string }[]>(lista: T) => lista.map((x) => x.clave) as [string, ...string[]];

const Solicitud = z.object({
  referencia: z.string().trim().regex(/^[0-9a-fA-F]{8}$/, 'La referencia son los 8 caracteres de tu pedido'),
  correo: z.string().trim().email().max(200),
  rfc: z
    .string()
    .trim()
    .toUpperCase()
    .regex(RFC, 'Revisa el RFC'),
  razon_social: z.string().trim().min(1).max(300),
  regimen_fiscal: z.enum(claves(REGIMENES_FISCALES)),
  codigo_postal: z.string().trim().regex(/^\d{5}$/, 'El código postal fiscal tiene 5 dígitos'),
  uso_cfdi: z.enum(claves(USOS_CFDI)),
  website: z.string().optional(),
});

/** Formulario público de /facturacion. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  // Trampa para robots: se responde como si todo hubiera salido bien.
  if (typeof body?.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const limite = limitar(`factura:${ipDe(request)}`, 5, 10 * 60_000);
  if (!limite.permitido) {
    return respuestaDeLimite(limite.esperaSegundos, 'Ya recibimos varias solicitudes. Espera unos minutos.');
  }

  const datos = Solicitud.safeParse(body);
  if (!datos.success) {
    const primero = datos.error.issues[0];
    const mensaje = primero?.message && !primero.message.startsWith('Invalid') ? primero.message : 'Revisa los datos del formulario';
    return NextResponse.json({ error: mensaje }, { status: 400 });
  }

  const { referencia, correo, website: _trampa, ...fiscales } = datos.data;
  let pedido: string;
  try {
    ({ pedido } = await solicitarFactura(referencia, correo, fiscales));
  } catch (err) {
    if (err instanceof ErrorDePedido) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error('Falló la solicitud de factura:', err);
    return NextResponse.json({ error: 'No se pudo guardar la solicitud. Intenta de nuevo.' }, { status: 500 });
  }

  // La solicitud ya quedó guardada: un correo que falle no debe hacer creer al
  // cliente que hay que volver a mandarla.
  try {
    const [cliente, tienda] = await Promise.all([
      avisarSolicitudAlCliente(pedido, correo, fiscales),
      avisarSolicitudALaTienda(pedido, correo, fiscales),
    ]);
    await registrarCorreo(pedido, 'factura_solicitada', cliente);
    if (!tienda.enviado) console.warn('Aviso de factura a la tienda no enviado:', tienda.motivo);
  } catch (err) {
    console.error('Fallaron los avisos de la factura del pedido', pedido, err);
  }
  return NextResponse.json({ ok: true });
}
