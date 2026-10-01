import Link from 'next/link';
import { Mariposa } from '@/components/ui/mariposa';

/**
 * Espacio preparado para una fotografía de campaña. Mientras sea null, el
 * bloque es solo tipográfico. Para usar una foto: súbela a /public/images/ y
 * pon aquí { src: '/images/campana.jpg', alt: 'Descripción de la foto' }.
 */
const FOTOGRAFIA_DE_CAMPANA: { src: string; alt: string } | null = null;

/**
 * Declaración de criterio de Skinworld a escala editorial. El texto es el que
 * ya publicaba el sitio; no se agregan promesas nuevas.
 */
export function EditorialSection() {
  return (
    <section aria-labelledby="criterio-titulo" className="sw-section">
      <div
        className={
          FOTOGRAFIA_DE_CAMPANA
            ? 'sw-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16'
            : 'sw-container'
        }
      >
        {FOTOGRAFIA_DE_CAMPANA && (
          <img
            src={FOTOGRAFIA_DE_CAMPANA.src}
            alt={FOTOGRAFIA_DE_CAMPANA.alt}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-sw-lg object-cover"
          />
        )}
        <div className="relative">
          <Mariposa className="mb-8 h-8 w-auto text-sw-pink sm:h-10" />
          <h2 id="criterio-titulo" className="sr-only">
            Nuestro criterio
          </h2>
          <p className="max-w-[30ch] font-display text-[clamp(1.875rem,1.3rem+2.4vw,4rem)] font-medium leading-[1.12] text-sw-ink">
            Cada producto Skinworld es seleccionado bajo un riguroso criterio médico y científico,
            para el cuidado profesional de tu piel.
          </p>
          <Link href="/sobre-nosotros" className="sw-link mt-8 inline-block">
            Conoce cómo elegimos
          </Link>
        </div>
      </div>
    </section>
  );
}
