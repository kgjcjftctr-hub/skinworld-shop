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
  // Los textos no se cruzan: el de la categoría que sale se va antes de que
  // aparezca el de la que entra (el fondo sí se funde).
  const textoEntra = transicion(p, inicio + 0.004, inicio + 0.024);
  const textoSale = transicion(p, inicio + 0.078, indice === 7 ? 0.925 : inicio + 0.098);
  return {
    opacidad: entrada * (1 - salida),
    y: (1 - entrada) * 28 - salida * 24,
    escala: 0.94 + entrada * 0.06 - salida * 0.035,
    texto: textoEntra * (1 - textoSale),
  };
}
export const indiceNecesidad = (p: number) => Math.min(7, Math.max(0, Math.floor((p - 0.12 + 1e-9) / 0.1)));
export const centroNecesidad = (indice: number) => 0.17 + indice * 0.1;

const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
const salePronto = (t: number) => 1 - Math.pow(1 - t, 3);
const cuadratica = (t: number) => t * t;

/** Ventana de cada persona alrededor del centro de su categoría. Se traslapa
 *  un poco con la vecina: cuando una sale por la derecha, la siguiente ya se
 *  insinúa por la izquierda. */
const MEDIA_VENTANA = 0.065;

/**
 * Persona de la categoría `indice` en escritorio:
 *   entra por la izquierda → empieza a girar → la piel mejora (dentro de la
 *   secuencia) → sigue girando → sale por la derecha.
 * `giro` es la fracción de la secuencia de cuadros (0 a 1).
 */
export function estadoPersona(p: number, indice: number) {
  const centro = centroNecesidad(indice);
  const t = (p - (centro - MEDIA_VENTANA)) / (2 * MEDIA_VENTANA);
  if (t <= 0 || t >= 1) return { visible: false, t: limitar(t), x: 0, escala: 1, plano: 0, giro: t <= 0 ? 0 : 1, opacidad: 0, luz: 0 };
  // Entra rápido y frena; cruza despacio mientras gira; sale acelerando. Así,
  // cuando la siguiente asoma por la izquierda, la anterior ya va saliendo.
  let x: number;
  if (t < 0.25) x = mezclar(-62, -6, salePronto(t / 0.25));
  else if (t < 0.72) x = mezclar(-6, 6, (t - 0.25) / 0.47);
  else x = mezclar(6, 60, cuadratica((t - 0.72) / 0.28));
  return {
    visible: true,
    t,
    /** Desplazamiento horizontal en vw. */
    x,
    escala: 0.86 + 0.14 * transicion(t, 0, 0.25) - 0.1 * transicion(t, 0.72, 1),
    /** Inclinación del plano para dar profundidad, aparte del giro de la secuencia. */
    plano: mezclar(14, -14, t),
    giro: limitar((t - 0.1) / 0.8),
    opacidad: transicion(t, 0, 0.12) * (1 - transicion(t, 0.88, 1)),
    luz: t,
  };
}

/** En celular cada categoría es un bloque normal: la persona cruza y gira
 *  mientras el bloque atraviesa la pantalla (t de 0 a 1). */
export function estadoPersonaCompacta(t: number) {
  const x = mezclar(-34, 34, transicion(t, 0.08, 0.92));
  return {
    x,
    escala: 0.92 + 0.08 * (1 - Math.abs(t - 0.5) * 2),
    plano: mezclar(10, -10, t),
    giro: limitar((t - 0.18) / 0.64),
    opacidad: transicion(t, 0.02, 0.16) * (1 - transicion(t, 0.86, 0.98)),
  };
}
