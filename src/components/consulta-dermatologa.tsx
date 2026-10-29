import Link from 'next/link';

export function ConsultaDermatologa({ className = '' }: { className?: string }) {
  return <aside className={className}>
    <h2 className="font-display text-2xl text-sw-ink">¿No encuentras tu producto?</h2>
    <p className="mt-3 text-sw-text">Consulta a la Dra. Karina antes de comprar otro.</p>
    <p className="mt-4 rounded-sw border-l-4 border-sw-pink bg-sw-pink-pale p-4 text-sm leading-relaxed text-sw-text">
      La fórmula, la concentración y la presentación pueden cambiar entre productos. Confirma con tu dermatóloga antes de sustituir el que te indicó.
    </p>
    <Link href="/contacto" className="sw-btn sw-btn-primary mt-5 min-h-12 px-5">Contactar a la doctora</Link>
  </aside>;
}
