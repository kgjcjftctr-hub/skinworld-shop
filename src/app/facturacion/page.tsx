import { FormularioDeFactura } from './formulario';

export const metadata = {
  title: 'Facturación',
  description: 'Pide la factura (CFDI) de tu compra en Skinworld con la referencia de tu pedido y tus datos fiscales.',
};

export default function FacturacionPage() {
  return (
    <div className="pb-sw-section pt-12 sm:pt-16">
      <div className="sw-container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <p className="sw-label">Facturación</p>
          <h1 className="mt-3 font-display text-sw-h1 font-semibold text-sw-ink">Pide tu factura</h1>
          <p className="mt-4 max-w-sw-prose text-sw-lead text-sw-muted">
            Llena tus datos fiscales y te mandamos la factura (PDF y XML) al correo con el que compraste.
          </p>
          <ul className="mt-8 space-y-3 text-sw-body text-sw-text">
            <li>
              <strong className="text-sw-ink">Plazo:</strong> se pide en el mismo mes de tu compra.
            </li>
            <li>
              <strong className="text-sw-ink">Referencia:</strong> son los 8 caracteres que aparecen como «Pedido» en el
              correo de confirmación.
            </li>
            <li>
              <strong className="text-sw-ink">Datos:</strong> escríbelos tal como aparecen en tu Constancia de Situación
              Fiscal. La razón social va sin el régimen de capital (sin «S.A. de C.V.»).
            </li>
          </ul>
        </div>

        <div className="rounded-sw-lg border border-sw-border bg-sw-white p-6 sm:p-10">
          <FormularioDeFactura />
        </div>
      </div>
    </div>
  );
}
