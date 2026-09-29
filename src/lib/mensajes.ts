import 'server-only';
import { getSupabase } from '@/lib/supabase';

// Los mensajes se guardan como archivos JSON en un bucket privado de Supabase
// Storage en lugar de una tabla, porque la llave de servicio permite escribir
// objetos pero no crear tablas. Si más adelante se crea una tabla, basta con
// migrar estas dos funciones.
const BUCKET = 'mensajes';

export type Mensaje = {
  tipo: 'contacto' | 'boletin';
  nombre?: string;
  email: string;
  asunto?: string;
  mensaje?: string;
  fecha: string;
};

function rutaDe(tipo: Mensaje['tipo'], fecha: string) {
  const id = `${fecha.replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
  return `${tipo}/${id}.json`;
}

export async function guardarMensaje(datos: Omit<Mensaje, 'fecha'>) {
  const mensaje: Mensaje = { ...datos, fecha: new Date().toISOString() };
  const { error } = await getSupabase()
    .storage.from(BUCKET)
    .upload(rutaDe(mensaje.tipo, mensaje.fecha), JSON.stringify(mensaje, null, 2), {
      contentType: 'application/json',
    });
  if (error) throw new Error(error.message);
  return mensaje;
}

export async function listarMensajes(tipo: Mensaje['tipo'], limite = 100): Promise<Mensaje[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(tipo, { limit: limite, sortBy: { column: 'name', order: 'desc' } });
  if (error || !data) return [];

  const archivos = await Promise.all(
    data
      .filter((f) => f.name.endsWith('.json'))
      .map(async (f) => {
        const { data: blob } = await supabase.storage.from(BUCKET).download(`${tipo}/${f.name}`);
        if (!blob) return null;
        try {
          return JSON.parse(await blob.text()) as Mensaje;
        } catch {
          return null;
        }
      })
  );

  return archivos
    .filter((m): m is Mensaje => m !== null)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

// Aviso por correo. Sólo se envía si hay una llave de Resend configurada; si no,
// el mensaje ya quedó guardado y se consulta desde el panel de administración.
export async function avisarPorCorreo(mensaje: Mensaje) {
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.CONTACT_NOTIFY_EMAIL ?? 'contacto@skinworld.shop';
  const remitente = process.env.CONTACT_FROM_EMAIL ?? 'Skinworld <onboarding@resend.dev>';
  if (!apiKey) return { enviado: false, motivo: 'sin RESEND_API_KEY' };

  const esBoletin = mensaje.tipo === 'boletin';
  const asunto = esBoletin
    ? `Nueva suscripción al boletín: ${mensaje.email}`
    : `Nuevo mensaje de ${mensaje.nombre ?? mensaje.email}: ${mensaje.asunto ?? ''}`.trim();

  const cuerpo = esBoletin
    ? `<p>Alguien se suscribió al boletín desde el sitio.</p><p><strong>Correo:</strong> ${mensaje.email}</p>`
    : `<p><strong>Nombre:</strong> ${mensaje.nombre ?? '—'}</p>
       <p><strong>Correo:</strong> ${mensaje.email}</p>
       <p><strong>Asunto:</strong> ${mensaje.asunto ?? '—'}</p>
       <p><strong>Mensaje:</strong></p><p>${(mensaje.mensaje ?? '').replace(/\n/g, '<br>')}</p>`;

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
