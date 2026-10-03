import { PaginaLegal, type SeccionLegal } from '@/components/legal-page';

export const metadata = {
  title: 'Envíos, Devoluciones y Reembolsos · Skinworld',
  description:
    'Tiempos de entrega, rastreo, devoluciones, reembolsos y cancelaciones de Skinworld.',
};

const secciones: SeccionLegal[] = [
  {
    titulo: 'Procesamiento y entrega',
    bloques: [
      'Los pedidos normalmente se procesan a partir del siguiente día hábil posterior a la confirmación de la compra.',
      'No se procesan ni programan envíos ordinarios durante fines de semana o días festivos.',
      'Tiempos estimados:',
      [
        'Ciudad de México y Área Metropolitana: 1 a 3 días hábiles.',
        'Resto de la República Mexicana: 3 a 5 días hábiles, dependiendo del destino y método de envío.',
      ],
      'Estos plazos son estimados y pueden variar por circunstancias fuera del control razonable de Skinworld, incluyendo condiciones climatológicas, incidencias de transporte, temporadas de alta demanda o casos fortuitos o de fuerza mayor.',
      'Skinworld mantendrá disponible un medio de atención para ayudar al cliente ante incidencias relacionadas con la entrega.',
    ],
  },
  {
    titulo: 'Rastreo',
    bloques: [
      'Cuando el transportista genere la guía correspondiente, Skinworld proporcionará al cliente la información disponible para el seguimiento de su pedido.',
    ],
  },
  {
    titulo: 'Dirección de entrega',
    bloques: [
      'El cliente deberá verificar que los datos de entrega sean correctos antes de finalizar la compra.',
      'Si detecta un error, deberá contactar a Skinworld lo antes posible.',
      'Una vez despachado el pedido, Skinworld no puede garantizar que el transportista permita modificar el domicilio. Cuando sea posible, Skinworld colaborará con el cliente para gestionar la modificación. Los cargos adicionales ocasionados exclusivamente por información incorrecta proporcionada por el cliente podrán correr a cargo de éste.',
    ],
  },
  {
    titulo: 'Devoluciones',
    bloques: [
      'El cliente podrá solicitar una devolución dentro de los 10 días hábiles posteriores a la entrega del producto, sin perjuicio de otros derechos que le correspondan conforme a la legislación aplicable.',
      'Para iniciar una solicitud deberá contactar a Skinworld y proporcionar información suficiente para identificar la compra.',
      'Cuando la devolución se origine por un producto incorrecto, defectuoso, dañado, caducado o por otra causa imputable a Skinworld, Skinworld asumirá los costos razonables asociados con la devolución y aplicará la solución que corresponda.',
      'Cuando la devolución sea voluntaria y no exista una causa imputable a Skinworld, podrán aplicarse gastos de devolución, siempre que ello sea legalmente procedente y se informe al consumidor.',
    ],
  },
  {
    titulo: 'Productos con descuento',
    bloques: [
      'Las promociones o descuentos no eliminan los derechos legales del consumidor.',
      'Cuando un producto presente defectos, daños, caducidad, no corresponda a lo solicitado o se actualice cualquier otro supuesto previsto por la legislación aplicable, podrá solicitarse la solución correspondiente aunque el producto se haya adquirido con descuento.',
    ],
  },
  {
    titulo: 'Condiciones sanitarias',
    bloques: [
      'Por razones de higiene y seguridad, Skinworld podrá limitar la devolución voluntaria de determinados productos abiertos, utilizados o cuyo sello de seguridad haya sido alterado, cuando dicha limitación sea legalmente procedente.',
      'Esta restricción no afectará los derechos del consumidor cuando exista un defecto, daño, error en el producto recibido u otro supuesto protegido por la legislación aplicable.',
    ],
  },
  {
    titulo: 'Reembolsos',
    bloques: [
      'Cuando proceda un reembolso, Skinworld realizará las gestiones correspondientes utilizando, cuando sea posible, el mismo medio de pago utilizado en la compra.',
      'Una vez recibida y, cuando corresponda, revisada la devolución, Skinworld procesará el reembolso en un plazo estimado de 3 a 5 días hábiles. El tiempo adicional para que el monto aparezca en la cuenta del cliente puede depender de su institución financiera o proveedor de pagos.',
    ],
  },
  {
    titulo: 'Cancelaciones',
    bloques: [
      'Si el pedido aún no ha sido despachado, el cliente puede contactar inmediatamente a Skinworld para solicitar su cancelación.',
      'Si ya fue despachado, Skinworld informará al cliente sobre las opciones disponibles de devolución o cancelación conforme a la legislación aplicable.',
      'Cuando resulte aplicable un derecho legal de revocación del consentimiento, Skinworld respetará los plazos y condiciones previstos por la Ley Federal de Protección al Consumidor.',
    ],
  },
  {
    titulo: 'Problemas con la entrega',
    bloques: [
      'Si el rastreo no presenta movimiento durante un periodo inusual o existe alguna incidencia con el envío, el cliente puede contactar directamente a Skinworld.',
      'Skinworld podrá solicitar información adicional o un reporte del transportista para investigar la incidencia, sin trasladar al consumidor la responsabilidad de resolver por sí solo un problema imputable al proceso de entrega.',
    ],
  },
  {
    titulo: 'Atención a clientes',
    bloques: [
      'Horario: lunes a viernes de 10:00 a 18:00 horas.\nCorreo: contacto@skinworld.shop\nTeléfono y WhatsApp: +52 56 1288 4245.',
    ],
  },
];

export default function ShippingPage() {
  return (
    <PaginaLegal
      titulo="Política de Envíos, Devoluciones, Reembolsos y Cancelaciones"
      actualizacion="2 de octubre de 2026"
      secciones={secciones}
    />
  );
}
