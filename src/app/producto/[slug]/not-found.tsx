import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="sw-container py-sw-section text-center">
      <h1 className="font-display text-sw-h2 font-semibold text-sw-ink">Producto no encontrado</h1>
      <p className="mx-auto mt-4 max-w-sw-prose text-sw-body text-sw-muted">
        Este producto ya no está en el catálogo o la dirección cambió.
      </p>
      <Link href="/tienda" className="sw-btn sw-btn-primary mt-8 h-12">
        Ir a la tienda
      </Link>
    </div>
  );
}
