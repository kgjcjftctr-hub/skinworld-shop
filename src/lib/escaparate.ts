import 'server-only';
import { getAllProducts, dedupeVariants } from '@/lib/products';
import type { Product } from '@/types';

type ProductoDelCatalogo = Product & Record<string, any>;

export interface MarcaDelEscaparate {
  nombre: string;
  productos: number;
  /** Un producto con foto, para reconocer la marca de un vistazo. */
  muestra: ProductoDelCatalogo | null;
}

/**
 * Todo lo que la página de inicio necesita del catálogo, sacado de una sola
 * consulta. Antes cada sección pedía el catálogo completo por su cuenta
 * (cuatro veces por render). Solo lee: no cambia productos ni precios.
 */
export async function datosDeLaPortada() {
  const catalogo: ProductoDelCatalogo[] = dedupeVariants(await getAllProducts());

  const marcas = new Map<string, MarcaDelEscaparate>();
  const porCategoria: Record<string, number> = {};

  for (const producto of catalogo) {
    if (producto.category) porCategoria[producto.category] = (porCategoria[producto.category] || 0) + 1;

    const nombre = producto.brand?.trim();
    if (!nombre) continue;
    const marca = marcas.get(nombre) ?? { nombre, productos: 0, muestra: null };
    marca.productos += 1;
    if (!marca.muestra && producto.image) marca.muestra = producto;
    marcas.set(nombre, marca);
  }

  const marcasOrdenadas = [...marcas.values()].sort(
    (a, b) => b.productos - a.productos || a.nombre.localeCompare(b.nombre, 'es')
  );

  return {
    totalProductos: catalogo.length,
    marcas: marcasOrdenadas,
    porCategoria,
    // Los que el panel marca como destacados: son la selección de la Dra. Karina.
    destacados: catalogo.filter((p) => p.featured),
    // Para la portada: un producto real de cada una de las tres marcas con más catálogo.
    portada: marcasOrdenadas
      .slice(0, 3)
      .map((m) => m.muestra)
      .filter((p): p is ProductoDelCatalogo => p !== null),
  };
}

export type DatosDeLaPortada = Awaited<ReturnType<typeof datosDeLaPortada>>;
