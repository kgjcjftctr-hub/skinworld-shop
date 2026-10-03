import Link from 'next/link';
import type { ReactNode } from 'react';

/** Un bloque es un párrafo (texto; los saltos de línea se respetan) o una lista. */
export type Bloque = string | string[];
export interface SeccionLegal {
  titulo: string;
  bloques: Bloque[];
}

const ENLACE =
  'font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink';

// Correos, el teléfono de atención y la referencia a la política de envíos se
// vuelven enlaces automáticamente, para escribir los textos legales como texto plano.
const PATRON =
  /(contacto@skinworld\.shop|\+52 56 1288 4245|Política de Envíos, Devoluciones, Reembolsos y Cancelaciones)/g;

function enlazar(texto: string): ReactNode[] {
  return texto.split(PATRON).map((trozo, i) => {
    if (trozo === 'contacto@skinworld.shop')
      return <a key={i} href={`mailto:${trozo}`} className={ENLACE}>{trozo}</a>;
    if (trozo === '+52 56 1288 4245')
      return <a key={i} href="tel:+525612884245" className={ENLACE}>{trozo}</a>;
    if (trozo.startsWith('Política de Envíos'))
      return <Link key={i} href="/envios" className={ENLACE}>{trozo}</Link>;
    return trozo;
  });
}

export function PaginaLegal({
  titulo,
  actualizacion,
  intro,
  secciones,
}: {
  titulo: string;
  actualizacion: string;
  intro?: ReactNode;
  secciones: SeccionLegal[];
}) {
  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-sw-gutter pb-sw-section pt-12 sm:pt-16">
        <h1 className="mb-4 font-display text-sw-h1 font-semibold text-sw-ink">{titulo}</h1>
        <p className="mb-12 text-sw-small text-sw-muted">Última actualización: {actualizacion}</p>
        {intro}
        <div className="space-y-12 text-sw-body leading-relaxed text-sw-text">
          {secciones.map((s) => (
            <section key={s.titulo}>
              <h2 className="mb-4 font-display text-2xl font-semibold text-sw-ink">{s.titulo}</h2>
              <div className="space-y-4">
                {s.bloques.map((b, i) =>
                  Array.isArray(b) ? (
                    <ul key={i} className="ml-5 list-disc space-y-2">
                      {b.map((li) => (
                        <li key={li}>{enlazar(li)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i} className="whitespace-pre-line">{enlazar(b)}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
