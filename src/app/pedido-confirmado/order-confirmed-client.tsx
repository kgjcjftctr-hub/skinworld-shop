'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock3, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useShippingAddress } from '@/store/shipping-address';
import { vistaDeConfirmacion, type EstadoDeSesion } from '@/lib/estado-confirmacion';
import { formatPrice } from '@/utils';

export function OrderConfirmedClient() {
  const sessionId = useSearchParams().get('session_id');
  const clearCart = useCart((state) => state.clearCart);
  const clearAddress = useShippingAddress((state) => state.clearAddress);
  const [info, setInfo] = useState<EstadoDeSesion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const consultar = async (intento: number) => {
      try {
        const res = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error('No se pudo consultar el pago');
        const data: EstadoDeSesion = await res.json();
        if (!active) return;
        setInfo(data);
        setLoading(false);

        const vista = vistaDeConfirmacion(data);
        if (vista === 'registrado') {
          clearCart();
          clearAddress();
        } else if (vista === 'registrando' && intento < 6) {
          timer = setTimeout(() => consultar(intento + 1), 3000);
        }
      } catch {
        if (!active) return;
        setLoading(false);
      }
    };
    void consultar(0);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, clearCart, clearAddress]);

  const vista = vistaDeConfirmacion(info);
  const titulo = {
    registrado: '¡Pago recibido y pedido registrado!',
    registrando: 'Pago recibido; estamos registrando tu pedido',
    pendiente: 'Tu pago está pendiente',
    cancelado: 'El pago no se completó',
    reembolsado: 'Este pago fue reembolsado',
    sin_verificar: 'No pudimos verificar el estado del pago',
  }[vista];

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-sw-warm-white px-sw-gutter">
      <div className="mx-auto max-w-md text-center">
        {loading || vista === 'registrando' ? (
          <Loader2 className="mx-auto mb-6 h-14 w-14 animate-spin text-sw-pink-deep" strokeWidth={1.5} aria-hidden />
        ) : vista === 'registrado' ? (
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" strokeWidth={1.5} aria-hidden />
        ) : vista === 'pendiente' ? (
          <Clock3 className="mx-auto mb-6 h-16 w-16 text-sw-pink-deep" strokeWidth={1.5} aria-hidden />
        ) : (
          <XCircle className="mx-auto mb-6 h-16 w-16 text-red-400" strokeWidth={1.5} aria-hidden />
        )}

        <h1 className="mb-3 font-display text-sw-h2 font-semibold text-sw-ink">
          {loading ? 'Verificando tu pago...' : titulo}
        </h1>

        {!loading && vista === 'registrado' && (
          <p className="mb-8 text-sw-muted">
            {info?.amountTotal != null && <>Pago acreditado por {formatPrice(info.amountTotal)}. </>}
            Tu pedido quedó registrado. Te avisaremos sobre los siguientes pasos.
          </p>
        )}
        {!loading && vista === 'registrando' && (
          <p className="mb-8 text-sw-muted">
            Stripe confirma el pago, pero aún no aparece el pedido. No vuelvas a pagar. Si no recibes una confirmación, contáctanos.
          </p>
        )}
        {!loading && vista === 'pendiente' && (
          <p className="mb-8 text-sw-muted">
            La acreditación puede tardar. Conserva el comprobante de tu método de pago y no repitas el cobro mientras esté pendiente.
          </p>
        )}
        {!loading && vista === 'cancelado' && (
          <p className="mb-8 text-sw-muted">El pago no se acreditó. Puedes volver al carrito o contactarnos si necesitas ayuda.</p>
        )}
        {!loading && vista === 'reembolsado' && (
          <p className="mb-8 text-sw-muted">El reembolso puede tardar en verse reflejado según tu banco.</p>
        )}
        {!loading && vista === 'sin_verificar' && (
          <p className="mb-8 text-sw-muted">Consulta tu método de pago o contáctanos antes de intentar pagar otra vez.</p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/tienda" className="sw-btn sw-btn-primary h-12 px-7">Seguir comprando</Link>
          <Link href="/contacto" className="sw-btn sw-btn-secondary h-12 px-7">Contactarnos</Link>
        </div>
      </div>
    </div>
  );
}
