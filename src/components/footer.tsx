'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, ArrowRight, ChevronDown } from 'lucide-react';
import { Mariposa } from './ui/mariposa';
import { toast } from 'sonner';

const shopLinks = [
  { label: 'Todos los productos', href: '/tienda' },
  { label: 'Acné', href: '/tienda?categoria=Acn%C3%A9' },
  { label: 'Manchas', href: '/tienda?categoria=Manchas' },
  { label: 'Antiedad', href: '/tienda?categoria=Antiedad' },
  { label: 'Dermatitis', href: '/tienda?categoria=Dermatitis' },
];

const companyLinks = [
  { label: 'Sobre nosotros', href: '/sobre-nosotros' },
  { label: 'Journal', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [trampa, setTrampa] = useState('');

  const [enviando, setEnviando] = useState(false);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || enviando) return;
    setEnviando(true);
    try {
      const res = await fetch('/api/boletin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: trampa }),
      });
      if (!res.ok) {
        toast.error('No pudimos registrar tu correo. Intenta más tarde.');
        return;
      }
      toast.success('¡Listo! Te avisaremos de nuevos lanzamientos.', { description: email });
      setEmail('');
    } catch {
      toast.error('Error de conexión. Intenta más tarde.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <footer>
      {/* Boletín: banda propia antes del pie. En el celular el campo y el botón
          se apilan a todo lo ancho para que nada se salga de la pantalla. */}
      <section aria-labelledby="boletin-titulo" className="bg-sw-pink-pale">
        <div className="sw-container grid gap-8 py-14 sm:py-16 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-center lg:gap-16">
          <div>
            <h2 id="boletin-titulo" className="font-display text-sw-h3 font-semibold text-sw-ink">
              Consejos dermatológicos en tu correo
            </h2>
            <p className="mt-3 max-w-sw-prose text-sw-body text-sw-muted">
              Rutinas, lanzamientos y recomendaciones de la Dra. Karina. Sin spam.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full flex-col gap-3 sm:flex-row">
            {/* Campo trampa para robots: no se ve ni se puede enfocar. */}
            <input
              type="text"
              name="website"
              value={trampa}
              onChange={(e) => setTrampa(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <label htmlFor="boletin-correo" className="sr-only">
              Tu correo electrónico
            </label>
            <input
              id="boletin-correo"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="!h-12 min-w-0 flex-1 !rounded-full !border-sw-border !bg-sw-white !px-5 !text-sw-ink placeholder:!text-sw-muted focus:!border-sw-pink-deep focus:!ring-sw-pink-deep/30"
            />
            <button type="submit" disabled={enviando} className="sw-btn sw-btn-primary h-12 shrink-0">
              <span>{enviando ? 'Enviando…' : 'Suscribirme'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </div>
      </section>

      <div className="bg-sw-charcoal text-sw-cream">
        <div className="sw-container pb-8 pt-14 sm:pt-16">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1.2fr] md:gap-12">
            <div className="pb-8 md:pb-0">
              <p className="max-w-xs text-sw-body leading-relaxed text-sw-cream-muted">
                Productos dermatológicos profesionales respaldados por expertos en salud de la piel.
              </p>
              <a
                href="https://www.instagram.com/skinworld_ka/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-11 items-center gap-2.5 rounded-full border border-sw-cream/20 px-4 text-sw-small font-semibold text-sw-cream transition-colors duration-sw-fast hover:border-sw-pink hover:text-sw-pink"
              >
                <Instagram className="h-4 w-4" aria-hidden />
                Instagram
              </a>
            </div>

            <GrupoDeEnlaces titulo="Tienda" enlaces={shopLinks} />
            <GrupoDeEnlaces titulo="Empresa" enlaces={companyLinks} />

            <div className="pt-8 md:pt-0">
              <h2 className="mb-4 font-display text-lg font-semibold text-sw-cream">Contacto</h2>
              <ul className="space-y-3 text-sw-body">
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-sw-pink" aria-hidden />
                  <a href="mailto:contacto@skinworld.shop" className="text-sw-cream-muted transition-colors hover:text-sw-cream">
                    contacto@skinworld.shop
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-sw-pink" aria-hidden />
                  <a href="tel:+525612884245" className="text-sw-cream-muted transition-colors hover:text-sw-cream">
                    +52 56 1288 4245
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-sw-pink" aria-hidden />
                  <span className="text-sw-cream-muted">CDMX, México</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Cierre de marca: la mariposa y el nombre a gran escala. */}
          <div aria-hidden className="mt-14 flex items-end gap-[0.12em] border-t border-sw-cream/10 pt-10 text-sw-pink">
            <Mariposa className="h-[0.62em] w-auto shrink-0 text-[clamp(3.5rem,15vw,11rem)]" />
            <span className="font-display text-[clamp(3.5rem,15vw,11rem)] font-semibold leading-[0.8] tracking-tight">
              Skinworld
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-4 text-sw-small text-sw-cream-muted md:flex-row md:items-center md:justify-between">
            <p>&copy; {currentYear} Skinworld. Todos los derechos reservados.</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/envios" className="text-sw-cream-muted transition-colors hover:text-sw-cream">
                  Envíos y Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-sw-cream-muted transition-colors hover:text-sw-cream">
                  Términos
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-sw-cream-muted transition-colors hover:text-sw-cream">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Un grupo de enlaces del pie. En el celular es un acordeón (details/summary,
 * accesible sin JavaScript) para no apilar una columna larga; desde tableta se
 * muestra abierto como lista normal.
 */
function GrupoDeEnlaces({ titulo, enlaces }: { titulo: string; enlaces: { label: string; href: string }[] }) {
  const lista = (
    <ul className="space-y-3 text-sw-body">
      {enlaces.map((link) => (
        <li key={link.label}>
          <Link href={link.href} className="text-sw-cream-muted transition-colors hover:text-sw-cream">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <details className="group -mt-px border-y border-sw-cream/10 md:hidden">
        <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between font-display text-lg font-semibold text-sw-cream [&::-webkit-details-marker]:hidden">
          {titulo}
          <ChevronDown className="h-5 w-5 text-sw-pink transition-transform duration-sw group-open:rotate-180" aria-hidden />
        </summary>
        <div className="pb-5">{lista}</div>
      </details>
      <div className="hidden md:block">
        <h2 className="mb-4 font-display text-lg font-semibold text-sw-cream">{titulo}</h2>
        {lista}
      </div>
    </div>
  );
}
