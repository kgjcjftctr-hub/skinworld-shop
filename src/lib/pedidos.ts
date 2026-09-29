import 'server-only';
import { formatPrice } from '@/utils';
import { CORREO_TIENDA, SITIO, enviarCorreo, escaparHtml, plantilla } from '@/lib/correo';

/**
 * Etapas por las que pasa un pedido. El valor se guarda en la columna `status`
 * de la tabla `orders`; `paid` es el que escribe el webhook de Stripe al
 * confirmarse el pago.
 */
export const ETAPAS = {
  paid: { etiqueta: 'Pagado', siguiente: 'packed', accion: 'Marcar empaquetado' },
  packed: { etiqueta: 'Empaquetado', siguiente: 'shipped', accion: 'Marcar enviado' },
  shipped: { etiqueta: 'Enviado', siguiente: 'delivered', accion: 'Marcar entregado' },
  delivered: { etiqueta: 'Entregado', siguiente: null, accion: null },
  cancelled: { etiqueta: 'Cancelado', siguiente: null, accion: null },
} as const;

export type Etapa = keyof typeof ETAPAS;

export function esEtapa(valor: unknown): valor is Etapa {
  return typeof valor === 'string' && valor in ETAPAS;
}

export function etiquetaDeEtapa(valor: unknown): string {
  return esEtapa(valor) ? ETAPAS[valor].etiqueta : String(valor ?? '—');
}

export interface Pedido {
  id: string;
  created_at: string;
  status: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_name: string | null;
  shipping_address: Record<string, string> | null;
  amount_total: number;
  items: { name: string; quantity: number; amount_total: number }[] | null;
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

function bloqueDeEnvio(pedido: Pedido) {
  return `<p style="margin:16px 0 4px;font-weight:700;color:#1c1c22;">Se entrega en</p>
    <p style="margin:0;color:#4a4a55;">${escaparHtml(pedido.shipping_name)}<br>${escaparHtml(direccionEnUnaLinea(pedido))}${
      pedido.customer_phone ? `<br>Tel. ${escaparHtml(pedido.customer_phone)}` : ''
    }</p>`;
}

const referencia = (pedido: Pedido) => pedido.id.slice(0, 8).toUpperCase();

/** Aviso a la tienda de que entró un pedido. */
export function correoPedidoNuevo(pedido: Pedido) {
  return {
    para: CORREO_TIENDA,
    asunto: `Pedido nuevo ${referencia(pedido)} · ${formatPrice(pedido.amount_total)}`,
    responderA: pedido.customer_email ?? undefined,
    html: plantilla(
      `Pedido nuevo de ${pedido.shipping_name ?? 'un cliente'}`,
      `<p style="margin:0;">Referencia <strong>${referencia(pedido)}</strong>, pagado con Stripe.</p>
       ${tablaDeProductos(pedido)}
       ${bloqueDeEnvio(pedido)}
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
      `<p style="margin:0;">Ya recibimos tu pedido <strong>${referencia(pedido)}</strong> y lo estamos preparando. Te avisamos en cuanto salga a entrega.</p>
       ${tablaDeProductos(pedido)}
       ${bloqueDeEnvio(pedido)}
       <p style="margin:20px 0 0;color:#9a9aa6;font-size:13px;">El recibo del pago te llega por separado desde Stripe, nuestra plataforma de cobro. Si algo no cuadra, responde este correo.</p>`
    ),
  };
}

const AVISOS: Partial<Record<Etapa, { asunto: string; titulo: string; texto: string }>> = {
  packed: {
    asunto: 'Tu pedido ya está empaquetado',
    titulo: 'Tu pedido ya está listo',
    texto: 'Ya empaquetamos tu pedido y está esperando a la paquetería. Te escribimos otra vez cuando salga.',
  },
  shipped: {
    asunto: 'Tu pedido va en camino',
    titulo: 'Tu pedido va en camino',
    texto:
      'Tu pedido ya salió. En la Ciudad de México y Área Metropolitana la entrega tarda de 1 a 3 días hábiles; al resto de la República, de 3 a 5 días hábiles.',
  },
  delivered: {
    asunto: 'Tu pedido fue entregado',
    titulo: 'Tu pedido fue entregado',
    texto: 'Nos marcan tu pedido como entregado. Si algo no llegó bien, respóndenos este correo y lo resolvemos.',
  },
};

/** Correo que se le manda al cliente en cada etapa. */
export function correoEtapa(pedido: Pedido, etapa: Etapa) {
  const aviso = AVISOS[etapa];
  if (!aviso) return null;

  return {
    para: pedido.customer_email ?? '',
    asunto: `${aviso.asunto} · ${referencia(pedido)}`,
    responderA: CORREO_TIENDA,
    html: plantilla(
      aviso.titulo,
      `<p style="margin:0;">${escaparHtml(aviso.texto)}</p>
       <p style="margin:16px 0 0;">Pedido <strong>${referencia(pedido)}</strong></p>
       ${tablaDeProductos(pedido)}
       ${bloqueDeEnvio(pedido)}`
    ),
  };
}

export async function avisarPedidoNuevoALaTienda(pedido: Pedido) {
  return enviarCorreo(correoPedidoNuevo(pedido));
}

export async function confirmarPedidoAlCliente(pedido: Pedido) {
  return enviarCorreo(correoConfirmacion(pedido));
}

export async function avisarEtapaAlCliente(pedido: Pedido, etapa: Etapa) {
  const correo = correoEtapa(pedido, etapa);
  if (!correo) return { enviado: false, motivo: 'esta etapa no manda correo' };
  return enviarCorreo(correo);
}
