export const metadata = {
  title: 'Envíos y Devoluciones · Skinworld',
  description:
    'Tiempos de entrega, costos de envío, devoluciones y reembolsos de Skinworld.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-3 font-display text-4xl font-bold text-ink">
          Política de Envíos y Devoluciones
        </h1>
        <p className="mb-10 text-sm text-slate-400">
          Última actualización: 28 de septiembre de 2026
        </p>

        <div className="mb-12 rounded-2xl bg-primary-50 p-6">
          <p className="font-display text-lg font-semibold text-ink">
            Envío gratis en CDMX. Los envíos al interior de la República se cotizan según el
            destino.
          </p>
        </div>

        <div className="space-y-10 leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Tiempos de entrega
            </h2>
            <div className="space-y-4">
              <p>
                Los pedidos se procesan y envían al siguiente día hábil de la confirmación de la
                compra. No se realizan ni programan envíos los fines de semana ni días festivos.
              </p>
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  <span className="font-semibold text-ink">
                    Ciudad de México y Área Metropolitana:
                  </span>{' '}
                  de 1 a 3 días hábiles.
                </li>
                <li>
                  <span className="font-semibold text-ink">Resto de la República Mexicana:</span> de
                  3 a 5 días hábiles, según el método de envío seleccionado al realizar la compra.
                </li>
              </ul>
              <p>
                El número de guía asignado a tu pedido se envía al momento de recibir la confirmación
                de compra, al correo electrónico que proporciones.
              </p>
              <p>
                Ciertas eventualidades como el clima, demoras en transporte, direcciones no válidas o
                incompletas, o temporadas altas pueden ocasionar retrasos. Skinworld no se hace
                responsable por el incumplimiento en la entrega de los productos ocasionado por caso
                fortuito o fuerza mayor.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Errores en el domicilio de entrega
            </h2>
            <div className="space-y-4">
              <p>
                Es responsabilidad del Cliente verificar la dirección de entrega para evitar demoras
                por errores de captura: número exterior, número interior, colonia, código postal,
                etcétera. Una vez que el paquete ha salido de las instalaciones de Skinworld, no
                pueden realizarse cambios en el domicilio señalado.
              </p>
              <p>
                Skinworld no se hace responsable por pérdidas o extravíos debidos a cualquier error
                en el domicilio proporcionado por el Cliente, ni por órdenes no reclamadas o
                rechazadas.
              </p>
              <p>
                Si necesitas cambiar la dirección de un pedido que ya está en proceso o en tránsito,
                es responsabilidad del Cliente contactar a la empresa de transporte para hacer las
                gestiones necesarias (puede haber un cargo adicional). Si el cambio es inmediato a la
                confirmación del pedido, escríbenos y lo modificamos.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Devoluciones</h2>
            <div className="space-y-4">
              <p>
                El Cliente puede solicitar la devolución del producto adquirido dentro de los{' '}
                <span className="font-semibold text-ink">
                  10 días hábiles posteriores a la entrega
                </span>{' '}
                del referido producto.
              </p>
              <p>
                Los costos de devolución corren a cargo de Skinworld siempre y cuando la devolución
                sea por causas imputables a Skinworld, señalando de manera enunciativa mas no
                limitativa la recepción de un artículo incorrecto o defectuoso. Toda devolución que
                no sea por causas imputables a Skinworld tendrá un costo, mismo que será descontado
                del monto total del producto.
              </p>
              <p className="font-semibold text-ink">Para hacer válida una devolución necesitas:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>Contar con el comprobante de compra o de pago.</li>
                <li>El nombre de quien realizó la compra.</li>
              </ul>
              <p>Los productos que no cumplan con estos criterios no serán aceptados.</p>
              <p>
                <span className="font-semibold text-ink">Artículos en oferta o con descuento:</span>{' '}
                no pueden ser objeto de reembolso ni devolución; sólo aplican los productos de precio
                regular. Esto no aplica cuando se trate de defectos de origen o fabricación, como
                producto roto o caducado, en cuyo caso sí procede la devolución.
              </p>
              <p>
                <span className="font-semibold text-ink">Artículos dañados:</span> si recibes un
                producto dañado, comunícate de inmediato con nosotros para obtener ayuda.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Gastos de envío por devolución
            </h2>
            <div className="space-y-4">
              <p>
                Todos los gastos de envío por devolución deben ser prepagados por el Cliente. No se
                aceptan pagos contra entrega.
              </p>
              <p>
                El Cliente es responsable de pagar los costos de envío por concepto de devolución,
                siempre que los productos se le hayan entregado en óptimas condiciones. Asimismo,
                deberá cubrir los gastos en caso de pérdida o daño del producto durante el envío
                hacia Skinworld.
              </p>
              <p>
                Es responsabilidad del Cliente conservar el número de guía o rastreo con el que
                realizó la devolución, hasta el momento en que el paquete sea recibido por nuestro
                personal de atención a clientes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Reembolsos</h2>
            <div className="space-y-4">
              <p>
                Los reembolsos se realizan <span className="font-semibold text-ink">únicamente</span>{' '}
                en la tarjeta de crédito o débito utilizada en la compra, o a la cuenta con la que se
                realizó el pago si fue por transferencia electrónica.
              </p>
              <p>
                Una vez solicitado el reembolso, Skinworld realizará las gestiones necesarias para
                entregarlo en un plazo de{' '}
                <span className="font-semibold text-ink">15 días hábiles</span> contados a partir de
                la entrega del paquete al remitente. Este período incluye el tiempo de tránsito para
                que Skinworld reciba la devolución (de 5 a 10 días hábiles) y el tiempo de procesarla
                una vez recibida y aceptada (de 3 a 5 días hábiles).
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Cancelaciones
            </h2>
            <p>
              Una vez que el pedido se encuentra en tránsito, no es posible cancelarlo ni
              modificarlo. Si el pedido ya va en camino, la cancelación se podrá realizar una vez que
              el Cliente reciba el producto: para recibir un reembolso, puede devolver el paquete en
              su estado original a la dirección de origen. Una vez que el paquete llegue,
              procesaremos un reembolso menos el costo original de envío.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Demoras o inconvenientes en la entrega
            </h2>
            <p>
              Si el seguimiento de tu envío no indica movimiento o cambio de estado después de 3 días
              hábiles, deberás iniciar un reclamo dentro del portal de la paquetería. Si ya cuentas
              con un reporte y el problema persiste, escríbenos para brindarte el apoyo necesario.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Atención a clientes</h2>
            <p className="mb-3">Horario de atención personalizada: lunes a viernes de 10:00 a 18:00 horas.</p>
            <ul className="space-y-1">
              <li>
                Correo:{' '}
                <a
                  href="mailto:contacto@skinworld.shop"
                  className="font-semibold text-primary-700 underline"
                >
                  contacto@skinworld.shop
                </a>
              </li>
              <li>
                Teléfono y WhatsApp:{' '}
                <a href="tel:+525612884245" className="font-semibold text-primary-700 underline">
                  +52 56 1288 4245
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
