import manifiesto from '@/data/personas-necesidades.json';

/**
 * La misma mujer, siempre de frente y en el mismo encuadre, dentro de una
 * esfera de cristal. Por categoría hay una foto del problema; el resultado es
 * una sola foto con la piel perfecta, igual para todas. Las fotos están
 * alineadas entre sí (scripts/personas/preparar-estados.py): cambiar de una a
 * otra nunca mueve la cabeza.
 */

export interface Fuente { escritorio: string; movil: string }
export interface EstadosCategoria { antes: Fuente; despues: Fuente }
export type Perfil = keyof Fuente;

export const SLUGS: Record<string, string> = {
  Acné: 'acne',
  Dermatitis: 'dermatitis',
  Antiedad: 'antiedad',
  Manchas: 'manchas',
  'Cabello y Uñas': 'cabello-y-unas',
  'Piel de Bebé': 'piel-de-bebe',
  'Protección Solar': 'proteccion-solar',
  Suplementos: 'suplementos',
};

const datos = manifiesto as unknown as { perfecta: Fuente; problemas: Record<string, Fuente | null> };

/** Antes (el problema de la categoría) y después (la piel perfecta), o null
 *  si la categoría aún no tiene foto (conserva su arte). */
export function estadosDe(categoria: string): EstadosCategoria | null {
  const problema = datos.problemas[SLUGS[categoria] ?? ''];
  return problema ? { antes: problema, despues: datos.perfecta } : null;
}

/** Ruta de la foto del estado `s` (2·categoría + 0 antes / 1 después). */
export function fuenteDeEstado(categorias: (EstadosCategoria | null)[], s: number, perfil: Perfil): string | null {
  const c = categorias[Math.floor(s / 2)];
  if (!c) return null;
  return (s % 2 === 0 ? c.antes : c.despues)[perfil];
}

/**
 * Mantiene decodificadas solo las fotos cercanas al estado visible. Cuando el
 * scroll pide un estado, primero se carga ese y luego sus vecinos; las fotos
 * lejanas se sueltan.
 */
export class Precarga {
  private cache = new Map<string, HTMLImageElement>();
  private listas = new Set<string>();
  alLlegar: (() => void) | null = null;

  lista(url: string | null) {
    return !!url && this.listas.has(url);
  }

  /** La imagen ya decodificada, o null si aún no llega. */
  imagen(url: string | null) {
    return url && this.listas.has(url) ? this.cache.get(url) ?? null : null;
  }

  pedir(urls: (string | null)[]) {
    const quedan = new Set(urls.filter(Boolean) as string[]);
    for (const [url, img] of this.cache) {
      if (!quedan.has(url)) {
        img.src = '';
        this.cache.delete(url);
        this.listas.delete(url);
      }
    }
    for (const url of quedan) {
      if (this.cache.has(url)) continue;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      this.cache.set(url, img);
      img.decode().catch(() => undefined).then(() => {
        if (this.cache.get(url) !== img || !img.naturalWidth) return;
        this.listas.add(url);
        this.alLlegar?.();
      });
    }
  }

  vaciar() {
    this.pedir([]);
  }
}
