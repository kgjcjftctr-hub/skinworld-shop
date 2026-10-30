'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/utils';
import { ConsultaDermatologa } from './consulta-dermatologa';
import { ImagenProducto } from './imagen-producto';

interface SearchProduct { id: string; name: string; slug: string; price?: number; image?: string; brand?: string; presentation?: string; inStock?: boolean; }
interface Results { products: SearchProduct[]; brands: string[]; categories: string[]; }
const emptyResults: Results = { products: [], brands: [], categories: [] };
const historyKey = 'skinworld-productos-vistos';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<SearchProduct[]>([]);
  const remember = (product: SearchProduct) => {
    const { price: _price, inStock: _stock, ...entry } = product;
    const next = [entry, ...recent.filter(p => p.slug !== entry.slug)].slice(0, 6);
    setRecent(next);
    try { localStorage.setItem(historyKey, JSON.stringify(next)); } catch {}
    onClose();
  };
  const clearHistory = () => { setRecent([]); try { localStorage.removeItem(historyKey); } catch {} };
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(historyKey) ?? '[]');
      if (Array.isArray(saved)) setRecent(saved.filter(p => p && typeof p.name === 'string' && typeof p.slug === 'string' && typeof p.id === 'string').slice(0, 6));
    } catch {}
  }, []);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cerrar = useRef(onClose);
  cerrar.current = onClose;

  useEffect(() => setMounted(true), []);

  // Cerrar con Escape, contener el foco y devolverlo al control que abrió la búsqueda.
  useEffect(() => {
    if (!isOpen) return;
    const focoPrevio = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar.current();
      if (e.key !== 'Tab') return;
      const enfocables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!enfocables?.length) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowPrevio;
      focoPrevio?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) { setQuery(''); setResults(emptyResults); setError(false); setLoading(false); return; }
    const term = query.trim();
    const controller = new AbortController();
    let active = true;
    setResults(emptyResults);
    setError(false);
    setLoading(term.length >= 2);
    if (term.length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Error de búsqueda');
        const data = await res.json();
        if (!Array.isArray(data.products) || !Array.isArray(data.brands) || !Array.isArray(data.categories)) throw new Error('Respuesta inválida');
        if (active) setResults(data);
      } catch {
        if (active && !controller.signal.aborted) setError(true);
      } finally { if (active) setLoading(false); }
    }, 250);
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [query, isOpen]);

  if (!isOpen || !mounted) return null;

  // Se monta en <body> con un portal: el <header> usa backdrop-blur, lo que
  // convierte al encabezado en el bloque contenedor de sus hijos position:fixed
  // y dejaba el fondo oscuro recortado a la altura de la barra superior.
  return createPortal(
    <div
      onClick={onClose}
      className="animate-fade-in fixed inset-0 z-[100] flex items-start justify-center bg-sw-ink/50 px-4 pt-20 sm:pt-28"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
        className="w-full max-w-2xl overflow-hidden rounded-sw-lg bg-sw-warm-white shadow-sw-md"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-display text-2xl">Buscar</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar búsqueda" className="min-h-11 rounded-sw px-3 text-sw-muted hover:bg-sw-pink-pale">Cerrar</button>
        </div>
        <div className="relative">
          <Search className="absolute left-5 top-[1.15rem] h-5 w-5 text-sw-muted" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            aria-label="Buscar productos, marcas o categorías"
            placeholder="Buscar productos, marcas, categorías..."
            maxLength={120}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="!h-14 w-full !rounded-none !border-0 !border-b !border-sw-border !bg-sw-warm-white !py-4 !pl-14 !pr-14 font-display !text-lg focus:!ring-0"
          />
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            hidden={!query}
            aria-label="Borrar búsqueda"
            className="absolute right-2 top-1.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-sw-muted hover:bg-sw-pink-pale hover:text-sw-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-sw-muted">Buscando...</div>
          )}

          {error && <div role="alert" className="p-5"><p>No pudimos cargar la búsqueda. Intenta escribir de nuevo.</p><ConsultaDermatologa className="mt-5" /></div>}
          {!query.trim() && <div className="px-5 py-4">
            <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Vistos recientemente</h3>{recent.length > 0 && <button onClick={clearHistory} className="min-h-11 text-sm text-sw-pink-deep underline">Borrar historial</button>}</div>
            {recent.length === 0 ? <p className="mt-2 text-sm text-sw-muted">Aquí aparecerán los productos que abras desde el buscador.</p> : recent.map(p => <Link key={p.slug} href={`/producto/${encodeURIComponent(p.slug)}`} onClick={() => remember(p)} className="flex min-h-14 items-center gap-3 border-b border-sw-border py-3"><span className="h-14 w-14 shrink-0"><ImagenProducto src={p.image} alt="" className="h-full w-full object-contain" /></span><span>{p.name}<span className="block text-sm text-sw-muted">{p.brand}{p.presentation ? ` · ${p.presentation}` : ''}</span></span></Link>)}
          </div>}
          {!loading && !error && query.trim().length >= 2 && (
            <>
              {results.products.length > 0 && (
                <div className="border-b border-sw-border px-5 py-4">
                  <p className="mb-2 text-sw-small font-semibold text-sw-muted">
                    Productos
                  </p>
                  <div className="space-y-1">
                    {results.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/producto/${encodeURIComponent(product.slug)}`}
                        onClick={() => remember(product)}
                        className="block rounded-sw text-sw-ink"
                      >
                        <div className="flex cursor-pointer items-center gap-3 rounded-sw p-2 hover:bg-sw-pink-pale">
                          {product.image && (
                            <img
                              loading="lazy"
                              decoding="async"
                              src={product.image}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded-sw-sm bg-sw-white object-contain"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-display font-medium leading-snug text-sw-ink">
                              {product.name}
                            </p>
                            <p className="text-sm text-sw-muted">{product.brand}{product.presentation ? ` · ${product.presentation}` : ''}{product.inStock === false ? ' · Agotado' : ''}</p>
                            <p className="text-sw-small tabular-nums text-sw-muted">{product.price != null ? formatPrice(product.price) : 'Precio por confirmar'}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.brands.length > 0 && (
                <div className="border-b border-sw-border px-5 py-4">
                  <p className="mb-2 text-sw-small font-semibold text-sw-muted">
                    Marcas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.brands.map((brand: string) => (
                      <Link
                        key={brand}
                        href={`/tienda?marca=${encodeURIComponent(brand)}`}
                        onClick={onClose}
                        className="text-sw-pink-deep"
                      >
                        <span className="inline-flex min-h-[2.25rem] cursor-pointer items-center rounded-full bg-sw-pink-pale px-3.5 text-sw-small font-semibold text-sw-pink-deep hover:bg-sw-pink-soft">
                          {brand}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.categories.length > 0 && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-sw-small font-semibold text-sw-muted">
                    Categorías
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((category: string) => (
                      <Link
                        key={category}
                        href={`/tienda?categoria=${encodeURIComponent(category)}`}
                        onClick={onClose}
                        className="text-sw-ink"
                      >
                        <span className="inline-flex min-h-[2.25rem] cursor-pointer items-center rounded-full border border-sw-border bg-sw-white px-3.5 text-sw-small font-semibold text-sw-ink hover:border-sw-ink">
                          {category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 &&
                results.brands.length === 0 &&
                results.categories.length === 0 && (
                  <div className="p-6 text-center text-sw-muted">
                    <ConsultaDermatologa className="text-left" />
                  </div>
                )}
            </>
          )}

          {!loading && query.length < 2 && query.length > 0 && (
            <div className="p-4 text-center text-sw-small text-sw-muted">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
