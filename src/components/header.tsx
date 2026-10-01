'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SearchModal } from './search-modal';
import { Mariposa } from './ui/mariposa';
import { cn } from '@/utils';

const navigationLinks = [
  { href: '/tienda', label: 'Tienda' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/blog', label: 'Journal' },
  { href: '/contacto', label: 'Contacto' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalItems = useCart((state) => state.getTotalItems());
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Al navegar se cierra el menú del celular.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Escape cierra el menú y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!isMenuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <div className="bg-sw-pink-soft">
        <p className="sw-container flex justify-center gap-x-6 py-2 text-center text-sw-xs font-medium text-sw-ink">
          <span className="hidden sm:inline">Precios en pesos mexicanos (MXN)</span>
          <span>Envío gratis en CDMX</span>
          <span>Productos 100% originales</span>
        </p>
      </div>

      {/* La altura baja de 72 a 60 px al hacer scroll; el margen inferior crece
          lo mismo, así el contenido de la página no brinca. */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-sw-warm-white transition-[height,margin,box-shadow,border-color] duration-sw ease-sw',
          isScrolled
            ? 'mb-3 h-[60px] border-transparent shadow-sw-sm'
            : 'mb-0 h-[72px] border-sw-border'
        )}
      >
        <nav aria-label="Principal" className="sw-container flex h-full items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-sw-sm text-sw-ink"
            aria-label="Skinworld, ir al inicio"
          >
            <Mariposa
              className={cn(
                'w-auto text-sw-pink transition-[height] duration-sw ease-sw',
                isScrolled ? 'h-7' : 'h-8'
              )}
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.375rem] font-semibold tracking-tight">Skinworld</span>
              <span className="mt-1 hidden text-[0.6875rem] font-medium text-sw-muted sm:block">
                by Karina Alfaro
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-9 md:flex">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'relative py-2 text-[0.9375rem] font-medium transition-colors duration-sw-fast',
                    'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-sw-pink after:transition-transform after:duration-sw after:ease-sw',
                    isActive(link.href)
                      ? 'text-sw-ink after:scale-x-100'
                      : 'text-sw-text after:scale-x-0 hover:text-sw-ink hover:after:scale-x-100'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar productos"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-sw-text transition-colors duration-sw-fast hover:bg-sw-pink-pale hover:text-sw-ink md:inline-flex"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/carrito"
              aria-label={
                hasMounted && totalItems > 0
                  ? `Carrito, ${totalItems} producto${totalItems !== 1 ? 's' : ''}`
                  : 'Carrito'
              }
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-sw-text transition-colors duration-sw-fast hover:bg-sw-pink-pale hover:text-sw-ink"
            >
              <ShoppingBag className="h-5 w-5" />
              {hasMounted && totalItems > 0 && (
                <span
                  aria-hidden
                  className="absolute right-1 top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-sw-pink-deep px-1 text-[0.6875rem] font-bold tabular-nums text-white"
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              aria-controls="menu-movil"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sw-ink transition-colors duration-sw-fast hover:bg-sw-pink-pale md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div
            id="menu-movil"
            ref={menuRef}
            className="absolute inset-x-0 top-full border-b border-sw-border bg-sw-warm-white shadow-sw-md animate-fade-in md:hidden"
          >
            <div className="sw-container pb-8 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="mb-4 flex h-12 w-full items-center gap-3 rounded-full border border-sw-border bg-sw-white px-5 text-left text-sw-body text-sw-muted"
              >
                <Search className="h-5 w-5 text-sw-ink" />
                Buscar productos
              </button>
              <ul>
                {navigationLinks.map((link) => (
                  <li key={link.href} className="border-b border-sw-border last:border-b-0">
                    <Link
                      href={link.href}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                      className={cn(
                        'flex min-h-[3.5rem] items-center font-display text-[1.625rem] font-semibold',
                        isActive(link.href) ? 'text-sw-pink-deep' : 'text-sw-ink'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
