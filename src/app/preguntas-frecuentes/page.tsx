import Link from 'next/link';

export const metadata = {
  title: 'Preguntas Frecuentes · Skinworld',
  description: 'Dudas sobre envíos, devoluciones, pagos y productos de Skinworld.',
};

const faqs = [
  {
    q: '¿Cuánto cuesta el envío?',
    a: 'En la Ciudad de México el envío es gratis. Los envíos al interior de la República se cotizan según el destino.',
  },
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'Los pedidos se procesan y envían al siguiente día hábil de la confirmación de compra. En la Ciudad de México y Área Metropolitana la entrega tarda de 1 a 3 días hábiles; en el resto de la República, de 3 a 5 días hábiles. No se programan envíos en fines de semana ni días festivos.',
  },
  {
    q: '¿Puedo devolver un producto?',
    a: 'Sí. Puedes solicitar la devolución dentro de los 10 días hábiles posteriores a la entrega, presentando el comprobante de compra y el nombre de quien la realizó. Los productos en oferta o con descuento no admiten devolución, salvo que tengan defectos de origen.',
  },
  {
    q: '¿Cuánto tarda un reembolso?',
    a: 'El reembolso se entrega en un plazo de hasta 15 días hábiles contados a partir de que nos envías el paquete de vuelta. Siempre se realiza por el mismo medio con el que pagaste.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Los pagos se procesan con Stripe, que muestra al momento de pagar todos los métodos disponibles para tu caso, incluidas tarjetas de crédito y débito.',
  },
  {
    q: '¿Los productos son originales?',
    a: 'Sí. Todos los productos son originales, se adquieren directamente con laboratorios y distribuidores autorizados, y están seleccionados bajo criterio dermatológico profesional.',
  },
  {
    q: '¿Puedo pedir asesoría sobre qué producto me conviene?',
    a: 'Sí. Escríbenos desde la página de contacto y con gusto te orientamos. Ten en cuenta que la información del sitio es educativa y no sustituye una consulta dermatológica.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-sw-gutter pb-sw-section pt-12 sm:pt-16">
        <h1 className="mb-4 font-display text-sw-h1 font-semibold text-sw-ink">Preguntas Frecuentes</h1>
        <p className="mb-12 text-sw-lead text-sw-muted">
          Si tu duda no está aquí,{' '}
          <Link href="/contacto" className="font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink">
            escríbenos
          </Link>
          .
        </p>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-sw-lg border border-sw-border bg-sw-white">
              <summary className="flex min-h-[3.5rem] cursor-pointer items-center p-6 font-display text-lg font-semibold text-sw-ink hover:text-sw-pink-deep">
                {faq.q}
              </summary>
              <div className="px-6 pb-6 text-sw-body leading-relaxed text-sw-text">{faq.a}</div>
            </details>
          ))}
        </div>

        <p className="mt-10 text-sw-small text-sw-muted">
          Las condiciones completas están en nuestra{' '}
          <Link href="/envios" className="font-semibold text-sw-pink-deep underline underline-offset-4 hover:text-sw-ink">
            Política de Envíos y Devoluciones
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
