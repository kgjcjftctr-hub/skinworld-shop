import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { ErrorDePedido, actualizarArticulos } from '@/lib/pedidos-db';

const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

/**
 * Lo que contestó MEPIEL sobre uno o varios renglones de pedido (el mismo
 * producto puede ir en varios pedidos y se marcan juntos), o la confirmación
 * de que ya se le compró.
 */
const CambioDeArticulos = z
  .object({
    articulos: z.array(z.number().int().positive()).min(1).max(200),
    disponibilidad: z.enum(['sin_revisar', 'disponible', 'no_disponible']).optional(),
    comprado: z.boolean().optional(),
    folio: texto(60),
    nota: texto(500),
  })
  .refine((c) => c.disponibilidad !== undefined || c.comprado !== undefined, {
    message: 'Nada que cambiar',
  });

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const cambio = CambioDeArticulos.safeParse(await request.json().catch(() => null));
  if (!cambio.success) {
    return NextResponse.json({ error: 'Datos del cambio incompletos o no válidos' }, { status: 400 });
  }

  try {
    const filas = await actualizarArticulos({ ...cambio.data, articulos: [...new Set(cambio.data.articulos)], actor: 'tienda' });
    return NextResponse.json({ actualizados: filas.length });
  } catch (err) {
    if (err instanceof ErrorDePedido) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('No se pudieron actualizar los productos del pedido:', err);
    return NextResponse.json({ error: 'No se pudo guardar el cambio' }, { status: 500 });
  }
}
