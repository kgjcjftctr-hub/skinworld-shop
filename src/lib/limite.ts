import 'server-only';

/**
 * Límite de peticiones por ventana de tiempo, en memoria del proceso.
 *
 * En Vercel cada instancia tiene su propia memoria y las instancias se reciclan,
 * así que esto no es un límite global exacto: frena el abuso repetido desde una
 * misma IP —que es el caso real— pero no sustituye a un contador compartido si
 * algún día hace falta uno estricto.
 */
type Registro = { conteo: number; expira: number };

const memoria = new Map<string, Registro>();
const MAXIMO_EN_MEMORIA = 5000;

function limpiar(ahora: number) {
  for (const [clave, registro] of memoria) {
    if (registro.expira <= ahora) memoria.delete(clave);
  }
}

export interface Resultado {
  permitido: boolean;
  esperaSegundos: number;
}

export function limitar(clave: string, maximo: number, ventanaMs: number): Resultado {
  const ahora = Date.now();
  if (memoria.size > MAXIMO_EN_MEMORIA) limpiar(ahora);

  const registro = memoria.get(clave);
  if (!registro || registro.expira <= ahora) {
    memoria.set(clave, { conteo: 1, expira: ahora + ventanaMs });
    return { permitido: true, esperaSegundos: 0 };
  }

  if (registro.conteo >= maximo) {
    return { permitido: false, esperaSegundos: Math.ceil((registro.expira - ahora) / 1000) };
  }

  registro.conteo += 1;
  return { permitido: true, esperaSegundos: 0 };
}

/** Borra el contador de una clave, por ejemplo tras un acceso correcto. */
export function olvidar(clave: string) {
  memoria.delete(clave);
}

/** IP del visitante según las cabeceras que pone el proxy de Vercel. */
export function ipDe(request: Request): string {
  const reenviada = request.headers.get('x-forwarded-for');
  const directa = request.headers.get('x-real-ip');
  return (reenviada?.split(',')[0] ?? directa ?? 'desconocida').trim();
}

/** Respuesta estándar cuando se pasa del límite. */
export function respuestaDeLimite(esperaSegundos: number, mensaje: string) {
  return Response.json(
    { error: mensaje },
    { status: 429, headers: { 'Retry-After': String(esperaSegundos) } }
  );
}
