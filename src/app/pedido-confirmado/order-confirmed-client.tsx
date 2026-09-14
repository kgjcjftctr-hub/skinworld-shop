'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/utils';

type SessionInfo = {
  status: string;
  amountTotal: number | null;
  email: string | null;
};

export function OrderConfirmedClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearCart = useCart((state) => state.clearCart);
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data: SessionInfo) => {
        setInfo(data);
        if (data.status === 'paid') {
          clearCart();
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId, clearCart]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-white px-4">
      <div className="mx-auto max-w-md text-center">
        {loading ? (
          <Loader2 className="mx-auto mb-6 h-14 w-14 animate-spin text-primary-500" strokeWidth={1.5} />
        ) : info?.status === 'paid' ? (
          <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" strokeWidth={1.5} />
        ) : (
          <XCircle className="mx-auto mb-6 h-16 w-16 text-red-400" strokeWidth={1.5} />
        )}

        <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
          {loading
            ? 'Verificando tu pago...'
            : info?.status === 'paid'
              ? '¡Gracias por tu compra!'
              : 'No pudimos confirmar tu pago'}
        </h1>

        {!loading && info?.status === 'paid' && (
          <p className="mb-8 text-slate-500">
            {info.amountTotal != null && (
              <>
                Cobramos {formatPrice(info.amountTotal)}
                {info.email && <> a {info.email}</>}. Te contactaremos pronto para coordinar el
                envío.
              </>
            )}
          </p>
        )}

        {!loading && info?.status !== 'paid' && (
          <p className="mb-8 text-slate-500">
            Si crees que esto es un error, contáctanos o intenta de nuevo.
          </p>
        )}

        <Link href="/tienda" className="btn btn-primary">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
