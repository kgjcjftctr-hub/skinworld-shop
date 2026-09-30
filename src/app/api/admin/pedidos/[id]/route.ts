import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';
import { MOMENTO_DE_ETAPA, avisarEtapaAlCliente, esEtapa, type Pedido } from '@/lib/pedidos';

/** Cambia la etapa de un pedido, guarda el momento y avisa al cliente. */
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

  const cambios: Record<string, string | null> = { status: etapa };

  const momento = MOMENTO_DE_ETAPA[etapa];
  if (momento) cambios[momento] = new Date().toISOString();

  // El número de guía se captura al marcar el envío y es opcional: si la tienda
  // lo deja en blanco, el pedido avanza igual y el correo sale sin él.
  if (typeof body?.guia === 'string') {
    const guia = body.guia.trim().slice(0, 100);
    cambios.tracking = guia || null;
    cambios.tracking_url = guia ? enlaceDeRastreo(guia) : null;
  }

  const supabase = getSupabase();
  const { data: pedido, error } = await supabase
    .from('orders')
    .update(cambios)
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

/**
 * Página de rastreo, deducida del formato de la guía. Sólo se arma cuando el
 * formato es reconocible; si no, el correo muestra el número sin enlace, que es
 * preferible a mandar al cliente a una página equivocada.
 */
function enlaceDeRastreo(guia: string): string | null {
  const limpia = guia.replace(/\s|-/g, '');
  if (/^\d{12}$/.test(limpia)) return `https://www.fedex.com/fedextrack/?trknbr=${limpia}`;
  if (/^1Z[0-9A-Z]{16}$/i.test(limpia)) return `https://www.ups.com/track?tracknum=${limpia}`;
  if (/^\d{10}$/.test(limpia)) return `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${limpia}`;
  return null;
}
