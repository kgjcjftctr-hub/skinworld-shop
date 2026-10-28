import { revalidatePath } from 'next/cache';

/**
 * Avisa a Next.js que el catálogo cambió: el inicio, la tienda, las páginas de
 * producto y el sitemap se vuelven a armar con los datos nuevos en la siguiente
 * visita, en lugar de esperar a que venza la caché de una hora.
 */
export function refrescarTienda() {
  revalidatePath('/', 'layout');
}
