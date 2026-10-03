import { PaginaLegal, type SeccionLegal } from '@/components/legal-page';

export const metadata = {
  title: 'Términos y Condiciones · Skinworld',
  description: 'Términos legales de uso del sitio y de los productos de Skinworld.',
};

const secciones: SeccionLegal[] = [
  {
    titulo: 'Identificación del proveedor',
    bloques: [
      'Skinworld es un nombre comercial operado por Karina Alfaro López, RFC: AALK7407226K8, persona física con actividades empresariales y profesionales.',
      'Contacto:',
      [
        'Correo: contacto@skinworld.shop',
        'Teléfono y WhatsApp: +52 56 1288 4245',
        'Domicilio: Calle Acueducto Río Hondo número 30, 3er piso, Colonia Lomas de Chapultepec IV Sección, C.P. 11000, Miguel Hidalgo, Ciudad de México',
      ],
    ],
  },
  {
    titulo: 'Uso del sitio',
    bloques: [
      'skinworld.shop permite consultar información y adquirir los productos ofrecidos por Skinworld.',
      'Al realizar una compra, el cliente declara haber revisado la descripción, precio y condiciones aplicables al producto y acepta estos términos y las políticas correspondientes.',
      'Skinworld podrá actualizar el contenido del sitio, catálogo, disponibilidad y estos términos cuando resulte necesario. Los cambios no afectarán los derechos ya adquiridos por consumidores respecto de operaciones previamente celebradas.',
    ],
  },
  {
    titulo: 'Información sobre salud',
    bloques: [
      'La información publicada sobre cuidado de la piel, bienestar, ingredientes o productos tiene fines informativos y educativos y no sustituye una consulta, diagnóstico o tratamiento realizado por un profesional de la salud.',
      'Ante dudas relacionadas con una condición médica, el consumidor deberá consultar a un profesional de la salud.',
      'Nada de lo establecido en estos términos pretende excluir o limitar derechos que correspondan al consumidor conforme a la legislación aplicable.',
    ],
  },
  {
    titulo: 'Productos, precios y disponibilidad',
    bloques: [
      'Los productos están sujetos a disponibilidad.',
      'Los precios aplicables serán los mostrados al consumidor antes de finalizar la compra. Antes del pago deberán mostrarse los cargos aplicables a la operación, incluyendo, cuando corresponda, los costos de envío.',
      'En caso de existir un error evidente de disponibilidad, precio o información que impida cumplir razonablemente un pedido, Skinworld contactará al cliente para informarle las opciones disponibles y, cuando corresponda, realizar el reembolso respectivo.',
    ],
  },
  {
    titulo: 'Proceso de compra',
    bloques: [
      'El cliente selecciona los productos, proporciona la información necesaria para entrega y contacto, revisa su pedido y completa el pago mediante los métodos habilitados en el sitio.',
      'Una vez confirmada la operación, Skinworld proporcionará al cliente una confirmación o comprobante electrónico de la transacción.',
    ],
  },
  {
    titulo: 'Pagos',
    bloques: [
      'Los pagos podrán realizarse mediante los métodos habilitados durante el proceso de compra.',
      'El procesamiento de pagos con tarjeta podrá realizarse mediante proveedores externos especializados. Skinworld no almacena directamente los datos completos de la tarjeta.',
    ],
  },
  {
    titulo: 'Facturación',
    bloques: [
      'El cliente podrá solicitar el comprobante fiscal correspondiente proporcionando la información fiscal necesaria a través del mecanismo habilitado por Skinworld.',
    ],
  },
  {
    titulo: 'Envíos',
    bloques: [
      'Los tiempos, costos y condiciones de entrega se encuentran en la Política de Envíos, Devoluciones, Reembolsos y Cancelaciones.',
    ],
  },
  {
    titulo: 'Cancelaciones, devoluciones y garantías',
    bloques: [
      'Los procedimientos aplicables se describen en la Política de Envíos, Devoluciones, Reembolsos y Cancelaciones.',
      'Ninguna disposición de estos términos deberá interpretarse como una renuncia a los derechos que la legislación mexicana reconozca al consumidor.',
    ],
  },
  {
    titulo: 'Atención y reclamaciones',
    bloques: [
      'Para aclaraciones, reclamaciones o problemas relacionados con una compra:',
      [
        'Correo: contacto@skinworld.shop',
        'WhatsApp/teléfono: +52 56 1288 4245',
        'Horario: lunes a viernes de 10:00 a 18:00 horas.',
      ],
    ],
  },
];

export default function TermsPage() {
  return <PaginaLegal titulo="Términos y Condiciones" actualizacion="2 de octubre de 2026" secciones={secciones} />;
}
