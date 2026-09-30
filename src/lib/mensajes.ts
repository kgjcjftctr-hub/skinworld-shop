import 'server-only';
import { getSupabase } from '@/lib/supabase';

// Los mensajes viven en la tabla `messages`. Antes se guardaban como objetos
// sueltos en Supabase Storage, porque la llave de servicio podía crear buckets
// pero no tablas; `scripts/migrar-mensajes.mjs` pasa los que quedaran allí.
export type Mensaje = {
  id?: string;
  tipo: 'contacto' | 'boletin';
  nombre?: string;
  email: string;
  asunto?: string;
  mensaje?: string;
  fecha: string;
};

interface Fila {
  id: string;
  kind: string;
  name: string | null;
  email: string;
  subject: string | null;
  body: string | null;
  created_at: string;
}

function aMensaje(fila: Fila): Mensaje {
  return {
    id: fila.id,
    tipo: fila.kind === 'boletin' ? 'boletin' : 'contacto',
    nombre: fila.name ?? undefined,
    email: fila.email,
    asunto: fila.subject ?? undefined,
    mensaje: fila.body ?? undefined,
    fecha: fila.created_at,
  };
}

export async function guardarMensaje(datos: Omit<Mensaje, 'fecha' | 'id'>): Promise<Mensaje> {
  const supabase = getSupabase();

  // Suscribirse dos veces al boletín no debe crear dos renglones; el índice
  // único lo impide de todos modos, pero así no se reporta como error.
  if (datos.tipo === 'boletin') {
    const { data: yaEsta } = await supabase
      .from('messages')
      .select('*')
      .eq('kind', 'boletin')
      .ilike('email', datos.email)
      .maybeSingle();
    if (yaEsta) return aMensaje(yaEsta as Fila);
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      kind: datos.tipo,
      name: datos.nombre ?? null,
      email: datos.email,
      subject: datos.asunto ?? null,
      body: datos.mensaje ?? null,
    })
    .select()
    .single();

  if (error) {
    // 23505 es el índice único del boletín: alguien se suscribió dos veces a la
    // vez. No es un fallo para quien lo hizo.
    if (error.code === '23505' && datos.tipo === 'boletin') {
      return { ...datos, fecha: new Date().toISOString() };
    }
    throw new Error(error.message);
  }

  return aMensaje(data as Fila);
}

export async function listarMensajes(tipo: Mensaje['tipo'], limite = 100): Promise<Mensaje[]> {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('kind', tipo)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error || !data) return [];
  return (data as Fila[]).map(aMensaje);
}

// Aviso por correo. Sólo se envía si hay una llave de Resend configurada; si no,
// el mensaje ya quedó guardado y se consulta desde el panel de administración.
export async function avisarPorCorreo(mensaje: Mensaje) {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.CONTACT_NOTIFY_EMAIL ?? 'contacto@skinworld.shop';
  const remitente = process.env.CONTACT_FROM_EMAIL ?? 'Skinworld <onboarding@resend.dev>';
  if (!apiKey) return { enviado: false, motivo: 'sin RESEND_API_KEY' };

  const escapar = (texto: unknown) =>
    String(texto ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const esBoletin = mensaje.tipo === 'boletin';
  const asunto = esBoletin
    ? `Nueva suscripción al boletín: ${mensaje.email}`
    : `Nuevo mensaje de ${mensaje.nombre ?? mensaje.email}: ${mensaje.asunto ?? ''}`.trim();

  const cuerpo = esBoletin
    ? `<p>Alguien se suscribió al boletín desde el sitio.</p><p><strong>Correo:</strong> ${escapar(mensaje.email)}</p>`
    : `<p><strong>Nombre:</strong> ${escapar(mensaje.nombre ?? '—')}</p>
       <p><strong>Correo:</strong> ${escapar(mensaje.email)}</p>
       <p><strong>Asunto:</strong> ${escapar(mensaje.asunto ?? '—')}</p>
       <p><strong>Mensaje:</strong></p><p>${escapar(mensaje.mensaje ?? '').replace(/\n/g, '<br>')}</p>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        reply_to: mensaje.email,
        subject: asunto,
        html: cuerpo,
      }),
    });
    if (!res.ok) return { enviado: false, motivo: `Resend respondió ${res.status}` };
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: String(e) };
  }
}
