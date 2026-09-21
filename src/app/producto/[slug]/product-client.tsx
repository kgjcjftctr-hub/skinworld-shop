'use client';

import { useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';
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
  const addItem = useCart((state) => state.addItem);

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

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/tienda"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a la tienda</span>
        </Link>

        <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
            {discount > 0 && (
              <span className="absolute right-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            )}
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f1f3f5" width="400" height="400"/%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                Imagen no disponible
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            {product.brand && (
              <p className="mb-3 font-accent text-xs font-bold uppercase tracking-wider text-gold-600">
                {product.brand}
              </p>
            )}
            <h1 className="mb-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              {product.name}
            </h1>
            {product.category && <p className="mb-6 text-slate-500">{product.category}</p>}

            <div className="mb-6 border-t border-slate-100" />

            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-semibold text-ink">
                  {formatPrice(priceWithIVA)}
                </span>
                {compareAtPriceWithIVA && (
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(compareAtPriceWithIVA)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">Precio en pesos mexicanos (MXN), incluye IVA</p>
            </div>

            {product.description && (
              <p className="mb-6 leading-relaxed text-slate-600">{product.description}</p>
            )}

            {(variants.length > 0 || product.variantLabel) && (
              <div className="mb-6">
                <span className="mb-2 block font-accent text-sm font-semibold text-ink">
                  Presentación
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variantLabel && (
                    <span className="rounded-full border-2 border-ink bg-ink px-4 py-2 text-sm font-semibold text-white">
                      {product.variantLabel}
                    </span>
                  )}
                  {variants.map((variant: any) => (
                    <Link
                      key={variant.id}
                      href={`/producto/${encodeURIComponent(variant.slug)}`}
                      className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-ink hover:text-ink"
                    >
                      {variant.variantLabel}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 border-t border-slate-100" />

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-6">
              <span className="font-accent text-sm font-semibold text-ink">Cantidad</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Disminuir cantidad"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold text-ink">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Aumentar cantidad"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-4 font-accent text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Agregar al Carrito</span>
            </button>

            {product.sku && (
              <p className="mt-4 text-xs text-slate-400">
                SKU: <span className="font-mono">{product.sku}</span>
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-8 font-display text-3xl font-bold text-ink">Productos relacionados</h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related: any) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
