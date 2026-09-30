import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';

/** Quita una reseña. Las reseñas se publican solas, así que la moderación es
 *  posterior: la tienda revisa y borra lo que no deba quedarse. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const { error } = await getSupabase().from('reviews').delete().eq('id', id);

  if (error) {
    console.error('No se pudo borrar la reseña:', error);
    return NextResponse.json({ error: 'No se pudo borrar la reseña' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
