import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import { Mariposa } from '@/components/ui/mariposa';
import { DRA_KARINA } from '@/lib/dra-karina';

export const metadata = {
  title: 'Sobre Nosotros',
  description:
    'Skinworld nace de 25 años de práctica dermatológica de la Dra. Karina Alfaro López. Conoce su trayectoria y el criterio con el que se elige cada producto.',
  alternates: { canonical: '/sobre-nosotros' },
};

// Todo el texto de esta página ya estaba publicado; aquí solo se reorganiza.
export default function AboutPage() {
  return (
    <>
      {/* Apertura */}
      <section className="sw-container pb-sw-section pt-12 sm:pt-16">
        <p className="sw-label">Sobre nosotros</p>
        <h1 className="mt-4 max-w-[16ch] font-display text-sw-display font-semibold text-sw-ink">
          Dermatología detrás de cada elección
        </h1>
        <div className="mt-10 grid gap-8 border-t border-sw-ink/80 pt-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <p className="font-display text-2xl leading-snug text-sw-ink sm:text-[1.75rem]">
            Skinworld es una tienda de productos dermatológicos y suplementos alimenticios,
            respaldada por profesionales de la salud.
          </p>
          <div className="max-w-sw-prose space-y-5 text-sw-lead text-sw-text">
            <p>
              Surgió de la necesidad de encontrar respuesta pronta y atención personalizada para
              quienes cuidan su piel.
            </p>
            <p>
              Quien compra aquí puede tener la seguridad de que lo que encuentra es de la más alta
              calidad, con tecnología de punta y avalado por dermatólogos con años de experiencia.
            </p>
          </div>
        </div>
      </section>

      {/* Criterio */}
      <section className="bg-sw-surface">
        <div className="sw-container grid items-center gap-10 py-sw-section lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <video
            src="/videos/skinworld-logo.mp4"
            poster="/videos/skinworld-logo-poster.jpg"
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label="Animación del logotipo de Skinworld by Karina Alfaro"
            className="mx-auto aspect-square w-full max-w-[16rem] rounded-sw-lg bg-sw-white object-cover sm:max-w-[26rem]"
          />
          <div>
            <Mariposa className="h-7 w-auto text-sw-pink" />
            <h2 className="mt-6 font-display text-sw-h2 font-semibold text-sw-ink">Nuestro criterio</h2>
            <p className="mt-5 max-w-sw-prose text-sw-lead text-sw-text">
              Cada producto Skinworld es seleccionado bajo un riguroso criterio médico y científico,
              para el cuidado profesional de tu piel.
            </p>
          </div>
        </div>
      </section>

      {/* Dra. Karina */}
      <section aria-labelledby="dra-titulo" className="sw-container py-sw-section">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <img
            loading="lazy"
            decoding="async"
            src={DRA_KARINA.foto}
            alt={`${DRA_KARINA.nombre}, dermatóloga`}
            className="aspect-[4/5] w-full rounded-sw-lg object-cover object-top lg:sticky lg:top-24"
          />

          <div>
            <p className="sw-label">Quién elige cada producto</p>
            <h2 id="dra-titulo" className="mt-3 font-display text-sw-h2 font-semibold text-sw-ink">
              {DRA_KARINA.nombre}
            </h2>
            <p className="mt-3 text-sw-lead text-sw-muted">
              {DRA_KARINA.especialidad}, con {DRA_KARINA.experiencia}.
            </p>

            <p className="mt-8 max-w-sw-prose text-sw-lead text-sw-text">
              La Dra. Karina Alfaro es dermatóloga. Realizó Medicina Interna en el Hospital ABC y la
              especialidad de Dermatología en el Centro Médico Nacional 20 de Noviembre. Está
              certificada ante el Consejo Mexicano de Dermatología y es miembro activo de la Academia
              Mexicana de Dermatología, del Colegio Iberolatinoamericano de Dermatología y de la
              Fundación para la Dermatología. Actualmente atiende a sus pacientes en Grupo Médico
              Pediátrico, en la Ciudad de México.
            </p>

            <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              <div className="border-t border-sw-ink/80 pt-4">
                <dt className="font-display text-xl font-semibold text-sw-ink">Formación</dt>
                {DRA_KARINA.formacion.map((f) => (
                  <dd key={f.titulo} className="mt-3 text-sw-body text-sw-text">
                    <span className="block font-semibold text-sw-ink">{f.titulo}</span>
                    {f.lugar}
                  </dd>
                ))}
              </div>
              <div className="border-t border-sw-ink/80 pt-4">
                <dt className="font-display text-xl font-semibold text-sw-ink">Certificación</dt>
                <dd className="mt-3 text-sw-body text-sw-text">{DRA_KARINA.certificacion}</dd>
                <dt className="mt-8 font-display text-xl font-semibold text-sw-ink">Membresías</dt>
                {DRA_KARINA.membresias.map((m) => (
                  <dd key={m} className="mt-2 text-sw-body text-sw-text">
                    {m}
                  </dd>
                ))}
              </div>
            </dl>

            <div className="mt-12 rounded-sw-lg border border-sw-border bg-sw-white p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-sw-ink">Consultorio</h3>
              <p className="mt-2 text-sw-body text-sw-text">
                Atiende en <span className="font-semibold text-sw-ink">{DRA_KARINA.consultorio.lugar}</span>.
              </p>
              <ul className="mt-5 space-y-3 text-sw-body text-sw-text">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-sw-pink-deep" aria-hidden />
                  <span>{DRA_KARINA.consultorio.direccion}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-sw-pink-deep" aria-hidden />
                  <a href={DRA_KARINA.consultorio.telefonoEnlace} className="text-sw-ink underline decoration-sw-pink underline-offset-4 hover:text-sw-pink-deep">
                    {DRA_KARINA.consultorio.telefono}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-1 h-4 w-4 shrink-0 text-sw-pink-deep" aria-hidden />
                  <span>
                    {DRA_KARINA.consultorio.horario.map((linea) => (
                      <span key={linea} className="block">
                        {linea}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="bg-sw-pink">
        <div className="sw-container flex flex-col gap-8 py-sw-section lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[18ch] font-display text-sw-h2 font-semibold text-sw-ink">
              Comienza tu rutina dermatológica
            </h2>
            <p className="mt-4 max-w-sw-prose text-sw-lead text-sw-ink/80">
              Descubre los productos recomendados por criterio profesional para el cuidado de tu piel.
            </p>
          </div>
          <Link
            href="/tienda"
            className="sw-btn h-12 shrink-0 self-start bg-sw-ink px-7 text-[0.9375rem] text-sw-warm-white hover:bg-sw-pink-deep lg:self-auto"
          >
            Explorar la tienda
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
