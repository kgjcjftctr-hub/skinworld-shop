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

// En la vista previa mostramos la selección que pidió la Dra. Karina sin
// cambiar las marcas editoriales guardadas en la base de datos de producción.
const DESTACADOS_VISTA_PREVIA = [
  'uriage-depiderm-serum-booster-antimanchas-30-ml',
  'hyaluron-filler-epigenetic-serum-30-ml',
  'isdinceutics-melaclear-advanced-serum-antimanchas-30-ml',
  'anthelios-uv-air-spf50-seum-invisible-50-ml',
];

/**
 * Todo lo que la página de inicio necesita del catálogo, sacado de una sola
 * consulta. Antes cada sección pedía el catálogo completo por su cuenta
 * (cuatro veces por render). Solo lee: no cambia productos ni precios.
 */
export async function datosDeLaPortada() {
  const todos = await getAllProducts();
  const catalogo: ProductoDelCatalogo[] = dedupeVariants(todos);

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

  const productosDestacados = process.env.VERCEL_ENV === 'preview'
    ? DESTACADOS_VISTA_PREVIA.map((slug) => todos.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p))
    : dedupeVariants(todos.filter((p) => p.featured));

  return {
    totalProductos: catalogo.length,
    marcas: marcasOrdenadas,
    porCategoria,
    // En producción la selección sigue viniendo del panel administrativo.
    // En la vista previa se muestran los cuatro productos solicitados.
    destacados: productosDestacados,
    // Para la portada: un producto real de cada una de las tres marcas con más catálogo.
    portada: marcasOrdenadas
      .slice(0, 3)
      .map((m) => m.muestra)
      .filter((p): p is ProductoDelCatalogo => p !== null),
  };
}

export type DatosDeLaPortada = Awaited<ReturnType<typeof datosDeLaPortada>>;
