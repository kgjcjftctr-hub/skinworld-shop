import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { ipDe, limitar, respuestaDeLimite } from '@/lib/limite';

/**
 * Estado de un pago para la página de confirmación. Devuelve lo mínimo que esa
 * página necesita: si el cobro se completó y por cuánto. No se devuelve el
 * correo ni ningún otro dato del cliente, porque cualquiera que tuviera el
 * identificador de la sesión podría leerlos desde aquí.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: 'Falta session_id' }, { status: 400 });
  }

  const limite = limitar(`sesion:${ipDe(request)}`, 30, 60_000);
  if (!limite.permitido) {
    return respuestaDeLimite(limite.esperaSegundos, 'Demasiadas consultas. Espera un momento.');
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      amountTotal: session.amount_total != null ? session.amount_total / 100 : null,
    });
  } catch (err) {
    console.error('Failed to retrieve checkout session:', err);
    return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 500 });
  }
}
