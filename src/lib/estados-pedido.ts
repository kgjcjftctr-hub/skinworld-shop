/**
 * Etapas de un pedido y qué cambios se permiten entre ellas. Lo usan el panel
 * (para saber qué botones mostrar) y el servidor (para validar antes de pedirle
 * el cambio a la base). La regla que manda es la de la base:
 * transicion_permitida() en supabase/migraciones/003-pedidos-mepiel.sql. Si se
 * cambia una, hay que cambiar la otra.
 */
export const ESTADOS = {
  pending_payment: { etiqueta: 'Pago pendiente' },
  received: { etiqueta: 'Recibido' },
  awaiting_supplier: { etiqueta: 'Por confirmar con MEPIEL' },
  confirmed: { etiqueta: 'Confirmado' },
  preparing: { etiqueta: 'En preparación' },
  shipped: { etiqueta: 'Enviado' },
  delivered: { etiqueta: 'Entregado' },
  cancelled: { etiqueta: 'Cancelado' },
  refunded: { etiqueta: 'Reembolsado' },
} as const;

export type Estado = keyof typeof ESTADOS;

export const LISTA_DE_ESTADOS = Object.keys(ESTADOS) as Estado[];

export const TRANSICIONES: Record<Estado, Estado[]> = {
  pending_payment: ['received', 'cancelled'],
  received: ['awaiting_supplier', 'cancelled', 'refunded'],
  awaiting_supplier: ['confirmed', 'cancelled', 'refunded'],
  confirmed: ['preparing', 'cancelled', 'refunded'],
  preparing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: ['refunded'],
  refunded: [],
};

/** Texto del botón que lleva el pedido a cada etapa. */
export const ACCION_HACIA: Record<Estado, string> = {
  pending_payment: 'Marcar pago pendiente',
  received: 'Pago acreditado',
  awaiting_supplier: 'Pedir a MEPIEL',
  confirmed: 'MEPIEL confirmó',
  preparing: 'Pasar a preparación',
  shipped: 'Marcar enviado',
  delivered: 'Marcar entregado',
  cancelled: 'Cancelar pedido',
  refunded: 'Marcar reembolsado',
};

/** Etapas en las que todavía hay algo que hacer con MEPIEL o con el envío. */
export const ESTADOS_ABIERTOS: Estado[] = ['received', 'awaiting_supplier', 'confirmed', 'preparing'];

/** Etapas cuyos productos se le piden a MEPIEL. */
export const ESTADOS_POR_COMPRAR: Estado[] = ['received', 'awaiting_supplier', 'confirmed'];

/**
 * Valores que guardaba la tienda antes de las nueve etapas. La migración 003 los
 * convierte; mientras no se corra, el panel los lee como su equivalente.
 */
const ESTADOS_ANTERIORES: Record<string, Estado> = { paid: 'received', packed: 'preparing' };

export function esEstado(valor: unknown): valor is Estado {
  return typeof valor === 'string' && valor in ESTADOS;
}

export function normalizarEstado(valor: unknown): Estado {
  if (esEstado(valor)) return valor;
  return ESTADOS_ANTERIORES[String(valor)] ?? 'received';
}

export function etiquetaDeEstado(valor: unknown): string {
  return ESTADOS[normalizarEstado(valor)].etiqueta;
}

export function transicionPermitida(de: Estado, a: Estado) {
  return TRANSICIONES[de].includes(a);
}

export const DISPONIBILIDAD = {
  sin_revisar: 'Sin revisar',
  disponible: 'Disponible',
  no_disponible: 'No disponible',
} as const;

export type Disponibilidad = keyof typeof DISPONIBILIDAD;

const UNIDADES = 'ml|g|gr|grs|mg|kg|l|lt|oz|c[aá]psulas|caps|tabletas|piezas|pzas|pz|sobres|ampolletas|toallitas|parches';
const PRESENTACION = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s?(${UNIDADES})\\b\\.?`, 'gi');

/**
 * Contenido del empaque tal como viene en el nombre («Agua Termal 300 Ml» →
 * «300 Ml»). Si el nombre no lo dice, no hay presentación: no se adivina.
 */
export function presentacionDe(nombre: string | null | undefined): string | null {
  const coincidencias = [...String(nombre ?? '').matchAll(PRESENTACION)];
  const ultima = coincidencias[coincidencias.length - 1];
  if (!ultima) return null;
  const unidad = ultima[2];
  return `${ultima[1]} ${unidad.charAt(0).toUpperCase()}${unidad.slice(1).toLowerCase()}`;
}
