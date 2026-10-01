/**
 * Línea de tiempo de la intro de Skinworld. Todo es una función pura del
 * avance del scroll (p, de 0 a 1) más un reloj para lo que debe seguir vivo
 * aunque nadie haga scroll (el aleteo, la respiración). Por eso la escena
 * avanza y retrocede igual: el mismo p siempre produce el mismo cuadro.
 *
 *   0.00–0.12  Oscuridad borgoña; nace una luz rosa.
 *   0.12–0.28  La mariposa entra desde la profundidad, en curva.
 *   0.28–0.48  Pasa rozando la cámara y se aleja.
 *   0.48–0.65  Gira hasta quedar de frente; el fondo se vuelve rosa polvo.
 *   0.65–0.76  Centrada y viva, sin texto.
 *   0.76–0.88  Aparece Skinworld debajo de la mariposa, sin encimarse.
 *   0.88–0.96  Aparecen los botones y el encabezado.
 *   0.955–1.00 La mariposa y el nombre se vuelven el logo del encabezado.
 */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Avance local de p dentro del tramo [a, b], de 0 a 1. */
export const tramo = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
export const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;

export const suave = {
  entraSale: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sale: (t: number) => 1 - Math.pow(1 - t, 3),
  entra: (t: number) => t * t * t,
  saleExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  seno: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

const bezier = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Medidas que cambian solo al redimensionar la ventana. */
export interface Medidas {
  /** Ancho y alto visibles de la escena (alto pequeño del navegador, 100svh). */
  W: number;
  H: number;
  movil: boolean;
  /** Ancho de la mariposa con escala 1. */
  base: number;
  /** Tamaño de letra de Skinworld y su caja sin transformar. */
  letra: number;
  nombreAncho: number;
  nombreAlto: number;
  /** Alto del bloque de botones. */
  accionesAlto: number;
  /** Espacio libre arriba por el encabezado. */
  margenSuperior: number;
  /** Fracción de pantalla que la sección siguiente sube sobre la escena al final. */
  solape: number;
  /** Fracción de p en la que la sección siguiente empieza a entrar. */
  pEntradaSiguiente: number;
}

/** Destino en el encabezado, medido en la pantalla. */
export interface Destino {
  mariposa: Rect;
  nombre: Rect;
  letraNombre: number;
}

const PROPORCION = 407 / 512;

/**
 * Dónde queda cada pieza de la firma (mariposa, nombre, botones) cuando
 * Skinworld ya apareció. Se calcula con las medidas reales para que la
 * mariposa nunca toque el nombre y los botones nunca queden bajo la sección
 * que entra desde abajo.
 */
export function composicionDeFirma(m: Medidas) {
  const separacion1 = Math.max(m.movil ? 26 : 30, m.H * 0.035);
  const separacion2 = Math.max(m.movil ? 26 : 32, m.H * 0.04);

  // Espacio útil: debajo del encabezado y arriba de donde estará la sección
  // siguiente en p = 0.96 (sigue entrando desde abajo).
  const limiteInferior = m.H * (1 - m.solape * tramo(0.96, m.pEntradaSiguiente, 1)) - 16;
  const disponible = limiteInferior - m.margenSuperior;

  // Si no cabe todo, la mariposa se hace más chica (nunca se enciman).
  const fijo = separacion1 + m.nombreAlto + separacion2 + m.accionesAlto;
  const escalaIdeal = m.movil ? 0.86 : 0.8;
  const escalaQueCabe = (disponible - fijo) / (m.base * PROPORCION);
  const escalaFirma = clamp(Math.min(escalaIdeal, escalaQueCabe), 0.4, escalaIdeal);
  const altoMariposa = m.base * escalaFirma * PROPORCION;
  const total = altoMariposa + fijo;
  const arriba = m.margenSuperior + Math.max(0, (disponible - total) / 2);

  const centro = m.H / 2;
  const yMariposa = arriba + altoMariposa / 2 - centro;
  const yNombre = arriba + altoMariposa + separacion1 + m.nombreAlto / 2 - centro;
  const yAcciones = yNombre + m.nombreAlto / 2 + separacion2 + m.accionesAlto / 2;
  // Al final los botones suben a una altura cómoda, arriba de la sección que entra.
  const yAccionesFinal = Math.min(yAcciones, m.H * (m.movil ? 0.44 : 0.43) - centro);
  return { escalaFirma, yMariposa, yNombre, yAcciones, yAccionesFinal };
}

export interface Estado {
  fondoRosa: number;
  fondoClaro: number;
  vineta: number;
  grano: number;
  campos: [number, number, number];
  camposDesplazamiento: number;
  haz: number;
  hazAvance: number;
  luz: { x: number; y: number; escala: number; opacidad: number };
  particulasOpacidad: number;
  cercania: number;
  mariposa: {
    x: number;
    y: number;
    escala: number;
    rx: number;
    ry: number;
    rz: number;
    desenfoque: number;
    opacidad: number;
    amplitud: number;
    frecuencia: number;
    vida: number;
  };
  estela: number;
  frente: number;
  nombre: { x: number; y: number; escala: number; opacidad: number; tracking: number; desenfoque: number; subida: number };
  acciones: { y: number; opacidad: number; subida: number };
  encabezado: number;
  logoMariposa: number;
  logoNombre: number;
  interfaz: number;
  pista: number;
}

/** Trayectoria y giros de la mariposa, sin la firma final. */
function vuelo(p: number, movil: boolean, W: number, H: number) {
  const kx = movil ? 0.45 : 1;
  const ky = movil ? 0.6 : 1;
  const r = {
    x: 0.24 * W * kx,
    y: -0.26 * H * ky,
    escala: 0.06,
    rx: 25,
    ry: 55,
    rz: -15,
    desenfoque: movil ? 0 : 6,
    opacidad: 0,
    amplitud: 62,
    frecuencia: 2.4,
  };
  if (p < 0.12) return r;
  if (p < 0.28) {
    const t = tramo(p, 0.12, 0.28);
    const u = suave.seno(t);
    r.x = bezier(0.24, 0.3, -0.3, -0.16, u) * W * kx;
    r.y = bezier(-0.26, 0.08, -0.18, 0.06, u) * H * ky;
    r.escala = mezcla(0.06, 0.42, suave.sale(t));
    r.ry = mezcla(55, 25, u);
    r.rx = mezcla(25, 10, u);
    r.rz = mezcla(-15, -8, u);
    r.desenfoque = movil ? 0 : mezcla(6, 0, tramo(p, 0.12, 0.22));
    r.opacidad = tramo(p, 0.12, 0.15);
    return r;
  }
  r.opacidad = 1;
  r.desenfoque = 0;
  if (p < 0.48) {
    const t = tramo(p, 0.28, 0.48);
    const u = suave.entraSale(t);
    r.x = bezier(-0.16, -0.08, movil ? 0.14 : 0.26, 0.06, u) * W * (movil ? 0.7 : 1);
    r.y = bezier(0.06, 0.22, 0.12, -0.08, u) * H * ky;
    const pico = movil ? 2.6 : 4.2;
    r.escala =
      p < 0.385
        ? mezcla(0.42, pico, suave.entra(tramo(p, 0.28, 0.385)))
        : mezcla(pico, 0.7, suave.sale(tramo(p, 0.385, 0.48)));
    r.ry = mezcla(25, 40, t);
    r.rx = mezcla(10, 15, t);
    r.rz = mezcla(-8, 10, t);
    r.amplitud = 58;
    r.frecuencia = 2.0;
    return r;
  }
  if (p < 0.65) {
    const u = suave.entraSale(tramo(p, 0.48, 0.65));
    r.x = mezcla(0.06 * W, 0, u);
    r.y = mezcla(-0.08 * H, 0, u);
    r.escala = mezcla(0.7, 1, u);
    r.ry = mezcla(40, 0, u);
    r.rx = mezcla(15, 0, u);
    r.rz = mezcla(10, 0, u);
    r.amplitud = mezcla(45, 14, u);
    r.frecuencia = mezcla(1.6, 0.6, u);
    return r;
  }
  r.x = 0;
  r.y = 0;
  r.escala = 1;
  r.rx = 0;
  r.ry = 0;
  r.rz = 0;
  r.amplitud = mezcla(14, 8, tramo(p, 0.65, 0.72));
  r.frecuencia = 0.35;
  return r;
}

export function estado(p: number, m: Medidas, destino: Destino | null): Estado {
  const { W, H, movil } = m;
  const firma = composicionDeFirma(m);
  const v = vuelo(p, movil, W, H);

  // De la mariposa centrada a su lugar sobre el nombre.
  const aFirma = suave.entraSale(tramo(p, 0.76, 0.88));
  let mx = v.x;
  let my = mezcla(v.y, firma.yMariposa, aFirma);
  let mescala = mezcla(v.escala, firma.escalaFirma, aFirma);
  let mopacidad = v.opacidad;
  let amplitud = v.amplitud;
  let vida = tramo(p, 0.65, 0.7) * (1 - tramo(p, 0.95, 0.96));

  // La firma viaja al encabezado. La mariposa va adelante y el nombre la
  // sigue, así sus trayectorias no se cruzan.
  const viajeMariposa = suave.entraSale(tramo(p, 0.955, 0.995));
  const viajeNombre = suave.entraSale(tramo(p, 0.965, 1));
  if (destino && viajeMariposa > 0) {
    const dx = destino.mariposa.x + destino.mariposa.w / 2 - W / 2;
    const dy = destino.mariposa.y + destino.mariposa.h / 2 - H / 2;
    mx = mezcla(mx, dx, viajeMariposa);
    my = mezcla(my, dy, viajeMariposa);
    mescala = mezcla(mescala, destino.mariposa.w / m.base, viajeMariposa);
    amplitud = mezcla(amplitud, 0, viajeMariposa);
  }
  mopacidad *= 1 - tramo(p, 0.985, 0.995);

  // El nombre nunca toca a la mariposa: se coloca siempre debajo de su borde
  // inferior real (incluido el flotar y la inclinación por el cursor), y sube
  // con ella mientras ella sube a su lugar.
  const subida = mezcla(30, 0, suave.sale(tramo(p, 0.76, 0.86)));
  const bordeMariposa = my + (m.base * mescala * PROPORCION) / 2 + 12;
  const separacionMinima = Math.max(m.movil ? 22 : 26, m.H * 0.03);
  let nx = 0;
  let ny = Math.max(firma.yNombre + subida, bordeMariposa + separacionMinima + m.nombreAlto / 2);
  let nescala = 1;
  if (destino && viajeNombre > 0) {
    const dx = destino.nombre.x + destino.nombre.w / 2 - W / 2;
    const dy = destino.nombre.y + destino.nombre.h / 2 - H / 2;
    nx = mezcla(0, dx, viajeNombre);
    ny = mezcla(ny, dy, viajeNombre);
    nescala = mezcla(1, destino.letraNombre / m.letra, viajeNombre);
  }

  const cercania = clamp((v.escala - 0.42) / 3.8) * (p < 0.5 ? 1 : 0);
  const claro = tramo(p, 0.62, 0.92);
  const luzCentro = p < 0.12;

  return {
    fondoRosa: suave.entraSale(tramo(p, 0.46, 0.6)),
    fondoClaro: suave.entraSale(claro),
    vineta: mezcla(0.9, 0, tramo(p, 0.5, 0.85)),
    grano: mezcla(0.07, 0.02, tramo(p, 0.5, 0.9)),
    campos: [
      (1 - tramo(p, 0.5, 0.7)) * 0.9,
      0.35 + 0.45 * tramo(p, 0.2, 0.5) - 0.3 * claro,
      tramo(p, 0.3, 0.55) * (1 - 0.6 * claro),
    ],
    camposDesplazamiento: p,
    haz: 0.24 * tramo(p, 0.06, 0.2) * (1 - tramo(p, 0.58, 0.7)),
    hazAvance: clamp(p / 0.7),
    luz: {
      x: luzCentro ? 0 : mx * 0.85,
      y: luzCentro ? 0 : my * 0.85,
      escala: luzCentro
        ? mezcla(0.15, 1, suave.sale(tramo(p, 0, 0.12)))
        : 1 + cercania * 1.6 + 0.6 * tramo(p, 0.6, 0.8),
      opacidad:
        (luzCentro ? suave.sale(tramo(p, 0.01, 0.12)) * 0.9 : 0.9) *
        (1 - 0.55 * claro) *
        (1 - tramo(p, 0.955, 0.99)),
    },
    particulasOpacidad: tramo(p, 0.03, 0.12) * (1 - 0.75 * tramo(p, 0.6, 0.9)) * (1 - tramo(p, 0.92, 0.97)),
    cercania,
    mariposa: {
      x: mx,
      y: my,
      escala: mescala,
      rx: v.rx,
      ry: v.ry,
      rz: v.rz,
      desenfoque: v.desenfoque,
      opacidad: mopacidad,
      amplitud,
      frecuencia: v.frecuencia,
      vida,
    },
    estela: tramo(p, 0.33, 0.37) * (1 - tramo(p, 0.4, 0.45)),
    frente: tramo(p, 0.14, 0.24) * (1 - tramo(p, 0.55, 0.66)),
    nombre: {
      x: nx,
      y: ny,
      escala: nescala,
      opacidad: tramo(p, 0.76, 0.84) * (1 - tramo(p, 0.99, 1)),
      tracking: mezcla(0.35, 0, suave.saleExpo(tramo(p, 0.76, 0.88))),
      desenfoque: movil ? 0 : mezcla(14, 0, tramo(p, 0.76, 0.86)),
      subida: 0,
    },
    acciones: {
      y: mezcla(firma.yAcciones, firma.yAccionesFinal, suave.entraSale(tramo(p, 0.96, 1))),
      opacidad: tramo(p, 0.88, 0.93),
      subida: mezcla(14, 0, suave.sale(tramo(p, 0.88, 0.93))),
    },
    encabezado: suave.sale(tramo(p, 0.86, 0.94)),
    logoMariposa: tramo(p, 0.985, 0.995),
    logoNombre: tramo(p, 0.99, 1),
    interfaz: tramo(p, 0.02, 0.05) * (1 - tramo(p, 0.82, 0.86)),
    pista: 1 - tramo(p, 0.02, 0.06),
  };
}
