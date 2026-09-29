export const metadata = {
  title: 'Aviso de Privacidad · Skinworld',
  description:
    'Cómo Skinworld recaba, usa y protege tus datos personales, y cómo ejercer tus derechos ARCO.',
};

const CORREO = 'contacto@skinworld.shop';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-3 font-display text-4xl font-bold text-ink">Aviso de Privacidad</h1>
        <p className="mb-12 text-sm text-slate-400">
          Última actualización: 28 de septiembre de 2026
        </p>

        <div className="space-y-10 leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Para qué fines utilizaremos sus datos personales?
            </h2>
            <div className="space-y-4">
              <p>
                De manera adicional a las finalidades necesarias para prestarle el servicio,
                utilizaremos su información personal para las siguientes finalidades secundarias, que
                no son necesarias para el servicio solicitado, pero que nos permiten y facilitan
                brindarle una mejor atención:
              </p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Confirmar su identidad y/o la de su representante legal</li>
                <li>Mercadotecnia o publicidad</li>
                <li>Prospección comercial</li>
              </ul>
              <p>
                En caso de que no desee que sus datos personales se utilicen para estos fines
                secundarios, puede indicarlo escribiendo a{' '}
                <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                  {CORREO}
                </a>
                , señalando cuáles de las finalidades anteriores no consiente.
              </p>
              <p>
                La negativa para el uso de sus datos personales para estas finalidades no podrá ser
                un motivo para que le neguemos los servicios y productos que solicita o contrata con
                nosotros.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Qué datos personales utilizaremos?
            </h2>
            <div className="space-y-4">
              <p>
                Para llevar a cabo las finalidades descritas en el presente aviso de privacidad,
                utilizaremos los siguientes datos personales de identificación y contacto:
              </p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Nombre</li>
                <li>Género</li>
                <li>Edad</li>
                <li>Domicilio</li>
                <li>Teléfono</li>
                <li>Correo electrónico</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Cómo puede acceder, rectificar o cancelar sus datos personales, u oponerse a su uso?
            </h2>
            <div className="space-y-4">
              <p>
                Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los
                utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho
                solicitar la corrección de su información personal en caso de que esté
                desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de
                nuestros registros o bases de datos cuando considere que la misma no está siendo
                utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos
                personales para fines específicos (Oposición). Estos derechos se conocen como
                derechos ARCO.
              </p>
              <p>
                Para el ejercicio de cualquiera de los derechos ARCO, deberá presentar la solicitud
                respectiva al correo{' '}
                <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                  {CORREO}
                </a>
                . En ese mismo medio ponemos a su disposición el procedimiento y los requisitos para
                ejercerlos.
              </p>
              <p>
                El área a cargo de dar trámite a las solicitudes de derechos ARCO es Atención a
                Clientes, en el correo señalado.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Revocación del consentimiento
            </h2>
            <div className="space-y-4">
              <p>
                Usted puede revocar el consentimiento que, en su caso, nos haya otorgado para el
                tratamiento de sus datos personales. Sin embargo, es importante que tenga en cuenta
                que no en todos los casos podremos atender su solicitud o concluir el uso de forma
                inmediata, ya que es posible que por alguna obligación legal requiramos seguir
                tratando sus datos personales. Asimismo, deberá considerar que para ciertos fines la
                revocación de su consentimiento implicará que no le podamos seguir prestando el
                servicio que nos solicitó, o la conclusión de su relación con nosotros.
              </p>
              <p>
                Para revocar su consentimiento, así como para limitar el uso o divulgación de su
                información personal, deberá presentar su solicitud al correo{' '}
                <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                  {CORREO}
                </a>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              El uso de tecnologías de rastreo en nuestro portal de internet
            </h2>
            <div className="space-y-4">
              <p>
                Le informamos que en nuestra página de internet utilizamos cookies, web beacons u
                otras tecnologías, a través de las cuales es posible monitorear su comportamiento
                como usuario de internet, así como brindarle un mejor servicio y experiencia al
                navegar en nuestra página. Los datos personales que recabamos a través de estas
                tecnologías los utilizaremos para promociones y seguimiento con nuestros clientes.
              </p>
              <p>Los datos que obtenemos de estas tecnologías de rastreo son los siguientes:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Identificadores, nombre de usuario y contraseñas de una sesión</li>
                <li>Listas y hábitos de consumo en páginas de compras</li>
              </ul>
              <p>
                Para conocer la forma en que se pueden deshabilitar estas tecnologías, escriba a{' '}
                <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                  {CORREO}
                </a>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Cómo puede conocer los cambios en este aviso de privacidad?
            </h2>
            <p>
              El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones
              derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los
              productos o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en
              nuestro modelo de negocio, o por otras causas. Nos comprometemos a mantenerlo informado
              sobre los cambios que pueda sufrir el presente aviso de privacidad mediante el envío de
              un correo electrónico a nuestra base de clientes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
