import { PaginaLegal, type SeccionLegal } from '@/components/legal-page';

export const metadata = {
  title: 'Aviso de Privacidad · Skinworld',
  description:
    'Cómo Skinworld recaba, usa y protege tus datos personales, y cómo ejercer tus derechos ARCO.',
};

const secciones: SeccionLegal[] = [
  {
    titulo: '¿Quién es responsable de sus datos?',
    bloques: [
      'Karina Alfaro López, quien opera comercialmente bajo el nombre Skinworld, con domicilio en Calle Acueducto Río Hondo número 30, 3er piso, Colonia Lomas de Chapultepec IV Sección, C.P. 11000, Miguel Hidalgo, Ciudad de México, y correo electrónico contacto@skinworld.shop, es responsable del tratamiento de los datos personales recabados a través de skinworld.shop.',
    ],
  },
  {
    titulo: '¿Para qué utilizaremos sus datos personales?',
    bloques: [
      'Utilizamos sus datos personales para las siguientes finalidades necesarias:',
      [
        'Procesar, cobrar y dar seguimiento a sus compras.',
        'Preparar y gestionar la entrega de sus productos.',
        'Contactarle respecto de su pedido.',
        'Atender dudas, aclaraciones, devoluciones, reembolsos o reclamaciones.',
        'Cumplir con obligaciones legales, fiscales y administrativas relacionadas con las operaciones realizadas.',
      ],
      'De manera adicional, si usted se suscribe voluntariamente a nuestro boletín, podremos utilizar su correo electrónico para enviar información sobre productos, novedades y comunicaciones comerciales. Puede solicitar la baja en cualquier momento escribiendo a contacto@skinworld.shop. La negativa a recibir estas comunicaciones no afecta la posibilidad de comprar productos o recibir nuestros servicios.',
    ],
  },
  {
    titulo: '¿Qué datos personales utilizaremos?',
    bloques: [
      'Podremos tratar los siguientes datos:',
      [
        'Nombre.',
        'Correo electrónico.',
        'Número telefónico.',
        'Domicilio de entrega.',
        'Información relacionada con sus pedidos y transacciones.',
      ],
      'Skinworld no almacena directamente los datos completos de tarjetas bancarias utilizados para procesar pagos. Estos son tratados por la plataforma de pagos correspondiente.',
      'No solicitamos datos personales sensibles para realizar compras a través de la tienda.',
    ],
  },
  {
    titulo: 'Proveedores tecnológicos',
    bloques: [
      'Para operar skinworld.shop utilizamos proveedores tecnológicos que pueden tratar información necesaria para prestar sus respectivos servicios, entre ellos Stripe para procesamiento de pagos, Supabase para infraestructura y almacenamiento de información relacionada con pedidos, y Vercel para alojamiento e infraestructura del sitio.',
      'El tratamiento de información por dichos proveedores estará sujeto a las disposiciones aplicables y a las condiciones correspondientes a cada servicio.',
      'Skinworld no vende ni alquila datos personales con fines publicitarios.',
    ],
  },
  {
    titulo: 'Derechos ARCO',
    bloques: [
      'Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición respecto de sus datos personales.',
      'Para solicitar el ejercicio de cualquiera de estos derechos, puede escribir a contacto@skinworld.shop indicando:',
      [
        'Su nombre y un medio para recibir la respuesta.',
        'El derecho que desea ejercer.',
        'Una descripción clara de los datos personales involucrados.',
        'La información o documentación necesaria para acreditar su identidad y, cuando corresponda, la representación de otra persona.',
      ],
      'Skinworld atenderá las solicitudes conforme a los procedimientos y plazos establecidos por la legislación aplicable.',
    ],
  },
  {
    titulo: 'Revocación del consentimiento',
    bloques: [
      'Cuando legalmente proceda, usted podrá solicitar la revocación de su consentimiento para determinados tratamientos de datos personales escribiendo a contacto@skinworld.shop.',
      'La revocación no tendrá efectos retroactivos y podrá estar limitada cuando Skinworld deba conservar o tratar determinada información para cumplir una obligación legal.',
    ],
  },
  {
    titulo: 'Limitación del uso o divulgación',
    bloques: [
      'Puede solicitar la limitación del uso o divulgación de sus datos personales mediante contacto@skinworld.shop.',
    ],
  },
  {
    titulo: 'Tecnologías de rastreo',
    bloques: [
      'Actualmente, Skinworld no utiliza cookies publicitarias, Google Analytics, píxeles de redes sociales ni herramientas similares de seguimiento publicitario.',
      'El sitio puede utilizar almacenamiento local necesario para conservar temporalmente información del carrito de compras.',
      'Los proveedores utilizados para procesar pagos u ofrecer funciones técnicas pueden utilizar tecnologías propias necesarias para prestar sus servicios, conforme a sus respectivas políticas.',
    ],
  },
  {
    titulo: 'Cambios al aviso',
    bloques: [
      'Este aviso puede modificarse como consecuencia de cambios legales, tecnológicos, operativos o en los servicios ofrecidos por Skinworld.',
      'La versión actualizada estará disponible permanentemente en skinworld.shop e indicará su fecha de última actualización.',
    ],
  },
];

export default function PrivacyPage() {
  return <PaginaLegal titulo="Aviso de Privacidad" actualizacion="2 de octubre de 2026" secciones={secciones} />;
}
