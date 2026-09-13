export default function FAQPage() {
  const faqs = [
    { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos todas las tarjetas de crédito, transferencia bancaria y billetera digital." },
    { q: "¿Cuál es el tiempo de envío?", a: "El envío estándar tarda 3-5 días hábiles. Envío express disponible." },
    { q: "¿Tienen garantía de devolución?", a: "Sí, aceptamos devoluciones dentro de 30 días." },
    { q: "¿Los productos son originales?", a: "Todos nuestros productos son 100% originales y cuentan con respaldo profesional dermatológico." },
  ];
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-12">Preguntas Frecuentes</h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <details key={i} className="border border-slate-200 rounded-lg">
              <summary className="p-6 font-semibold text-slate-900 cursor-pointer hover:bg-slate-50">{faq.q}</summary>
              <div className="px-6 pb-6 text-slate-600">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
