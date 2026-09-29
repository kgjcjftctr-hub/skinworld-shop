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
              ¿Quién es responsable de sus datos?
            </h2>
            <p>
              Skinworld, con domicilio en la Ciudad de México y correo de contacto{' '}
              <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                {CORREO}
              </a>
              , es responsable del tratamiento de los datos personales que usted proporcione a través
              de este sitio.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Para qué fines utilizaremos sus datos personales?
            </h2>
            <div className="space-y-4">
              <p>
                Utilizamos sus datos personales únicamente para las finalidades necesarias para
                prestarle el servicio que nos solicita:
              </p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Procesar su compra y cobrar el pedido</li>
                <li>Enviarle los productos al domicilio que nos indique</li>
                <li>Contactarle sobre su pedido o responder a las dudas que nos escriba</li>
              </ul>
              <p>
                Si usted se suscribe voluntariamente a nuestro boletín, utilizaremos su correo
                electrónico para enviarle información sobre productos y novedades. Puede pedirnos que
                lo demos de baja en cualquier momento escribiendo a{' '}
                <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                  {CORREO}
                </a>
                . La negativa a recibir el boletín no es motivo para que le neguemos los servicios y
                productos que solicita o contrata con nosotros.
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
                <li>Correo electrónico</li>
                <li>Teléfono</li>
                <li>Domicilio de entrega</li>
              </ul>
              <p>
                No solicitamos ni almacenamos datos sensibles, ni datos financieros: los datos de su
                tarjeta se capturan directamente en la plataforma de pago y nunca pasan por nuestros
                servidores.
              </p>
              <p>
                Las reseñas que se publican en este sitio son anónimas: sólo guardamos la
                calificación y el comentario, sin nombre ni ningún dato que permita identificarle.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Con quién compartimos sus datos?
            </h2>
            <div className="space-y-4">
              <p>
                Para poder operar la tienda utilizamos los servicios de los siguientes proveedores,
                que tratan sus datos por nuestra cuenta y bajo sus propias políticas de privacidad:
              </p>
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  <span className="font-semibold text-ink">Stripe</span> — procesa los pagos y recibe
                  su nombre, correo electrónico y los datos de su método de pago.
                </li>
                <li>
                  <span className="font-semibold text-ink">Supabase</span> — almacena los pedidos,
                  incluyendo nombre, teléfono y domicilio de entrega.
                </li>
                <li>
                  <span className="font-semibold text-ink">Vercel</span> — aloja el sitio y conserva
                  registros técnicos de servidor.
                </li>
              </ul>
              <p>
                No vendemos, alquilamos ni cedemos sus datos personales a terceros con fines
                publicitarios.
              </p>
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
              Usted puede revocar su consentimiento para el uso de sus datos personales
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
                Para revocar su consentimiento deberá presentar su solicitud al correo{' '}
                <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                  {CORREO}
                </a>
                , medio en el que también ponemos a su disposición el procedimiento y los requisitos
                para la revocación.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              ¿Cómo puede limitar el uso o divulgación de su información personal?
            </h2>
            <p>
              Con objeto de que usted pueda limitar el uso y divulgación de su información personal,
              le ofrecemos el siguiente medio: correo electrónico{' '}
              <a href={`mailto:${CORREO}`} className="font-semibold text-primary-700 underline">
                {CORREO}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              El uso de tecnologías de rastreo en nuestro portal de internet
            </h2>
            <div className="space-y-4">
              <p>
                Este sitio <span className="font-semibold text-ink">no utiliza cookies publicitarias,
                web beacons ni herramientas de analítica</span> que monitoreen su comportamiento de
                navegación. No usamos Google Analytics, píxeles de redes sociales ni servicios
                similares.
              </p>
              <p>
                El único almacenamiento que utilizamos en su navegador es el de su carrito de
                compras, que guarda los productos que va agregando para que no los pierda al cambiar
                de página. Esa información permanece en su dispositivo y no se envía a nuestros
                servidores hasta que usted decide finalizar la compra. Puede borrarla en cualquier
                momento vaciando el carrito o limpiando los datos del sitio en su navegador.
              </p>
              <p>
                La plataforma de pago puede utilizar sus propias cookies cuando usted es dirigido a
                ella para completar la compra, conforme a su política de privacidad.
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
              sobre los cambios que pueda sufrir el presente aviso publicando la versión actualizada
              en esta misma página, con su fecha de última actualización. Le sugerimos revisarla
              periódicamente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
