import 'server-only';
import { getSupabase } from '@/lib/supabase';
import { etiquetaDeEstado, type Disponibilidad, type Estado } from '@/lib/estados-pedido';
import type { Pedido } from '@/lib/pedidos';

/** Quién hizo el cambio, tal como queda en el historial. */
export type Actor = 'tienda' | 'stripe' | 'sistema';

/** Error de una regla del pedido, con el mensaje que ve la tienda y su código HTTP. */
export class ErrorDePedido extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

interface ErrorDeSupabase {
  code?: string;
  message?: string;
}

/** Las funciones de la migración 003 todavía no existen en la base. */
export function faltaMigracion(error: ErrorDeSupabase | null | undefined) {
  if (!error) return false;
  // PGRST202: función inexistente; PGRST205 / 42P01: tabla inexistente.
  return ['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code ?? '');
}

const FALTA_MIGRACION = new ErrorDePedido(
  'Falta aplicar supabase/migraciones/003-pedidos-mepiel.sql en Supabase. No se guardó ningún cambio.',
  503
);

/** Traduce el aviso de la base (p. ej. «FALTA_COMPRA:2») a algo que la tienda entienda. */
function traducir(error: ErrorDeSupabase): ErrorDePedido {
  if (faltaMigracion(error)) return FALTA_MIGRACION;
  const [clave, dato] = (error.message ?? '').split(':');
  const n = Number(dato);
  const productos = (cantidad: number) => (cantidad === 1 ? '1 producto' : `${cantidad} productos`);

  switch (clave) {
    case 'PEDIDO_NO_EXISTE':
      return new ErrorDePedido('El pedido no existe.', 404);
    case 'ESTADO_CAMBIO':
      return new ErrorDePedido(
        `Este pedido ya está en «${etiquetaDeEstado(dato)}». Se actualizó la vista; revisa antes de volver a intentarlo.`,
        409
      );
    case 'TRANSICION_NO_PERMITIDA':
      return new ErrorDePedido('Ese cambio de etapa no está permitido.', 409);
    case 'SIN_ARTICULOS':
      return new ErrorDePedido('El pedido no tiene productos registrados.', 409);
    case 'FALTA_DISPONIBILIDAD':
      return new ErrorDePedido(`Falta confirmar con MEPIEL la disponibilidad de ${productos(n)}.`, 409);
    case 'FALTA_COMPRA':
      return new ErrorDePedido(`Falta marcar como comprados a MEPIEL ${productos(n)}.`, 409);
    case 'FALTA_GUIA':
      return new ErrorDePedido('Escribe el número de guía o, si no hay, cómo se entrega.', 400);
    case 'FALTA_MOTIVO':
      return new ErrorDePedido('Escribe el motivo. Queda en el historial del pedido.', 400);
    case 'GUIA_FUERA_DE_ETAPA':
      return new ErrorDePedido('La guía se captura cuando el pedido está en preparación o ya salió.', 409);
    case 'PEDIDO_CERRADO':
      return new ErrorDePedido(
        `Un pedido ya está en «${etiquetaDeEstado(dato)}» y sus productos no se pueden cambiar.`,
        409
      );
    case 'COMPRA_SIN_DISPONIBILIDAD':
      return new ErrorDePedido('Primero marca el producto como disponible en MEPIEL.', 409);
    case 'YA_COMPRADO':
      return new ErrorDePedido('Ese producto ya se compró. Deshaz la compra antes de cambiar su disponibilidad.', 409);
    case 'ARTICULO_NO_EXISTE':
      return new ErrorDePedido('Uno de los productos ya no existe. Recarga la página.', 404);
    default:
      console.error('Error inesperado del pedido:', error.code, error.message);
      return new ErrorDePedido('No se pudo guardar el cambio.', 500);
  }
}

export async function cambiarEstado(cambio: {
  pedido: string;
  de: Estado;
  a: Estado;
  actor: Actor;
  nota?: string | null;
  guia?: string | null;
  guiaUrl?: string | null;
}): Promise<Pedido> {
  const { data, error } = await getSupabase().rpc('cambiar_estado_pedido', {
    p_pedido: cambio.pedido,
    p_de: cambio.de,
    p_a: cambio.a,
    p_actor: cambio.actor,
    p_nota: cambio.nota ?? null,
    p_guia: cambio.guia ?? null,
    p_guia_url: cambio.guiaUrl ?? null,
  });
  if (error) throw traducir(error);
  return data as Pedido;
}

export async function actualizarGuia(pedido: string, guia: string, guiaUrl: string | null, actor: Actor) {
  const { data, error } = await getSupabase().rpc('actualizar_guia_pedido', {
    p_pedido: pedido,
    p_guia: guia,
    p_guia_url: guiaUrl,
    p_actor: actor,
  });
  if (error) throw traducir(error);
  return data as Pedido;
}

export async function actualizarArticulos(cambio: {
  articulos: number[];
  disponibilidad?: Disponibilidad;
  comprado?: boolean;
  folio?: string | null;
  nota?: string | null;
  actor: Actor;
}) {
  const { data, error } = await getSupabase().rpc('actualizar_articulos_pedido', {
    p_articulos: cambio.articulos,
    p_disponibilidad: cambio.disponibilidad ?? null,
    p_comprado: cambio.comprado ?? null,
    p_folio: cambio.folio ?? null,
    p_actor: cambio.actor,
    p_nota: cambio.nota ?? null,
  });
  if (error) throw traducir(error);
  return (data ?? []) as { id: number; order_id: string }[];
}

/**
 * Deja en el historial que se mandó (o no) un correo al cliente. Sólo guarda la
 * plantilla y el resultado, no el contenido ni la dirección. Si la tabla aún no
 * existe, no pasa nada: el correo ya salió.
 */
export async function registrarCorreo(pedido: string, plantilla: string, resultado: { enviado: boolean; motivo?: string }) {
  const { error } = await getSupabase()
    .from('order_events')
    .insert({
      order_id: pedido,
      kind: 'correo',
      actor: 'sistema',
      data: { plantilla, enviado: resultado.enviado, ...(resultado.motivo ? { motivo: resultado.motivo.slice(0, 200) } : {}) },
    });
  if (error && !faltaMigracion(error)) console.warn('No se registró el correo en el historial:', error.message);
}

/** Algo que pasó con el pago y no cambia la etapa (p. ej. un reembolso parcial). */
export async function registrarNota(pedido: string, kind: 'pago' | 'nota', actor: Actor, nota: string, datos: Record<string, unknown> = {}) {
  const { error } = await getSupabase().from('order_events').insert({ order_id: pedido, kind, actor, note: nota, data: datos });
  if (error && !faltaMigracion(error)) console.warn('No se registró la nota en el historial:', error.message);
}
