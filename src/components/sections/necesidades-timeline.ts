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
  // aparezca el de la que entra (el fondo sí se funde). Nada se desplaza:
  // la escena queda quieta y lo único que se mueve es la persona.
  const textoEntra = transicion(p, inicio + 0.004, inicio + 0.024);
  const textoSale = transicion(p, inicio + 0.078, indice === 7 ? 0.925 : inicio + 0.098);
  return {
    opacidad: entrada * (1 - salida),
    texto: textoEntra * (1 - textoSale),
  };
}
export const indiceNecesidad = (p: number) => Math.min(7, Math.max(0, Math.floor((p - 0.12 + 1e-9) / 0.1)));
export const centroNecesidad = (indice: number) => 0.17 + indice * 0.1;

const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;
const salePronto = (t: number) => 1 - Math.pow(1 - t, 3);
const cuadratica = (t: number) => t * t;

/**
 * Persona de la categoría `indice` mientras la escena está fija:
 *   entra por la izquierda → gira y la piel mejora (dentro de la secuencia)
 *   → sigue girando → sale por la derecha.
 * Ocupa exactamente el tramo de su categoría, así que nunca hay dos personas
 * en pantalla: la siguiente entra cuando la anterior ya salió.
 * `x` va de -1 (fuera por la izquierda) a 1 (fuera por la derecha); el CSS
 * lo convierte en distancia según el tamaño de pantalla.
 * `giro` es la fracción de la secuencia de cuadros (0 a 1).
 */
export function estadoPersona(p: number, indice: number) {
  const t = (p - (0.12 + indice * 0.1)) / 0.1;
  if (t <= 0 || t >= 1) return { visible: false, t: limitar(t), x: t <= 0 ? -1 : 1, escala: 1, plano: 0, giro: t <= 0 ? 0 : 1, opacidad: 0, luz: 0 };
  let x: number;
  if (t < 0.18) x = mezclar(-1, -0.05, salePronto(t / 0.18));
  else if (t < 0.82) x = mezclar(-0.05, 0.05, (t - 0.18) / 0.64);
  else x = mezclar(0.05, 1, cuadratica((t - 0.82) / 0.18));
  return {
    visible: true,
    t,
    x,
    escala: 0.9 + 0.1 * transicion(t, 0, 0.18) - 0.08 * transicion(t, 0.82, 1),
    /** Inclinación leve del plano para dar profundidad, aparte del giro de la secuencia. */
    plano: mezclar(8, -8, t),
    giro: limitar((t - 0.06) / 0.88),
    opacidad: transicion(t, 0, 0.1) * (1 - transicion(t, 0.9, 1)),
    luz: t,
  };
}

/** Pantallas sin altura para la escena fija: cada categoría es un bloque
 *  normal y la persona cruza y gira mientras el bloque atraviesa la pantalla
 *  (t de 0 a 1). `x` en la misma escala de -1 a 1. */
export function estadoPersonaCompacta(t: number) {
  const x = mezclar(-0.4, 0.4, transicion(t, 0.08, 0.92));
  return {
    x,
    escala: 0.92 + 0.08 * (1 - Math.abs(t - 0.5) * 2),
    plano: mezclar(8, -8, t),
    giro: limitar((t - 0.18) / 0.64),
    opacidad: transicion(t, 0.02, 0.16) * (1 - transicion(t, 0.86, 0.98)),
  };
}
