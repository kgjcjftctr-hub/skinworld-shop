export const metadata = {
  title: 'Términos y Condiciones · Skinworld',
  description: 'Términos legales de uso del sitio y de los productos de Skinworld.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-3 font-display text-4xl font-bold text-ink">Términos y Condiciones</h1>
        <p className="mb-12 text-sm text-slate-400">
          Última actualización: 28 de septiembre de 2026
        </p>

        <div className="space-y-10 leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Uso del sitio y del contenido
            </h2>
            <div className="space-y-4">
              <p>
                La información contenida en el sitio web skinworld.shop es sólo para fines de
                información general.
              </p>
              <p>
                Skinworld no asume ninguna responsabilidad por errores u omisiones en los contenidos
                del Servicio.
              </p>
              <p>
                En ningún caso Skinworld será responsable de ningún daño especial, directo,
                indirecto, consecuente o incidental o de cualquier daño, ya sea en una acción de
                contrato, negligencia u otro agravio, que surja de o en relación con el uso de los
                productos. Skinworld se reserva el derecho de hacer adiciones, eliminaciones o
                modificaciones a los contenidos del Servicio en cualquier momento sin previo aviso.
              </p>
              <p>
                Skinworld no garantiza que el Servicio esté libre de virus u otros componentes
                dañinos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Deslinde de responsabilidad de contenido
            </h2>
            <div className="space-y-4">
              <p>
                El Servicio ofrece información sobre estado físico y nutricional y está diseñado sólo
                con fines educativos. No debe confiar en esta información como sustituto de, ni
                reemplazo, el consejo médico profesional, el diagnóstico o el tratamiento. Si tiene
                alguna inquietud o pregunta sobre su salud, siempre debe consultar con un médico u
                otro profesional de la salud.
              </p>
              <p>
                No ignore, evite ni demore la obtención de consejos médicos o relacionados con la
                salud de su médico debido a algo que haya leído en el Servicio. El uso de cualquier
                información provista en el Servicio es bajo su propio riesgo.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Compras y envíos</h2>
            <p>
              Las compras están sujetas a disponibilidad y a la aceptación del pedido. Las
              condiciones de envío, devolución y reembolso se detallan en nuestra{' '}
              <a href="/envios" className="font-semibold text-primary-700 underline">
                Política de Envíos y Devoluciones
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
