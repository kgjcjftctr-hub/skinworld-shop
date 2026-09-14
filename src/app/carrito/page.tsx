'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '@/store/cart';
import { formatPrice } from '@/utils';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const subtotal = useCart((state) => state.getTotalPrice());
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, cartQuantity: item.cartQuantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || 'No se pudo iniciar el pago');
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setCheckingOut(false);
    }
  };

  // subtotal ya incluye el 16% de IVA (priceWithIVA); aquí solo se
  // desglosa para mostrarlo, no se vuelve a sumar.
  const tax = subtotal - subtotal / 1.16;
  const shipping = subtotal > 500 ? 0 : 100;
  const total = subtotal + shipping;

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast('Producto eliminado', { description: name });
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="mx-auto max-w-md px-4 text-center">
          <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-slate-200" strokeWidth={1} />
          <h1 className="mb-3 font-display text-2xl font-semibold text-ink">
            Tu carrito está vacío
          </h1>
          <p className="mb-8 text-slate-500">Aún no has agregado productos al carrito.</p>
          <Link href="/tienda" className="btn btn-primary">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 pb-32 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/tienda"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continuar comprando</span>
        </Link>

        <h1 className="mb-10 font-display text-4xl font-bold text-ink">Mi Carrito</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-slate-100 border-y border-slate-100">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const unitPrice = item.priceWithIVA || Math.round(item.price * 1.16);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 80, transition: { duration: 0.25 } }}
                      className="flex gap-5 py-6"
                    >
                      {/* Image */}
                      <Link
                        href={`/producto/${encodeURIComponent(item.slug)}`}
                        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                      </Link>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-center">
                        <Link
                          href={`/producto/${encodeURIComponent(item.slug)}`}
                          className="font-display font-semibold text-ink transition-colors hover:text-primary-700"
                        >
                          {item.name}
                        </Link>
                        {item.brand && <p className="mt-1 text-xs text-slate-500">{item.brand}</p>}
                        <p className="mt-2 font-semibold text-ink">{formatPrice(unitPrice)}</p>
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          aria-label="Eliminar"
                          className="text-slate-400 transition-colors hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                            aria-label="Disminuir"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-ink">
                            {item.cartQuantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                            aria-label="Aumentar"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary — sticky on desktop */}
          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-28 rounded-2xl border border-slate-100 p-6">
              <h2 className="mb-6 font-display text-lg font-semibold text-ink">Resumen del Pedido</h2>

              <div className="mb-6 space-y-3 border-b border-slate-100 pb-6 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA (16%)</span>
                  <span className="font-semibold text-ink">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <span className="font-semibold text-ink">
                    {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex items-baseline justify-between">
                <span className="font-accent font-semibold text-ink">Total</span>
                <span className="font-display text-2xl font-semibold text-primary-700">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn btn-primary mb-3 w-full disabled:opacity-50"
              >
                <span>{checkingOut ? 'Redirigiendo...' : 'Proceder al Pago'}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <Link href="/tienda" className="btn btn-secondary w-full">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary — fixed bottom on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="font-accent text-sm font-semibold text-ink">Total</span>
          <span className="font-display text-xl font-semibold text-primary-700">
            {formatPrice(total)}
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="btn btn-primary w-full disabled:opacity-50"
        >
          <span>{checkingOut ? 'Redirigiendo...' : 'Proceder al Pago'}</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
