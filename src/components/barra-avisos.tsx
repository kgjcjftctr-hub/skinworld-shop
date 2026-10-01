/**
 * Franja de avisos de la tienda. En todas las páginas va arriba del
 * encabezado; en el inicio va justo después de la intro, para no romper la
 * apertura oscura.
 */
export function BarraDeAvisos() {
  return (
    <div className="bg-sw-pink-soft">
      <p className="sw-container flex justify-center gap-x-6 py-2 text-center text-sw-xs font-medium text-sw-ink">
        <span className="hidden sm:inline">Precios en pesos mexicanos (MXN)</span>
        <span>Envío gratis en CDMX</span>
        <span>Productos 100% originales</span>
      </p>
    </div>
  );
}
