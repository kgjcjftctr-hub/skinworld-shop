'use client';

import Link from 'next/link';
import { ImagenProducto } from '@/components/imagen-producto';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, cn } from '@/utils';
import { useCart } from '@/store/cart';
import type { Product } from '@/types';

/**
 * Tarjeta única de producto. El enlace cubre toda la tarjeta con un
 * pseudo-elemento, y el botón "Agregar" queda encima y fuera de ese enlace:
 * así no hay un botón dentro de un enlace, que el teclado y los lectores de
 * pantalla no pueden separar.
 *
 * La foto siempre se ve completa (object-contain) sobre blanco, porque los
 * empaques llegan con fondo blanco y proporciones distintas.
 */
export function ProductCard({
  product,
  prioritaria = false,
  variante = 'estandar',
}: {
  product: Product & Record<string, any>;
  prioritaria?: boolean;
  /** 'destacada' ocupa una columna completa con foto grande y descripción. */
  variante?: 'estandar' | 'destacada';
}) {
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

  const enlace = `/producto/${encodeURIComponent(product.slug)}`;

  if (variante === 'destacada') {
    return (
      <article className="group relative grid gap-5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:items-center sm:gap-8">
        <div className="relative aspect-square overflow-hidden rounded-sw border border-sw-border bg-sw-white">
          {discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-sw-pink-deep px-3 py-1 text-sw-xs font-bold tabular-nums text-white">
              -{discount}%
            </span>
          )}
          <ImagenProducto
            src={product.image}
            alt=""
            prioritaria={prioritaria}
            className="h-full w-full object-contain p-[9%] transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.03]"
          />
        </div>
        <div>
          {product.brand && (
            <p className="text-sw-xs font-semibold tracking-wide text-sw-muted">{product.brand}</p>
          )}
          <h3 className="mt-2 font-display text-sw-h3 font-semibold text-sw-ink">
            <Link
              href={enlace}
              className="rounded-sw-sm text-sw-ink after:absolute after:inset-0 after:z-0 after:content-[''] hover:text-sw-pink-deep group-hover:text-sw-pink-deep"
            >
              {product.name}
            </Link>
          </h3>
          {product.category && <p className="mt-1 text-sw-small text-sw-muted">{product.category}</p>}
          {product.description && (
            <p className="mt-4 line-clamp-3 text-sw-body text-sw-text">{product.description}</p>
          )}
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
            <span className="text-xl font-semibold tabular-nums text-sw-ink">{formatPrice(priceWithIVA)}</span>
            {compareAtPriceWithIVA && (
              <span className="text-sw-small tabular-nums text-sw-muted line-through">
                <span className="sr-only">Antes </span>
                {formatPrice(compareAtPriceWithIVA)}
              </span>
            )}
            <span className="text-sw-xs text-sw-muted">IVA incluido</span>
          </p>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
            className="sw-btn sw-btn-primary relative z-10 mt-5 h-12"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Agregar al carrito
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-sw border border-sw-border bg-sw-white">
        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-sw-pink-deep px-2.5 py-1 text-[0.6875rem] font-bold tabular-nums text-white">
            -{discount}%
          </span>
        )}
        <ImagenProducto
          src={product.image}
          alt=""
          prioritaria={prioritaria}
          className="h-full w-full object-contain p-[8%] transition-transform duration-sw-slow ease-sw [@media(hover:hover)]:group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        {product.brand && (
          <p className="mb-1 truncate text-[0.6875rem] font-semibold tracking-wide text-sw-muted sm:text-sw-xs">
            {product.brand}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.5em] font-display text-[0.9375rem] font-semibold leading-[1.25] text-sw-ink sm:text-[1.0625rem]">
          <Link
            href={enlace}
            className="rounded-sw-sm text-sw-ink after:absolute after:inset-0 after:z-0 after:content-[''] hover:text-sw-pink-deep group-hover:text-sw-pink-deep"
          >
            {product.name}
          </Link>
        </h3>
        {product.category && (
          <p className="mt-1 hidden text-sw-xs text-sw-muted sm:block">{product.category}</p>
        )}

        <div className="mt-auto flex flex-col gap-2.5 pt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[1.0625rem] font-semibold tabular-nums text-sw-ink sm:text-lg">
                {formatPrice(priceWithIVA)}
              </span>
              {compareAtPriceWithIVA && (
                <span className="text-sw-xs tabular-nums text-sw-muted line-through">
                  <span className="sr-only">Antes </span>
                  {formatPrice(compareAtPriceWithIVA)}
                </span>
              )}
            </p>
            <p className="text-[0.6875rem] text-sw-muted sm:text-sw-xs">IVA incluido</p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
            className={cn(
              'relative z-10 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4',
              'bg-sw-pink-pale text-sw-small font-semibold text-sw-pink-deep',
              'transition-colors duration-sw-fast ease-sw hover:bg-sw-pink-deep hover:text-white'
            )}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            <span>Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
