'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/utils';
import { useCart } from '@/store/cart';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product & Record<string, any> }) {
  const addItem = useCart((state) => state.addItem);

  const priceWithIVA = product.priceWithIVA ?? Math.round(product.price * 1.16);
  const compareAtPriceWithIVA = product.compareAtPrice
    ? product.compareAtPriceWithIVA ?? Math.round(product.compareAtPrice * 1.16)
    : undefined;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success('Agregado al carrito', { description: product.name });
  };

  return (
    <Link href={`/producto/${encodeURIComponent(product.slug)}`} className="group block h-full">
      <div className="flex h-full flex-col rounded-2xl p-2.5 transition-shadow duration-300 hover:shadow-card">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
          {product.brand && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 font-accent text-[11px] font-semibold uppercase tracking-wide text-primary-800 shadow-sm">
              {product.brand}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-gold-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f1f3f5" width="400" height="400"/%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Imagen no disponible
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col px-1 pt-4">
          {product.category && (
            <p className="mb-1 font-accent text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {product.category}
            </p>
          )}
          <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-ink transition-colors group-hover:text-primary-700">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="mb-3 line-clamp-1 text-sm text-slate-500">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-auto pt-2">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold text-ink">
                {formatPrice(priceWithIVA)}
              </span>
              {compareAtPriceWithIVA && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(compareAtPriceWithIVA)}
                </span>
              )}
            </div>
            <p className="mb-3 text-xs text-slate-400">Con IVA</p>

            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-2.5 font-accent text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-800 hover:shadow-card"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
