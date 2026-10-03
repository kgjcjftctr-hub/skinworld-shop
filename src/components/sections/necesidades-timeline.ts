/** Coreografía reversible: un mismo progreso siempre produce el mismo estado. */
export const limitar = (n: number) => Math.min(1, Math.max(0, n));
export function transicion(p: number, inicio: number, fin: number) {
  const t = limitar((p - inicio) / (fin - inicio));
  return t * t * (3 - 2 * t);
}
export const inicioNecesidad = (i: number) => 0.12 + i * 0.1;
export const centroNecesidad = (i: number) => inicioNecesidad(i) + 0.05;
/** Al saltar desde el índice se llega al problema de la categoría, ya quieto. */
export const destinoNecesidad = (i: number) => inicioNecesidad(i) + 0.025;
export const indiceNecesidad = (p: number) => Math.min(7, Math.max(0, Math.floor((p - 0.12 + 1e-9) / 0.1)));
export function estadoNecesidad(p: number, i: number) {
  const t = (p - inicioNecesidad(i)) / 0.1;
  return {
    opacidad: transicion(t, -0.22, 0.1) * (1 - transicion(t, 0.82, 1.22)),
    texto: transicion(t, 0, 0.15) * (1 - transicion(t, 0.85, 1)),
  };
}

/**
 * Giroscopio de anillos. En el tramo de cada categoría (t de 0 a 1) hay dos
 * mitades: el problema y luego la piel perfecta. El anillo principal gira 180°
 * por mitad: empieza de canto frente al rostro (la tapa), se abre hasta quedar
 * de frente (la enmarca; ahí se detiene) y vuelve a quedar de canto. La foto
 * cambia justo entre mitades, cuando el anillo la tapa.
 * Estados: 2·categoría (problema) y 2·categoría + 1 (piel perfecta).
 */
const abreYCierra = (u: number) => {
  // Rápido al cerrar y abrir; lento con el anillo de frente (rostro a la vista).
  const d = 2 * u - 1;
  return 0.5 + 0.5 * Math.sign(d) * Math.pow(Math.abs(d), 2.6);
};

export function estadoAnillos(p: number) {
  // Ya está en escena cuando la sección sube desde la portada (nada de hueco vacío).
  const presencia = 1 - transicion(p, 0.93, 0.985);
  // Entrada: el anillo esmerilado empieza cerrado, tapándola, y se abre para revelarla.
  if (p < 0.12) return { estado: 0, giro: 90 * transicion(p, 0.015, 0.11), presencia };
  const i = indiceNecesidad(p);
  const t = limitar((p - inicioNecesidad(i)) / 0.1);
  const mitad = Math.min(1.9999, t * 2);
  const h = Math.floor(mitad), u = mitad - h;
  // En la primera mitad de todo el recorrido el anillo ya empieza abierto.
  const s = i === 0 && h === 0 ? Math.max(0.5, abreYCierra(u)) : abreYCierra(u);
  return { estado: 2 * i + h, giro: 180 * (2 * i + h) + 180 * s, presencia };
}

/** Qué tan cerrado está el anillo principal frente al rostro (1 = la tapa). */
export const cierre = (giro: number) => Math.abs(Math.cos((giro * Math.PI) / 180));
