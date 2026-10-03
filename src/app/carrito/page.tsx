'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '@/store/cart';
import { useShippingAddress, isShippingAddressComplete } from '@/store/shipping-address';
import { ShippingAddressForm } from '@/components/checkout/shipping-address-form';
import { formatPrice } from '@/utils';
import { COSTO_DE_ENVIO } from '@/lib/envio';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const items = useCart((state) => state.items);
  const removeItem = useCart((state) => state.removeItem);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const subtotal = useCart((state) => state.getTotalPrice());
  const shippingAddress = useShippingAddress((state) => state.address);
  const [checkingOut, setCheckingOut] = useState(false);
  const addressComplete = isShippingAddressComplete(shippingAddress);

  const handleCheckout = async () => {
    if (!addressComplete) {
      toast.error('Completa tu dirección de envío antes de pagar');
      return;
    }

    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, cartQuantity: item.cartQuantity })),
          shippingAddress,
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
  const shipping = COSTO_DE_ENVIO;
  const total = subtotal + shipping;

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast('Producto eliminado', { description: name });
  };

  if (items.length === 0) {
    return (
      <div className="sw-container flex min-h-[60vh] flex-col items-center justify-center py-sw-section text-center">
        <ShoppingBag className="h-12 w-12 text-sw-pink-deep" strokeWidth={1.25} aria-hidden />
        <h1 className="mt-6 font-display text-sw-h2 font-semibold text-sw-ink">Tu carrito está vacío</h1>
        <p className="mt-3 max-w-sw-prose text-sw-body text-sw-muted">Aún no has agregado productos al carrito.</p>
        <Link href="/tienda" className="sw-btn sw-btn-primary mt-8 h-12">
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-40 pt-8 sm:pt-12 lg:pb-sw-section">
      <div className="sw-container">
        <Link
          href="/tienda"
          className="inline-flex min-h-[2.75rem] items-center gap-2 text-sw-small font-semibold text-sw-muted hover:text-sw-pink-deep"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Continuar comprando</span>
        </Link>

        <h1 className="mt-4 font-display text-sw-h1 font-semibold text-sw-ink">Mi carrito</h1>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          {/* Productos */}
          <section aria-label="Productos en el carrito">
            <ul className="divide-y divide-sw-border border-y border-sw-ink/80">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const unitPrice = item.priceWithIVA || Math.round(item.price * 1.16);
                  return (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, x: 80, transition: { duration: 0.25 } }}
                      className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 sm:grid-cols-[7rem_1fr] sm:gap-6"
                    >
                      <Link
                        href={`/producto/${encodeURIComponent(item.slug)}`}
                        className="aspect-square overflow-hidden rounded-sw border border-sw-border bg-sw-white"
                        tabIndex={-1}
                        aria-hidden
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-full w-full object-contain p-2"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                      </Link>

                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          {item.brand && <p className="text-sw-xs font-semibold tracking-wide text-sw-muted">{item.brand}</p>}
                          <Link
                            href={`/producto/${encodeURIComponent(item.slug)}`}
                            className="mt-1 block font-display text-lg font-semibold leading-snug text-sw-ink hover:text-sw-pink-deep"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1.5 text-sw-body font-semibold tabular-nums text-sw-ink">
                            {formatPrice(unitPrice)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <div className="flex h-11 items-center rounded-full border border-sw-border bg-sw-white px-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                              aria-label={`Disminuir cantidad de ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-sw-ink transition-colors hover:bg-sw-pink-pale"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sw-small font-semibold tabular-nums text-sw-ink">
                              <span className="sr-only">Cantidad: </span>
                              {item.cartQuantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                              aria-label={`Aumentar cantidad de ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-sw-ink transition-colors hover:bg-sw-pink-pale"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id, item.name)}
                            className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sw-small text-sw-muted transition-colors hover:text-sw-pink-deep"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            Quitar<span className="sr-only"> {item.name}</span>
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </section>

          {/* Dirección y resumen. El formulario se monta una sola vez: en móvil
              queda debajo de los productos y en escritorio, dentro de la columna
              fija junto al resumen. Montarlo dos veces y esconder uno con CSS
              hacía que cada código postal se consultara por duplicado. */}
          <div>
            <div className="space-y-6 lg:sticky lg:top-24">
            <ShippingAddressForm />
            <div className="hidden rounded-sw-lg border border-sw-border bg-sw-white p-6 lg:block">
              <h2 className="font-display text-xl font-semibold text-sw-ink">Resumen del pedido</h2>

              <dl className="mt-5 space-y-3 border-b border-sw-border pb-5 text-sw-small">
                <div className="flex justify-between text-sw-text">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold tabular-nums text-sw-ink">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-sw-muted">
                  <dt>Incluye IVA (16%)</dt>
                  <dd className="tabular-nums">{formatPrice(tax)}</dd>
                </div>
                <div className="flex justify-between text-sw-text">
                  <dt>Envío</dt>
                  <dd className="font-semibold tabular-nums text-sw-ink">
                    {formatPrice(shipping)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-sw-body font-semibold text-sw-ink">Total</span>
                <span className="text-2xl font-semibold tabular-nums text-sw-ink">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="mt-1 text-right text-sw-xs text-sw-muted">Precios en pesos mexicanos (MXN), IVA incluido</p>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut || !addressComplete}
                className="sw-btn sw-btn-primary mt-6 h-12 w-full text-[0.9375rem]"
              >
                <span>{checkingOut ? 'Redirigiendo...' : 'Proceder al pago'}</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              {!addressComplete && (
                <p className="mt-3 text-center text-sw-small text-sw-muted">
                  Completa tu dirección de envío para continuar
                </p>
              )}
              <Link href="/tienda" className="sw-btn sw-btn-secondary mt-3 h-12 w-full">
                Seguir comprando
              </Link>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen fijo abajo en el celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sw-border bg-sw-warm-white/95 p-4 shadow-sw-md backdrop-blur lg:hidden">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sw-small font-semibold text-sw-ink">
            Total <span className="font-normal text-sw-muted">(IVA incluido)</span>
          </span>
          <span className="text-xl font-semibold tabular-nums text-sw-ink">{formatPrice(total)}</span>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkingOut || !addressComplete}
          className="sw-btn sw-btn-primary h-12 w-full text-[0.9375rem]"
        >
          <span>{checkingOut ? 'Redirigiendo...' : 'Proceder al pago'}</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
        {!addressComplete && (
          <p className="mt-2 text-center text-sw-xs text-sw-muted">Completa tu dirección de envío para continuar</p>
        )}
      </div>
    </div>
  );
}
