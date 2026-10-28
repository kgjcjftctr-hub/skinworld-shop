import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  avisarRechazoAlCliente,
  enviarFacturaAlCliente,
  resolverFactura,
  solicitudPorId,
} from '@/lib/facturas-db';
import { ErrorDePedido, registrarCorreo } from '@/lib/pedidos-db';

const ID = z.string().uuid();
// Vercel no acepta peticiones de más de 4.5 MB; una factura pesa unos cientos de KB.
const TAMANO_MAXIMO = 2 * 1024 * 1024;

function error(err: unknown) {
  if (err instanceof ErrorDePedido) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error('Falló la factura:', err);
  return NextResponse.json({ error: 'No se pudo completar' }, { status: 500 });
}

/**
 * Manda al cliente el PDF y el XML de su factura y cierra la solicitud. Antes
 * revisa que el XML sea un CFDI timbrado a nombre del RFC que pidió el cliente,
 * para no mandarle por error la factura de otra persona.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { id } = await context.params;
  if (!ID.safeParse(id).success) return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 });

  const formulario = await request.formData().catch(() => null);
  const pdf = formulario?.get('pdf');
  const xml = formulario?.get('xml');
  if (!(pdf instanceof File) || !(xml instanceof File)) {
    return NextResponse.json({ error: 'Sube el PDF y el XML de la factura' }, { status: 400 });
  }
  if (pdf.size > TAMANO_MAXIMO || xml.size > TAMANO_MAXIMO) {
    return NextResponse.json({ error: 'Cada archivo debe pesar menos de 2 MB' }, { status: 400 });
  }

  try {
    const solicitud = await solicitudPorId(id);
    if (!solicitud) return NextResponse.json({ error: 'La solicitud no existe' }, { status: 404 });
    if (solicitud.status !== 'pendiente') {
      return NextResponse.json({ error: 'Esa solicitud ya se había cerrado. Recarga la página.' }, { status: 409 });
    }

    const bytesPdf = Buffer.from(await pdf.arrayBuffer());
    const textoXml = Buffer.from(await xml.arrayBuffer()).toString('utf8');
    if (bytesPdf.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return NextResponse.json({ error: 'El archivo PDF no es un PDF' }, { status: 400 });
    }
    if (!/<cfdi:Comprobante\b/.test(textoXml) || !/TimbreFiscalDigital/.test(textoXml)) {
      return NextResponse.json({ error: 'El XML no es un CFDI timbrado' }, { status: 400 });
    }
    const receptor = textoXml.match(/<cfdi:Receptor\b[^>]*\bRfc="([^"]+)"/)?.[1]?.toUpperCase();
    if (receptor !== solicitud.rfc) {
      return NextResponse.json(
        { error: `El XML está a nombre de ${receptor ?? 'otro RFC'}, pero el cliente pidió ${solicitud.rfc}` },
        { status: 409 }
      );
    }

    const base = `factura-${solicitud.order_id.slice(0, 8).toUpperCase()}`;
    const aviso = await enviarFacturaAlCliente(solicitud, [
      { nombre: `${base}.pdf`, contenido: bytesPdf.toString('base64') },
      { nombre: `${base}.xml`, contenido: Buffer.from(textoXml, 'utf8').toString('base64') },
    ]);
    await registrarCorreo(solicitud.order_id, 'factura', aviso);
    // Si el correo no salió, la solicitud sigue pendiente para volver a intentarlo.
    if (!aviso.enviado) {
      console.warn('Factura no enviada:', aviso.motivo);
      return NextResponse.json({ error: 'No se pudo mandar el correo. Intenta de nuevo.' }, { status: 502 });
    }

    await resolverFactura(id, 'enviada');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return error(err);
  }
}

const Rechazo = z.object({ motivo: z.string().trim().min(1).max(500) });

/** Rechaza la solicitud y le explica al cliente por qué. */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { id } = await context.params;
  const rechazo = Rechazo.safeParse(await request.json().catch(() => null));
  if (!ID.safeParse(id).success || !rechazo.success) {
    return NextResponse.json({ error: 'Escribe el motivo del rechazo' }, { status: 400 });
  }

  try {
    const solicitud = await resolverFactura(id, 'rechazada', rechazo.data.motivo);
    const aviso = await avisarRechazoAlCliente(solicitud);
    await registrarCorreo(solicitud.order_id, 'factura_rechazada', aviso);
    return NextResponse.json({ ok: true, avisoEnviado: aviso.enviado });
  } catch (err) {
    return error(err);
  }
}
