'use client';

import { useState } from 'react';
import { CreditCard, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/utils';
import { useCart } from '@/store/cart';
import { ProductCard } from '@/components/product-card';
import Link from 'next/link';

export function ProductClient({
  product,
  relatedProducts,
  variants = [],
}: {
  product: any;
  relatedProducts: any[];
  variants?: any[];
}) {
  const [quantity, setQuantity] = useState(1);
  // Punto de la imagen sobre el que está el cursor: define qué parte se ve
  // dentro del recuadro de aumento que aparece al lado.
  const [zoom, setZoom] = useState({ activo: false, x: 50, y: 50 });
  const addItem = useCart((state) => state.addItem);

  const seguirCursor = (e: React.MouseEvent<HTMLDivElement>) => {
    const caja = e.currentTarget.getBoundingClientRect();
    setZoom({
      activo: true,
      x: ((e.clientX - caja.left) / caja.width) * 100,
      y: ((e.clientY - caja.top) / caja.height) * 100,
    });
  };

  const priceWithIVA = product.priceWithIVA ?? Math.round(product.price * 1.16);
  const compareAtPriceWithIVA = product.compareAtPrice
    ? product.compareAtPriceWithIVA ?? Math.round(product.compareAtPrice * 1.16)
    : undefined;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success('Agregado al carrito', { description: `${quantity} × ${product.name}` });
  };

  // Galería: la foto principal más las adicionales del catálogo, sin repetir.
  const fotos: string[] = [product.image, ...(product.images ?? [])].filter(
    (src: string | undefined, i: number, todas: (string | undefined)[]): src is string =>
      Boolean(src) && todas.indexOf(src) === i
  );
  const [fotoActiva, setFotoActiva] = useState(0);
  const foto = fotos[fotoActiva];

  return (
    <div className="pb-sw-section">
      <div className="sw-container">
        <nav aria-label="Ruta" className="py-5 text-sw-small text-sw-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/tienda" className="text-sw-muted hover:text-sw-pink-deep">
                Tienda
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={`/tienda?categoria=${encodeURIComponent(product.category)}`}
                    className="text-sw-muted hover:text-sw-pink-deep"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li aria-current="page" className="line-clamp-1 max-w-[20ch] text-sw-text sm:max-w-none">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Galería */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative">
              <div
                onMouseMove={seguirCursor}
                onMouseLeave={() => setZoom((z) => ({ ...z, activo: false }))}
                className="relative aspect-[4/3] overflow-hidden rounded-sw-lg border border-sw-border bg-sw-white sm:aspect-square lg:cursor-zoom-in"
              >
                {discount > 0 && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-sw-pink-deep px-3 py-1 text-sw-xs font-bold tabular-nums text-white">
                    -{discount}%
                  </span>
                )}
                {foto ? (
                  <img
                    decoding="async"
                    src={foto}
                    alt={product.name}
                    className="h-full w-full object-contain p-[7%]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f5edec" width="400" height="400"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sw-small text-sw-muted">
                    Imagen no disponible
                  </div>
                )}
              </div>

              {/* Recuadro con la ampliación. Sólo en pantallas grandes: en móvil
                  no hay cursor que seguir. */}
              {zoom.activo && foto && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-full top-0 z-20 ml-6 hidden aspect-square w-[380px] rounded-sw-lg border border-sw-border bg-sw-white bg-no-repeat shadow-sw-md lg:block"
                  style={{
                    backgroundImage: `url(${foto})`,
                    backgroundSize: '240%',
                    backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                  }}
                />
              )}
            </div>

            {fotos.length > 1 && (
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Fotos del producto">
                {fotos.map((src, i) => (
                  <li key={src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setFotoActiva(i)}
                      aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                      aria-pressed={i === fotoActiva}
                      className={`h-16 w-16 overflow-hidden rounded-sw border bg-sw-white p-1.5 transition-colors sm:h-20 sm:w-20 ${
                        i === fotoActiva ? 'border-sw-ink' : 'border-sw-border hover:border-sw-ink/40'
                      }`}
                    >
                      <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Compra */}
          <div className="lg:py-4">
            {product.brand && (
              <Link
                href={`/tienda?marca=${encodeURIComponent(product.brand)}`}
                className="text-sw-small font-semibold tracking-wide text-sw-pink-deep hover:text-sw-ink"
              >
                {product.brand}
              </Link>
            )}
            <h1 className="mt-2 font-display text-[clamp(1.875rem,1.45rem+1.8vw,2.875rem)] font-semibold leading-[1.1] text-sw-ink">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[1.875rem] font-semibold tabular-nums text-sw-ink">
                {formatPrice(priceWithIVA)}
              </span>
              {compareAtPriceWithIVA && (
                <span className="text-lg tabular-nums text-sw-muted line-through">
                  <span className="sr-only">Antes </span>
                  {formatPrice(compareAtPriceWithIVA)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sw-small text-sw-muted">Precio en pesos mexicanos (MXN), IVA incluido</p>

            {(variants.length > 0 || product.variantLabel) && (
              <div className="mt-8">
                <p className="mb-3 text-sw-small font-semibold text-sw-ink">Presentación</p>
                <ul className="flex flex-wrap gap-2">
                  {product.variantLabel && (
                    <li>
                      <span
                        aria-current="true"
                        className="inline-flex min-h-[2.75rem] items-center rounded-full border border-sw-ink bg-sw-ink px-4 text-sw-small font-semibold text-sw-warm-white"
                      >
                        {product.variantLabel}
                      </span>
                    </li>
                  )}
                  {variants.map((variant: any) => (
                    <li key={variant.id}>
                      <Link
                        href={`/producto/${encodeURIComponent(variant.slug)}`}
                        className="inline-flex min-h-[2.75rem] items-center rounded-full border border-sw-border bg-sw-white px-4 text-sw-small font-medium text-sw-text transition-colors hover:border-sw-ink hover:text-sw-ink"
                      >
                        {variant.variantLabel}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <div className="flex h-14 items-center justify-between rounded-full border border-sw-border bg-sw-white px-1.5 sm:w-40">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sw-ink transition-colors hover:bg-sw-pink-pale"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-base font-semibold tabular-nums text-sw-ink" aria-live="polite">
                  <span className="sr-only">Cantidad: </span>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Aumentar cantidad"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sw-ink transition-colors hover:bg-sw-pink-pale"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button type="button" onClick={handleAddToCart} className="sw-btn sw-btn-primary h-14 flex-1 text-base">
                <ShoppingBag className="h-5 w-5" aria-hidden />
                <span>Agregar al carrito</span>
              </button>
            </div>

            <ul className="mt-6 space-y-2 border-t border-sw-border pt-6 text-sw-small text-sw-text">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-sw-pink-deep" aria-hidden />
                Producto 100% original
              </li>
              <li className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 shrink-0 text-sw-pink-deep" aria-hidden />
                Pago con tarjeta a través de Stripe
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 shrink-0 text-sw-pink-deep" aria-hidden />
                <Link href="/envios" className="text-sw-text underline decoration-sw-pink underline-offset-4 hover:text-sw-pink-deep">
                  Envíos y devoluciones
                </Link>
              </li>
            </ul>

            {product.description && (
              <section aria-labelledby="descripcion-titulo" className="mt-10">
                <h2 id="descripcion-titulo" className="font-display text-2xl font-semibold text-sw-ink">
                  Descripción
                </h2>
                <p className="mt-3 max-w-sw-prose whitespace-pre-line text-sw-body text-sw-text">
                  {product.description}
                </p>
              </section>
            )}

            <aside className="mt-10 flex gap-4 rounded-sw-lg bg-sw-pink-pale p-5">
              <img
                src="/images/dra-karina-alfaro.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <div>
                <p className="font-display text-lg font-semibold text-sw-ink">Selección Skinworld</p>
                <p className="mt-1 text-sw-small text-sw-text">
                  Elegido con criterio médico por la Dra. Karina Alfaro López, especialista en dermatología.
                </p>
                <Link href="/sobre-nosotros" className="mt-2 inline-block text-sw-small font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink">
                  Conocer a la doctora
                </Link>
              </div>
            </aside>

            {product.sku && <p className="mt-6 text-sw-xs text-sw-muted">SKU {product.sku}</p>}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section aria-labelledby="relacionados-titulo" className="mt-sw-section border-t border-sw-border pt-12">
            <h2 id="relacionados-titulo" className="font-display text-sw-h3 font-semibold text-sw-ink">
              También para {product.category ? product.category.toLowerCase() : 'tu piel'}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {relatedProducts.map((related: any) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
