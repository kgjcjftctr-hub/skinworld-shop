import { Award, MapPin, Phone, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-primary-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">Sobre Nosotros</h1>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="aspect-square rounded-[20px] bg-gradient-to-br from-primary-100 to-primary-50" />
            <div>
              <h2 className="mb-6 font-display text-3xl font-bold text-ink sm:text-4xl">
                Nuestra Historia
              </h2>
              <p className="text-justify leading-loose text-slate-600">
                Skin World nació de una convicción simple: el cuidado de la piel merece el mismo
                rigor que cualquier otra decisión de salud. Fundada bajo la guía de la Dra. Karina
                Alfaro López, cada producto de nuestro catálogo pasa por un criterio dermatológico
                profesional antes de llegar a nuestros clientes. No vendemos tendencias — ofrecemos
                soluciones respaldadas por ciencia, formulación seria y más de dos décadas de
                experiencia clínica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dra. Karina Alfaro López */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <img
              src="/images/dra-karina-alfaro.jpg"
              alt="Dra. Karina Alfaro López"
              className="aspect-square w-full rounded-[20px] object-cover lg:order-1"
            />

            <div>
              <span className="mb-4 inline-block font-accent text-xs font-bold uppercase tracking-[0.15em] text-gold-600">
                Experta
              </span>
              <h2 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                Dra. Karina Alfaro López
              </h2>
              <p className="mb-8 font-accent font-semibold text-primary-700">
                Especialista en Dermatología · 25 años de experiencia
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink">Consultorio</h3>
                  <p className="mb-3 text-slate-600">
                    Atiende en <span className="font-semibold text-ink">Grupo Médico Pediátrico</span>,
                    sede Lomas.
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <span>Acueducto Río Hondo 30, Hospital Ángeles Lomas, CDMX</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <a href="tel:+525511001200" className="transition-colors hover:text-primary-700">
                        55 1100 1200
                      </a>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <span>Lun-Vie 10:00-19:00 · Sáb 11:00-14:00 y 16:00-18:00 · Dom 11:00-14:00 y 16:00-18:00</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink">Educación</h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>Medicina General — UNAM</li>
                    <li>Medicina Interna — Hospital ABC</li>
                    <li>Dermatología — Centro Médico Nacional 20 de Noviembre, ISSSTE</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink">Certificaciones</h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>Consejo Mexicano de Dermatología (vigencia 2030)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink">Membresías</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <span>Academia Mexicana de Dermatología</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <span>Sociedad Mexicana de Dermatoscopia</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      <span>Colegio Iberoamericano de Dermatología</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestra Filosofía */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 font-display text-3xl font-bold text-ink sm:text-4xl">
            Nuestra Filosofía
          </h2>
          <p className="mb-10 leading-loose text-slate-600">
            Creemos que la confianza se construye con transparencia y evidencia, no con promesas.
            Por eso cada producto que ofrecemos ha sido evaluado con el mismo estándar que
            aplicaríamos en un consultorio: seguridad primero, resultados comprobables después.
          </p>
          <blockquote className="border-l-2 border-gold-400 pl-6 text-left font-display text-xl italic text-ink">
            “Cada producto que seleccionamos ha pasado por nuestro riguroso criterio dermatológico.”
            <footer className="mt-3 font-accent text-sm not-italic text-slate-500">
              — Dra. Karina Alfaro López
            </footer>
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-primary-500 to-primary-400 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Comienza tu Rutina Dermatológica
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/90">
            Descubre los productos recomendados por criterio profesional para el cuidado de tu piel.
          </p>
          <a
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 font-accent text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            Explorar Tienda
          </a>
        </div>
      </section>
    </div>
  );
}
