import manifiesto from '@/data/personas-necesidades.json';

/**
 * Personas de la sección de necesidades: una secuencia de cuadros por
 * categoría (la persona gira y su piel mejora dentro de la propia secuencia),
 * dibujada en un canvas según el avance del scroll.
 *
 * - Los cuadros se cargan de lo general a lo fino (cada 8, cada 4, cada 2...)
 *   para que el scroll funcione aunque la secuencia no haya terminado de bajar.
 * - Solo se cargan las categorías cercanas a la que está en pantalla y se
 *   liberan las lejanas, así nunca hay ocho secuencias en memoria.
 * - Mientras una categoría no tenga secuencia en el manifiesto, se queda con
 *   la escultura actual: el sistema no cambia nada hasta que llega el asset.
 */

export interface PerfilSecuencia {
  cuadros: number;
  ancho: number;
  alto: number;
  ruta: string;
  formato: 'webp' | 'avif' | 'jpg' | 'png';
}

export interface Persona {
  /** 'unica': la mejora viene dentro de la secuencia. 'doble': dos secuencias
   *  alineadas cuadro por cuadro (antes y después) que se funden. */
  modo: 'unica' | 'doble';
  /** 'transparente' si los cuadros traen canal alfa; 'solido' si traen fondo
   *  liso, en cuyo caso se difuminan los bordes. */
  fondo: 'transparente' | 'solido';
  /** Tramo de la secuencia (0 a 1) en el que ocurre la mejora. */
  mejora: [number, number];
  escritorio: PerfilSecuencia;
  movil: PerfilSecuencia;
  despues?: { escritorio: PerfilSecuencia; movil: PerfilSecuencia };
}

const SLUGS: Record<string, string> = {
  Acné: 'acne',
  Dermatitis: 'dermatitis',
  Antiedad: 'antiedad',
  Manchas: 'manchas',
  'Cabello y Uñas': 'cabello-y-unas',
  'Piel de Bebé': 'piel-de-bebe',
  'Protección Solar': 'proteccion-solar',
  Suplementos: 'suplementos',
};

const datos = manifiesto as unknown as {
  personas: Record<string, Persona | null>;
  muestra: Persona;
};

export const enModoMuestra = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('muestra') === 'personas';

/** Persona de una categoría. Con ?muestra=personas, las categorías que aún no
 *  tienen persona usan la secuencia de prueba, para revisar la coreografía. */
export function personaDe(categoria: string): Persona | null {
  const propia = datos.personas[SLUGS[categoria] ?? ''] ?? null;
  if (propia) return propia;
  return enModoMuestra() ? datos.muestra : null;
}

/** Orden de carga de lo general a lo fino: primero y último, luego cada 8, 4, 2, 1. */
function ordenDeCarga(n: number) {
  const orden: number[] = [];
  const visto = new Set<number>();
  const poner = (i: number) => {
    if (i >= 0 && i < n && !visto.has(i)) {
      visto.add(i);
      orden.push(i);
    }
  };
  poner(0);
  poner(n - 1);
  for (const paso of [8, 4, 2, 1]) for (let i = 0; i < n; i += paso) poner(i);
  return orden;
}

export class Secuencia {
  private imagenes: (HTMLImageElement | null)[];
  private listas: boolean[];
  private cola: number[] = [];
  private enCurso = 0;
  private activa = false;
  /** Se llama cada vez que llega un cuadro nuevo, para repintar si hace falta. */
  alLlegarCuadro: (() => void) | null = null;

  constructor(readonly perfil: PerfilSecuencia) {
    this.imagenes = new Array(perfil.cuadros).fill(null);
    this.listas = new Array(perfil.cuadros).fill(false);
  }

  private url(i: number) {
    return `${this.perfil.ruta}/${String(i + 1).padStart(4, '0')}.${this.perfil.formato}`;
  }

  cargar() {
    if (this.activa) return;
    this.activa = true;
    this.cola = ordenDeCarga(this.perfil.cuadros).filter((i) => !this.listas[i]);
    for (let k = 0; k < 4; k++) this.siguiente();
  }

  /** Carga solo un cuadro (para movimiento reducido). */
  cargarSolo(i: number) {
    if (this.listas[i] || this.imagenes[i]) return;
    this.activa = true;
    this.cola = [i];
    this.siguiente();
  }

  private siguiente(): void {
    if (!this.activa) return;
    const i = this.cola.shift();
    if (i === undefined) return;
    if (this.listas[i]) return this.siguiente();
    this.enCurso++;
    const img = new Image();
    img.decoding = 'async';
    img.src = this.url(i);
    this.imagenes[i] = img;
    const terminar = (ok: boolean) => {
      this.enCurso--;
      if (!this.activa) return;
      this.listas[i] = ok;
      if (ok) this.alLlegarCuadro?.();
      this.siguiente();
    };
    img
      .decode()
      .then(() => terminar(true))
      .catch(() => terminar(img.complete && img.naturalWidth > 0));
  }

  /** Suelta las imágenes para liberar memoria cuando la categoría queda lejos. */
  liberar() {
    this.activa = false;
    this.cola = [];
    this.imagenes.forEach((img) => {
      if (img) img.src = '';
    });
    this.imagenes = new Array(this.perfil.cuadros).fill(null);
    this.listas = new Array(this.perfil.cuadros).fill(false);
  }

  get cargando() {
    return this.activa;
  }

  /** Cuadro listo más cercano al pedido. */
  cercano(i: number): number {
    const n = this.perfil.cuadros;
    const k = Math.max(0, Math.min(n - 1, Math.round(i)));
    if (this.listas[k]) return k;
    for (let d = 1; d < n; d++) {
      if (k - d >= 0 && this.listas[k - d]) return k - d;
      if (k + d < n && this.listas[k + d]) return k + d;
    }
    return -1;
  }

  imagen(i: number) {
    return i >= 0 && this.listas[i] ? this.imagenes[i] : null;
  }
}

/** Una persona dentro de un mundo: su canvas y sus secuencias. */
export class PersonaEnEscena {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private antes: Secuencia;
  private despues: Secuencia | null;
  private ultimo = '';

  constructor(
    readonly contenedor: HTMLElement,
    readonly persona: Persona,
    readonly perfil: 'escritorio' | 'movil'
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'necesidades__persona-lienzo';
    contenedor.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { alpha: true })!;
    this.antes = new Secuencia(persona[perfil]);
    this.despues = persona.modo === 'doble' && persona.despues ? new Secuencia(persona.despues[perfil]) : null;
    const repintar = () => {
      this.ultimo = '';
      this.alNecesitarCuadro?.();
    };
    this.antes.alLlegarCuadro = repintar;
    if (this.despues) this.despues.alLlegarCuadro = repintar;
    contenedor.dataset.fondo = persona.fondo;
    this.medir();
  }

  alNecesitarCuadro: (() => void) | null = null;

  medir() {
    // Tamaño de maqueta (sin transformaciones): el canvas no debe cambiar de
    // resolución mientras la persona escala o se inclina.
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.contenedor.offsetWidth * escala));
    const h = Math.max(1, Math.round(this.contenedor.offsetHeight * escala));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.ultimo = '';
    }
  }

  cargar() {
    this.antes.cargar();
    this.despues?.cargar();
    this.contenedor.dataset.cargada = 'si';
  }

  cargarFinal() {
    const ultimo = this.antes.perfil.cuadros - 1;
    (this.despues ?? this.antes).cargarSolo(ultimo);
  }

  liberar() {
    this.antes.liberar();
    this.despues?.liberar();
    this.contenedor.dataset.cargada = 'no';
    this.ultimo = '';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  get cargando() {
    return this.antes.cargando;
  }

  /** Mezcla antes/después para el modo 'doble', según el tramo de mejora. */
  private mezcla(fraccion: number) {
    const [a, b] = this.persona.mejora;
    const t = Math.min(1, Math.max(0, (fraccion - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  /** Dibuja la persona en la fracción dada de su giro (0 a 1). */
  dibujar(fraccion: number) {
    const n = this.antes.perfil.cuadros;
    const exacto = Math.min(1, Math.max(0, fraccion)) * (n - 1);
    const i = this.antes.cercano(exacto);
    if (i < 0) return;
    const j = this.despues ? this.despues.cercano(exacto) : -1;
    const m = this.despues && j >= 0 ? this.mezcla(fraccion) : 0;
    const clave = `${i}|${j}|${m.toFixed(3)}|${this.canvas.width}`;
    if (clave === this.ultimo) return;
    this.ultimo = clave;

    const { width: W, height: H } = this.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    const pintar = (img: HTMLImageElement | null, alfa: number) => {
      if (!img || alfa <= 0) return;
      // Ajuste "contain": la persona completa, centrada.
      const k = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const w = img.naturalWidth * k;
      const h = img.naturalHeight * k;
      ctx.globalAlpha = alfa;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    };
    pintar(this.antes.imagen(i), 1);
    if (this.despues && j >= 0) pintar(this.despues.imagen(j), m);
    ctx.globalAlpha = 1;
  }
}
