import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';
import { avisarEtapaAlCliente, esEtapa, type Pedido } from '@/lib/pedidos';

/** Cambia la etapa de un pedido y avisa al cliente por correo. */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const etapa = body?.estado;

  if (!esEtapa(etapa)) {
    return NextResponse.json({ error: 'Etapa desconocida' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: pedido, error } = await supabase
    .from('orders')
    .update({ status: etapa })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('No se pudo cambiar la etapa del pedido:', error);
    return NextResponse.json({ error: 'No se pudo guardar el cambio' }, { status: 500 });
  }
  if (!pedido) {
    return NextResponse.json({ error: 'El pedido no existe' }, { status: 404 });
  }

  // El aviso al cliente no debe impedir que la etapa quede guardada.
  const aviso = await avisarEtapaAlCliente(pedido as Pedido, etapa);
  if (!aviso.enviado) console.warn('Aviso de etapa no enviado:', aviso.motivo);

  return NextResponse.json({ estado: etapa, avisoEnviado: aviso.enviado });
}
