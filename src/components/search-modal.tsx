'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/utils';

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ products: [], brands: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error('Search error:', error);
        }
        setLoading(false);
      } else {
        setResults({ products: [], brands: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 animate-fade-in">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="relative">
          <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar productos, marcas, categorías..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-none border-0 border-b border-slate-100 py-4 pl-14 pr-14 font-display text-lg focus:outline-none focus:ring-0"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-slate-500">Buscando...</div>
          )}

          {!loading && query.length >= 2 && (
            <>
              {results.products.length > 0 && (
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="mb-2 font-accent text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Productos
                  </p>
                  <div className="space-y-1">
                    {results.products.map((product: any) => (
                      <Link key={product.id} href={`/producto/${encodeURIComponent(product.slug)}`}>
                        <div
                          onClick={onClose}
                          className="cursor-pointer rounded-md p-2 hover:bg-slate-50"
                        >
                          <p className="font-display font-medium text-ink">{product.name}</p>
                          <p className="text-sm text-slate-500">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.brands.length > 0 && (
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="mb-2 font-accent text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Marcas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.brands.map((brand: string) => (
                      <Link key={brand} href={`/tienda?marca=${encodeURIComponent(brand)}`}>
                        <span
                          onClick={onClose}
                          className="cursor-pointer rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-800 hover:bg-primary-100"
                        >
                          {brand}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.categories.length > 0 && (
                <div className="px-5 py-4">
                  <p className="mb-2 font-accent text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Categorías
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((category: string) => (
                      <Link key={category} href={`/tienda?categoria=${encodeURIComponent(category)}`}>
                        <span
                          onClick={onClose}
                          className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                        >
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
                  <div className="p-6 text-center text-slate-500">
                    No se encontraron resultados para "{query}"
                  </div>
                )}
            </>
          )}

          {!loading && query.length < 2 && query.length > 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
