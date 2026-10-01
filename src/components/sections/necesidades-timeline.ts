/** Valores puros del recorrido: el mismo scroll produce el mismo cuadro. */
export const limitar = (n: number) => Math.min(1, Math.max(0, n));
export function transicion(p: number, inicio: number, fin: number) {
  const t = limitar((p - inicio) / (fin - inicio));
  return t * t * (3 - 2 * t);
}
export function estadoNecesidad(p: number, indice: number) {
  const inicio = 0.12 + indice * 0.1;
  const entrada = transicion(p, inicio - 0.02, inicio + 0.02);
  const salida = transicion(p, inicio + 0.08, indice === 7 ? 1 : inicio + 0.12);
  return {
    opacidad: entrada * (1 - salida),
    y: (1 - entrada) * 28 - salida * 24,
    escala: 0.94 + entrada * 0.06 - salida * 0.035,
  };
}
export const indiceNecesidad = (p: number) => Math.min(7, Math.max(0, Math.floor((p - 0.12 + 1e-9) / 0.1)));
export const centroNecesidad = (indice: number) => 0.17 + indice * 0.1;
