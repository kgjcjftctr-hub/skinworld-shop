import Link from 'next/link';
import { DRA_KARINA } from '@/lib/dra-karina';

/**
 * La Dra. Karina en la página de inicio: su foto real a escala editorial y
 * sus credenciales en bloques breves. Todos los datos salen de
 * src/lib/dra-karina.ts, el mismo archivo que usa Sobre nosotros.
 */
export function ExpertiseSection() {
  const bloques = [
    { titulo: 'Experiencia', texto: [DRA_KARINA.experiencia, DRA_KARINA.consultorio.lugar] },
    { titulo: 'Formación', texto: DRA_KARINA.formacion.map((f) => `${f.titulo}, ${f.lugar}`) },
    { titulo: 'Certificación', texto: [DRA_KARINA.certificacion] },
    { titulo: 'Membresías', texto: [...DRA_KARINA.membresias] },
  ];

  return (
    <section aria-labelledby="dra-titulo" className="sw-section border-t border-sw-border">
      <div className="sw-container grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <figure className="relative">
          <img
            src={DRA_KARINA.foto}
            alt={`${DRA_KARINA.nombre}, dermatóloga`}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full rounded-sw-lg object-cover object-top sm:aspect-[4/5]"
          />
          <figcaption className="absolute bottom-4 left-4 rounded-full bg-sw-warm-white/95 px-4 py-2 text-sw-xs font-semibold text-sw-ink">
            {DRA_KARINA.especialidad}
          </figcaption>
        </figure>

        <div>
          <p className="sw-label">Quién elige cada producto</p>
          <h2 id="dra-titulo" className="mt-3 font-display text-sw-h2 font-semibold text-sw-ink">
            {DRA_KARINA.nombre}
          </h2>
          <p className="mt-3 text-sw-lead text-sw-muted">
            {DRA_KARINA.especialidad}, con {DRA_KARINA.experiencia}.
          </p>

          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {bloques.map((bloque) => (
              <div key={bloque.titulo} className="border-t border-sw-ink/80 pt-4">
                <dt className="font-display text-xl font-semibold text-sw-ink">{bloque.titulo}</dt>
                {bloque.texto.map((linea) => (
                  <dd key={linea} className="mt-2 text-sw-body text-sw-text">
                    {linea}
                  </dd>
                ))}
              </div>
            ))}
          </dl>

          <Link href="/sobre-nosotros" className="sw-link mt-10 inline-block">
            Conocer su trayectoria
          </Link>
        </div>
      </div>
    </section>
  );
}
