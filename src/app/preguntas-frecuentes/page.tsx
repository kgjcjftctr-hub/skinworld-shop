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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-3 font-display text-4xl font-bold text-ink">Preguntas Frecuentes</h1>
        <p className="mb-12 text-slate-500">
          Si tu duda no está aquí,{' '}
          <Link href="/contacto" className="font-semibold text-primary-700 underline">
            escríbenos
          </Link>
          .
        </p>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-slate-200">
              <summary className="cursor-pointer p-6 font-display font-semibold text-ink hover:bg-slate-50">
                {faq.q}
              </summary>
              <div className="px-6 pb-6 leading-relaxed text-slate-600">{faq.a}</div>
            </details>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500">
          Las condiciones completas están en nuestra{' '}
          <Link href="/envios" className="font-semibold text-primary-700 underline">
            Política de Envíos y Devoluciones
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
