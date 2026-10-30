/** Coincidencias de catálogo; nunca establece equivalencia entre tratamientos. */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
const palabras = (s: string) => normalizar(s).split(/[^a-z0-9]+/).filter(Boolean);
const singular = (s: string) => s.length > 4 && s.endsWith('s') ? s.slice(0, -1) : s;
function distancia(a: string, b: string): number {
  let fila = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const nueva = [i];
    for (let j = 1; j <= b.length; j++) nueva[j] = Math.min(nueva[j - 1] + 1, fila[j] + 1, fila[j - 1] + Number(a[i - 1] !== b[j - 1]));
    fila = nueva;
  }
  return fila[b.length];
}
interface Buscable { name: string; brand?: string; category?: string; presentation?: string; variantLabel?: string; }
export function puntuarBusqueda(p: Buscable, consulta: string): number | null {
  const q = normalizar(consulta).slice(0, 120).replace(/\bbloqueador(?:es)?\b/g, 'solar').replace(/\bprotectores? solares?\b/g, 'solar').replace(/\bfotoprotectores\b/g, 'fotoprotector').replace(/\bsolares\b/g, 'solar');
  const tokens = palabras(q).filter(t => !['de', 'la', 'el', 'para', 'con', 'y'].includes(t));
  if (!tokens.length) return null;
  const nombre = palabras(p.name + ' ' + (p.presentation ?? '') + ' ' + (p.variantLabel ?? ''));
  const otros = palabras((p.brand ?? '') + ' ' + (p.category ?? ''));
  const scores = tokens.map(t => {
    if (nombre.includes(t)) return 0;
    if (otros.includes(t)) return 1;
    if (nombre.some(w => w.startsWith(t) || singular(w) === singular(t))) return 2;
    if (otros.some(w => w.startsWith(t) || singular(w) === singular(t))) return 3;
    // No aproximar concentraciones, tamaños ni tonos numéricos.
    if (t.length >= 5 && !/\d/.test(t) && [...nombre, ...otros].some(w => !/\d/.test(w) && Math.abs(w.length - t.length) <= 1 && distancia(t, w) <= 1)) return 5;
    return null;
  });
  if (scores.some(s => s === null)) return null;
  return scores.reduce<number>((sum, s) => sum + (s ?? 0), 0);
}
