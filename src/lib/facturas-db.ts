import 'server-only';
import { getSupabase } from '@/lib/supabase';
import { CORREO_TIENDA, SITIO, enviarCorreo, escaparHtml, plantilla } from '@/lib/correo';
import { ErrorDePedido, faltaMigracion } from '@/lib/pedidos-db';
import { nombreDeRegimen, nombreDeUso } from '@/lib/facturas';
import { etiquetaDeEstado } from '@/lib/estados-pedido';

export interface DatosFiscales {
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
  codigo_postal: string;
  uso_cfdi: string;
}

export interface SolicitudDeFactura extends DatosFiscales {
  id: string;
  order_id: string;
  created_at: string;
  email: string;
  status: 'pendiente' | 'enviada' | 'rechazada';
  resolved_at: string | null;
  note: string | null;
}

const FALTA_MIGRACION = new ErrorDePedido(
  'Por ahora las facturas se piden escribiendo a contacto@skinworld.shop con el número de pedido y los datos fiscales.',
  503
);

function traducir(error: { code?: string; message?: string }): ErrorDePedido {
  if (faltaMigracion(error)) return FALTA_MIGRACION;
  const [clave, dato] = (error.message ?? '').split(':');
  switch (clave) {
    case 'PEDIDO_NO_ENCONTRADO':
      return new ErrorDePedido(
        'No encontramos un pedido con esa referencia y ese correo. Revisa el correo de confirmación de tu compra.',
        404
      );
    case 'PEDIDO_NO_FACTURABLE':
      return new ErrorDePedido(`Ese pedido está «${etiquetaDeEstado(dato)}» y no se puede facturar.`, 409);
    case 'FUERA_DE_PLAZO':
      return new ErrorDePedido(
        'La factura se pide en el mismo mes de la compra y ese plazo ya pasó. Escríbenos a contacto@skinworld.shop y lo revisamos.',
        409
      );
    case 'YA_SOLICITADA':
      return new ErrorDePedido('Ya recibimos una solicitud de factura para ese pedido. Te la mandamos por correo.', 409);
    case 'SOLICITUD_NO_EXISTE':
      return new ErrorDePedido('La solicitud no existe.', 404);
    case 'SOLICITUD_CERRADA':
      return new ErrorDePedido('Esa solicitud ya se había cerrado. Recarga la página.', 409);
    case 'FALTA_MOTIVO':
      return new ErrorDePedido('Escribe el motivo del rechazo; se le manda al cliente.', 400);
    default:
      if (error.code === '23514') return new ErrorDePedido('Revisa los datos fiscales: alguno no tiene el formato correcto.', 400);
      console.error('Error inesperado de factura:', error.code, error.message);
      return new ErrorDePedido('No se pudo guardar la solicitud. Intenta de nuevo.', 500);
  }
}

export async function solicitarFactura(referencia: string, correo: string, datos: DatosFiscales) {
  const { data, error } = await getSupabase().rpc('solicitar_factura', {
    p_referencia: referencia,
    p_correo: correo,
    p_datos: datos,
  });
  if (error) throw traducir(error);
  return data as { solicitud: string; pedido: string };
}

export async function resolverFactura(solicitud: string, status: 'enviada' | 'rechazada', nota?: string | null) {
  const { data, error } = await getSupabase().rpc('resolver_factura', {
    p_solicitud: solicitud,
    p_status: status,
    p_actor: 'tienda',
    p_nota: nota ?? null,
  });
  if (error) throw traducir(error);
  return data as SolicitudDeFactura;
}

export async function solicitudPorId(id: string) {
  const { data, error } = await getSupabase().from('invoice_requests').select('*').eq('id', id).maybeSingle();
  if (error) throw traducir(error);
  return data as SolicitudDeFactura | null;
}

const referencia = (pedido: string) => pedido.slice(0, 8).toUpperCase();

function tablaFiscal(d: DatosFiscales) {
  const fila = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#9a9aa6;white-space:nowrap;">${k}</td><td style="padding:4px 0;color:#1c1c22;">${escaparHtml(v)}</td></tr>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    ${fila('RFC', d.rfc)}
    ${fila('Razón social', d.razon_social)}
    ${fila('Régimen fiscal', `${d.regimen_fiscal} · ${nombreDeRegimen(d.regimen_fiscal)}`)}
    ${fila('Código postal', d.codigo_postal)}
    ${fila('Uso del CFDI', `${d.uso_cfdi} · ${nombreDeUso(d.uso_cfdi)}`)}
  </table>`;
}

/** Al cliente: se recibió su solicitud, con los datos para que los revise. */
export function avisarSolicitudAlCliente(pedido: string, correo: string, d: DatosFiscales) {
  return enviarCorreo({
    para: correo,
    asunto: `Recibimos tu solicitud de factura · ${referencia(pedido)}`,
    responderA: CORREO_TIENDA,
    html: plantilla(
      'Recibimos tu solicitud de factura',
      `<p style="margin:0;">Pedido <strong>${referencia(pedido)}</strong>. Te mandamos la factura (PDF y XML) a este correo. Estos son los datos que nos diste:</p>
       ${tablaFiscal(d)}
       <p style="margin:0;color:#9a9aa6;font-size:13px;">Si algún dato está mal, responde este correo antes de que la emitamos.</p>`
    ),
  });
}

/** A la tienda: hay una factura por emitir. */
export function avisarSolicitudALaTienda(pedido: string, correo: string, d: DatosFiscales) {
  return enviarCorreo({
    para: CORREO_TIENDA,
    asunto: `Factura por emitir · pedido ${referencia(pedido)}`,
    responderA: correo,
    html: plantilla(
      'Un cliente pidió factura',
      `<p style="margin:0;">Pedido <strong>${referencia(pedido)}</strong> · ${escaparHtml(correo)}</p>
       ${tablaFiscal(d)}
       <p style="margin:24px 0 0;">
         <a href="${SITIO}/admin/facturas" style="display:inline-block;background:#1c1c22;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">Subir la factura en el panel</a>
       </p>`
    ),
  });
}

/** Al cliente: su factura, con el PDF y el XML adjuntos. */
export function enviarFacturaAlCliente(s: SolicitudDeFactura, adjuntos: { nombre: string; contenido: string }[]) {
  return enviarCorreo({
    para: s.email,
    asunto: `Tu factura del pedido ${referencia(s.order_id)}`,
    responderA: CORREO_TIENDA,
    adjuntos,
    html: plantilla(
      'Aquí está tu factura',
      `<p style="margin:0;">Te adjuntamos la factura (PDF y XML) de tu pedido <strong>${referencia(s.order_id)}</strong>, a nombre de <strong>${escaparHtml(
        s.razon_social
      )}</strong> (${escaparHtml(s.rfc)}).</p>
       <p style="margin:16px 0 0;color:#9a9aa6;font-size:13px;">Si algo no cuadra, responde este correo.</p>`
    ),
  });
}

/** Al cliente: por qué no se pudo emitir. */
export function avisarRechazoAlCliente(s: SolicitudDeFactura) {
  return enviarCorreo({
    para: s.email,
    asunto: `Sobre tu solicitud de factura · ${referencia(s.order_id)}`,
    responderA: CORREO_TIENDA,
    html: plantilla(
      'No pudimos emitir tu factura',
      `<p style="margin:0;">Revisamos tu solicitud del pedido <strong>${referencia(s.order_id)}</strong> y no pudimos emitirla:</p>
       <p style="margin:16px 0 0;color:#1c1c22;">${escaparHtml(s.note ?? '')}</p>
       <p style="margin:16px 0 0;">Puedes enviarla otra vez con los datos corregidos en <a href="${SITIO}/facturacion" style="color:#b08ba5;">skinworld.shop/facturacion</a> o responder este correo.</p>`
    ),
  });
}
