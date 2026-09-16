'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const shopLinks = [
  { label: 'Todos los productos', href: '/tienda' },
  { label: 'Acné', href: '/tienda?categoria=Acn%C3%A9' },
  { label: 'Manchas', href: '/tienda?categoria=Manchas' },
  { label: 'Antiedad', href: '/tienda?categoria=Antiedad' },
  { label: 'Dermatitis', href: '/tienda?categoria=Dermatitis' },
];

const companyLinks = [
  { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Preguntas Frecuentes', href: '/preguntas-frecuentes' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('¡Listo! Te avisaremos de nuevos lanzamientos.', { description: email });
    setEmail('');
  };

  return (
    <footer className="border-t border-gold-500/30 bg-ink text-slate-100">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="mb-2 font-display text-2xl font-semibold text-white">
                Consejos dermatológicos en tu correo
              </h3>
              <p className="text-sm text-slate-400">
                Rutinas, lanzamientos y recomendaciones de la Dra. Karina. Sin spam.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="!w-auto flex-1 !rounded-md !border-white/15 !bg-white/5 !text-white placeholder:text-slate-500 focus:!border-gold-500 focus:!ring-gold-500/40"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold-500 px-5 py-2.5 font-accent text-sm font-semibold text-ink transition-colors hover:bg-gold-400"
              >
                <span>Suscribirme</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center space-x-3">
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
              <span className="font-display text-lg font-semibold">Skin World</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Productos dermatológicos profesionales respaldados por expertos en salud de la piel.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold text-white">Tienda</h3>
            <ul className="space-y-2.5 text-sm">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold text-white">Empresa</h3>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-display text-sm font-semibold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-primary-400" />
                <a href="mailto:contacto@skinworld.shop" className="text-slate-400 transition-colors hover:text-white">
                  contacto@skinworld.shop
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-primary-400" />
                <a href="tel:+525612884245" className="text-slate-400 transition-colors hover:text-white">
                  +52 56 1288 4245
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-primary-400" />
                <span className="text-slate-400">CDMX, México</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-white/10" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} Skin World. Todos los derechos reservados.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-4 text-sm">
            <Link href="/terminos" className="text-slate-400 transition-colors hover:text-white">
              Términos
            </Link>
            <Link href="/privacidad" className="text-slate-400 transition-colors hover:text-white">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
