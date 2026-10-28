import 'server-only';
import { formatPrice } from '@/utils';
import { CORREO_TIENDA, SITIO, enviarCorreo, escaparHtml, plantilla } from '@/lib/correo';
import { etiquetaDeEstado, type Estado } from '@/lib/estados-pedido';

export interface DireccionDeEnvio {
  nombre: string;
  telefono: string;
  codigoPostal: string;
  estado: string;
  municipio: string;
  colonia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  referencias: string;
}

export interface ArticuloDelPedido {
  name: string;
  quantity: number;
  amount_total: number;
}

export interface Pedido {
  id: string;
  created_at: string;
  status: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_name: string | null;
  shipping_address: DireccionDeEnvio | null;
  amount_total: number;
  items: ArticuloDelPedido[] | null;
  /** Número de guía de la paquetería, cuando la tienda lo capturó. */
  tracking?: string | null;
  tracking_url?: string | null;
  packed_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  stripe_payment_intent?: string | null;
}

export function direccionEnUnaLinea(pedido: Pedido): string {
  const d = pedido.shipping_address;
  if (!d) return '';
  const interior = d.numeroInterior ? ` Int. ${d.numeroInterior}` : '';
  return [
    `${d.calle ?? ''} ${d.numeroExterior ?? ''}${interior}`.trim(),
    d.colonia,
    d.municipio,
    d.estado,
    d.codigoPostal ? `CP ${d.codigoPostal}` : '',
    d.referencias,
  ]
    .filter(Boolean)
    .join(', ');
}

function tablaDeProductos(pedido: Pedido) {
  const filas = (pedido.items ?? [])
    .map(
      (p) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f4;">${escaparHtml(p.name)} <span style="color:#9a9aa6;">× ${escaparHtml(p.quantity)}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f4;text-align:right;white-space:nowrap;">${formatPrice(p.amount_total)}</td>
      </tr>`
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    ${filas}
    <tr>
      <td style="padding:12px 0 0;font-weight:700;color:#1c1c22;">Total</td>
      <td style="padding:12px 0 0;text-align:right;font-weight:700;color:#1c1c22;">${formatPrice(pedido.amount_total)}</td>
    </tr>
  </table>`;
}

/**
 * Dirección de entrega. Al cliente se le muestra sólo a dónde va su paquete;
 * el teléfono sale únicamente en el aviso a la tienda, que es quien lo usa.
 */
function bloqueDeEnvio(pedido: Pedido, { conTelefono = false } = {}) {
  return `<p style="margin:16px 0 4px;font-weight:700;color:#1c1c22;">Se entrega en</p>
    <p style="margin:0;color:#4a4a55;">${escaparHtml(pedido.shipping_name)}<br>${escaparHtml(direccionEnUnaLinea(pedido))}${
      conTelefono && pedido.customer_phone ? `<br>Tel. ${escaparHtml(pedido.customer_phone)}` : ''
    }</p>`;
}

const referencia = (pedido: Pedido) => pedido.id.slice(0, 8).toUpperCase();

/** Número de guía, cuando la tienda lo capturó al marcar el envío. */
function bloqueDeGuia(pedido: Pedido) {
  if (!pedido.tracking) return '';
  const numero = `<strong style="color:#1c1c22;">${escaparHtml(pedido.tracking)}</strong>`;
  const enlace = pedido.tracking_url
    ? `<br><a href="${escaparHtml(pedido.tracking_url)}" style="color:#b08ba5;">Seguir el envío</a>`
    : '';
  return `<p style="margin:16px 0 0;">Número de guía: ${numero}${enlace}</p>`;
}

/** Aviso a la tienda de que entró un pedido. */
export function correoPedidoNuevo(pedido: Pedido) {
  const pagoPendiente = pedido.status === 'pending_payment';
  return {
    para: CORREO_TIENDA,
    asunto: `${pagoPendiente ? 'Pedido con pago pendiente' : 'Pedido nuevo'} ${referencia(pedido)} · ${formatPrice(pedido.amount_total)}`,
    responderA: pedido.customer_email ?? undefined,
    html: plantilla(
      `Pedido nuevo de ${pedido.shipping_name ?? 'un cliente'}`,
      `<p style="margin:0;">Referencia <strong>${referencia(pedido)}</strong>, ${
        pagoPendiente
          ? 'con pago pendiente en Stripe. No lo pidas a MEPIEL hasta que el pago se acredite: te llegará otro aviso.'
          : 'pagado con Stripe. Está en «Recibido», listo para pedirse a MEPIEL.'
      }</p>
       ${tablaDeProductos(pedido)}
       ${bloqueDeEnvio(pedido, { conTelefono: true })}
       <p style="margin:16px 0 0;">Correo del cliente: ${escaparHtml(pedido.customer_email ?? '—')}</p>
       <p style="margin:24px 0 0;">
         <a href="${SITIO}/admin/pedidos" style="display:inline-block;background:#1c1c22;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">Ver en el panel</a>
       </p>`
    ),
  };
}

/** Confirmación al cliente de que su pedido entró. */
export function correoConfirmacion(pedido: Pedido) {
  return {
    para: pedido.customer_email ?? '',
    asunto: `Recibimos tu pedido ${referencia(pedido)}`,
    responderA: CORREO_TIENDA,
    html: plantilla(
      '¡Gracias por tu compra!',
      `<p style="margin:0;">Ya recibimos tu pedido <strong>${referencia(pedido)}</strong>. Ahora confirmamos la disponibilidad de tus productos y te escribimos en cuanto esté confirmado y otra vez cuando salga a entrega.</p>
       ${tablaDeProductos(pedido)}
       ${bloqueDeEnvio(pedido)}
       <p style="margin:20px 0 0;">¿Necesitas factura? Pídela en <a href="${SITIO}/facturacion" style="color:#b08ba5;">skinworld.shop/facturacion</a> con la referencia <strong>${referencia(pedido)}</strong>, en el mismo mes de tu compra.</p>
       <p style="margin:20px 0 0;color:#9a9aa6;font-size:13px;">El recibo del pago te llega por separado desde Stripe, nuestra plataforma de cobro. Si algo no cuadra, responde este correo.</p>`
    ),
  };
}

interface Aviso {
  asunto: string;
  titulo: string;
  texto: string;
  /** La dirección sólo acompaña a los avisos en los que el paquete se mueve. */
  conDireccion?: boolean;
  conGuia?: boolean;
}

/**
 * Correo al cliente al llegar a cada etapa. «Por confirmar con MEPIEL» no avisa
 * porque es trabajo interno: el cliente ya sabe por la confirmación que se está
 * revisando la disponibilidad, y el siguiente aviso es cuando queda confirmada.
 */
const AVISOS: Partial<Record<Estado, Aviso>> = {
  pending_payment: {
    asunto: 'Recibimos tu pedido, falta el pago',
    titulo: 'Tu pedido quedó registrado',
    texto:
      'Tu pedido quedó registrado y el pago todavía no se acredita. En cuanto se confirme te escribimos; si el pago no se completa, el pedido se cancela y no se te cobra nada.',
  },
  confirmed: {
    asunto: 'Confirmamos tus productos',
    titulo: 'Tus productos están confirmados',
    texto: 'Ya confirmamos la disponibilidad de todos los productos de tu pedido. Lo siguiente es prepararlo para el envío; te avisamos cuando salga.',
  },
  preparing: {
    asunto: 'Estamos preparando tu pedido',
    titulo: 'Estamos preparando tu pedido',
    texto: 'Tu pedido ya se está preparando para el envío. Te escribimos otra vez cuando salga, con el número de guía.',
    conDireccion: true,
  },
  shipped: {
    asunto: 'Tu pedido va en camino',
    titulo: 'Tu pedido va en camino',
    texto:
      'Tu pedido ya salió. En la Ciudad de México y Área Metropolitana la entrega tarda de 1 a 3 días hábiles; al resto de la República, de 3 a 5 días hábiles.',
    conDireccion: true,
    conGuia: true,
  },
  delivered: {
    asunto: 'Tu pedido fue entregado',
    titulo: 'Tu pedido fue entregado',
    texto: 'Nos marcan tu pedido como entregado. Si algo no llegó bien, respóndenos este correo y lo resolvemos.',
  },
  cancelled: {
    asunto: 'Tu pedido fue cancelado',
    titulo: 'Tu pedido fue cancelado',
    texto:
      'Cancelamos tu pedido. Si ya se había hecho el cobro, te escribimos cuando procesemos el reembolso. Si tienes dudas, responde este correo.',
  },
  refunded: {
    asunto: 'Procesamos tu reembolso',
    titulo: 'Procesamos tu reembolso',
    texto:
      'Procesamos el reembolso de tu pedido al mismo método con el que pagaste. El tiempo para que se refleje depende de tu banco. Si tienes dudas, responde este correo.',
  },
};

/** Correo que se le manda al cliente en cada etapa. */
export function correoEtapa(pedido: Pedido, etapa: Estado) {
  const aviso = AVISOS[etapa];
  if (!aviso) return null;

  return {
    para: pedido.customer_email ?? '',
    asunto: `${aviso.asunto} · ${referencia(pedido)}`,
    responderA: CORREO_TIENDA,
    html: plantilla(
      aviso.titulo,
      `<p style="margin:0;">${escaparHtml(aviso.texto)}</p>
       <p style="margin:16px 0 0;">Pedido <strong>${referencia(pedido)}</strong> · ${escaparHtml(etiquetaDeEstado(etapa))}</p>
       ${aviso.conGuia ? bloqueDeGuia(pedido) : ''}
       ${tablaDeProductos(pedido)}
       ${aviso.conDireccion ? bloqueDeEnvio(pedido) : ''}`
    ),
  };
}

/** Aviso al cliente cuando la guía se captura o corrige después de salir el pedido. */
export function correoGuia(pedido: Pedido) {
  return {
    para: pedido.customer_email ?? '',
    asunto: `Número de guía de tu pedido · ${referencia(pedido)}`,
    responderA: CORREO_TIENDA,
    html: plantilla(
      'Este es el número de guía de tu pedido',
      `<p style="margin:0;">Pedido <strong>${referencia(pedido)}</strong></p>
       ${bloqueDeGuia(pedido)}`
    ),
  };
}

export async function avisarPedidoNuevoALaTienda(pedido: Pedido) {
  return enviarCorreo(correoPedidoNuevo(pedido));
}

export async function confirmarPedidoAlCliente(pedido: Pedido) {
  return enviarCorreo(correoConfirmacion(pedido));
}

export async function avisarEtapaAlCliente(pedido: Pedido, etapa: Estado) {
  const correo = correoEtapa(pedido, etapa);
  if (!correo) return { enviado: false, motivo: 'esta etapa no manda correo' };
  return enviarCorreo(correo);
}

export async function avisarGuiaAlCliente(pedido: Pedido) {
  return enviarCorreo(correoGuia(pedido));
}

/**
 * Aviso a la tienda cuando un pago se cobró pero el pedido no se pudo guardar.
 * Stripe reintenta el webhook, pero si los reintentos también fallan este
 * correo es lo único que delata la venta perdida, así que incluye el
 * identificador de la sesión para poder rescatarla a mano desde Stripe.
 */
export async function avisarPedidoNoGuardado(sesion: string, causa: unknown) {
  return enviarCorreo({
    para: CORREO_TIENDA,
    asunto: `Revisar: un pago no se pudo registrar (${sesion.slice(-8)})`,
    html: plantilla(
      'Un pago entró pero el pedido no se guardó',
      `<p style="margin:0;">Stripe confirmó un cobro y la tienda no pudo guardar el pedido. Stripe va a reintentar el aviso durante las próximas horas; si el problema era pasajero, el pedido aparecerá solo en el panel.</p>
       <p style="margin:16px 0 0;">Si no aparece, la venta existe en Stripe y hay que capturarla a mano.</p>
       <p style="margin:16px 0 0;"><strong>Sesión de pago:</strong> ${escaparHtml(sesion)}</p>
       <p style="margin:8px 0 0;"><strong>Motivo técnico:</strong> ${escaparHtml(
         causa instanceof Error ? causa.message : String(causa)
       )}</p>`
    ),
  });
}
