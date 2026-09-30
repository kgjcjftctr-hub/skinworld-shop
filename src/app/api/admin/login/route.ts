import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, createSessionToken } from '@/lib/admin-auth';
import { ipDe, limitar, olvidar, respuestaDeLimite } from '@/lib/limite';

const INTENTOS = 5;
const VENTANA_MS = 15 * 60_000;

/** Comparación de duración constante, para no filtrar la contraseña por tiempos. */
function coincide(recibida: string, esperada: string) {
  const a = createHash('sha256').update(recibida).digest();
  const b = createHash('sha256').update(esperada).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const ip = ipDe(request);
  const clave = `admin-login:${ip}`;

  const limite = limitar(clave, INTENTOS, VENTANA_MS);
  if (!limite.permitido) {
    console.warn(`Login de administración bloqueado por intentos repetidos desde ${ip}`);
    return respuestaDeLimite(
      limite.esperaSegundos,
      `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(limite.esperaSegundos / 60)} minutos.`
    );
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  const esperada = process.env.ADMIN_PASSWORD;

  if (!esperada) {
    console.error('ADMIN_PASSWORD no está configurada');
    return NextResponse.json({ error: 'El acceso no está configurado' }, { status: 500 });
  }

  if (!password || !coincide(password, esperada)) {
    // Se registra el intento sin la contraseña: sirve para notar un ataque,
    // y guardarla convertiría el registro en el problema.
    console.warn(`Intento de acceso fallido al panel desde ${ip}`);
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  // Un acceso correcto limpia el contador, para que quien sí entra no quede
  // bloqueado por haberse equivocado antes.
  olvidar(clave);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // La sesión caduca a los siete días; al vencer, la cookie deja de enviarse
    // y el panel vuelve a pedir la contraseña.
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
