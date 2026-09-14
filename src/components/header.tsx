'use client';

import Link from 'next/link';
import { useCart } from '@/store/cart';
import { ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SearchModal } from './search-modal';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalItems = useCart((state) => state.getTotalItems());

  useEffect(() => {
    setHasMounted(true);
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigationLinks = [
    { href: '/tienda', label: 'Tienda' },
    { href: '/sobre-nosotros', label: 'Sobre Nosotros' },
    { href: '/blog', label: 'Blog' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <>
      <div className="bg-ink py-2 text-center">
        <p className="font-accent text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90">
          Envío gratis en compras mayores a $500 · 100% productos originales
        </p>
      </div>
      <header
        className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
          isScrolled ? 'border-transparent shadow-soft' : 'border-slate-100'
        }`}
      >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                <g id="leaf">
                  <path d="M 50 30 Q 48 45 50 70" stroke="#d4a5af" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <ellipse cx="35" cy="40" rx="12" ry="18" fill="#d4a5af" transform="rotate(-45 35 40)"/>
                  <ellipse cx="65" cy="40" rx="12" ry="18" fill="#d4a5af" transform="rotate(45 65 40)"/>
                  <ellipse cx="32" cy="55" rx="12" ry="18" fill="#d4a5af" transform="rotate(-35 32 55)"/>
                  <ellipse cx="68" cy="55" rx="12" ry="18" fill="#d4a5af" transform="rotate(35 68 55)"/>
                </g>
              </svg>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Skin World
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-10">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 font-accent text-[13px] font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:text-ink"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar"
              className="hidden rounded-full p-2.5 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              <Search className="h-5 w-5 text-slate-700" />
            </button>

            <Link
              href="/carrito"
              aria-label="Carrito"
              className="relative rounded-full p-2.5 transition-colors hover:bg-slate-50"
            >
              <ShoppingBag className="h-5 w-5 text-slate-700" />
              {hasMounted && totalItems > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú"
              className="rounded-full p-2.5 transition-colors hover:bg-slate-50 md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="space-y-1 pb-6 md:hidden animate-fade-in-up">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-4 py-2.5 font-accent text-sm font-semibold uppercase tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </nav>
      </header>
    </>
  );
}
