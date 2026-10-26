/**
 * Máximo de piezas de un mismo producto por pedido. El producto y el carrito no
 * dejan pasar de aquí y el pago usa el mismo tope, así que el total que ve el
 * comprador siempre es el que se cobra.
 */
export const CANTIDAD_MAXIMA = 99;

export function cantidadValida(cantidad: unknown): number {
  return Math.max(1, Math.min(CANTIDAD_MAXIMA, Math.round(Number(cantidad)) || 1));
}
