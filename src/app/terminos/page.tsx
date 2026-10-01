export const metadata = {
  title: 'Términos y Condiciones · Skinworld',
  description: 'Términos legales de uso del sitio y de los productos de Skinworld.',
};

export default function TermsPage() {
  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-sw-gutter pb-sw-section pt-12 sm:pt-16">
        <h1 className="mb-4 font-display text-sw-h1 font-semibold text-sw-ink">Términos y Condiciones</h1>
        <p className="mb-12 text-sw-small text-sw-muted">
          Última actualización: 28 de septiembre de 2026
        </p>

        <div className="space-y-12 text-sw-body leading-relaxed text-sw-text">
          <section>
            <h2 className="mb-4 font-display text-2xl font-semibold text-sw-ink">
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
            <h2 className="mb-4 font-display text-2xl font-semibold text-sw-ink">
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
            <h2 className="mb-4 font-display text-2xl font-semibold text-sw-ink">Compras y envíos</h2>
            <p>
              Las compras están sujetas a disponibilidad y a la aceptación del pedido. Las
              condiciones de envío, devolución y reembolso se detallan en nuestra{' '}
              <a href="/envios" className="font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink">
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
