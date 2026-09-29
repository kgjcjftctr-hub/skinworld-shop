import 'server-only';

const SITIO = 'https://www.skinworld.shop';
const CORREO_TIENDA = process.env.CONTACT_NOTIFY_EMAIL ?? 'contacto@skinworld.shop';
const REMITENTE = process.env.CONTACT_FROM_EMAIL ?? 'Skinworld <onboarding@resend.dev>';

export function escaparHtml(texto: unknown): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Envuelve el contenido en la plantilla de Skinworld. */
export function plantilla(titulo: string, contenido: string) {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;background:#f6f6f7;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2b2b31;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ececf0;">
    <tr>
      <td style="padding:28px 32px 0;">
        <p style="margin:0;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#b08ba5;font-weight:700;">Skinworld</p>
        <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#1c1c22;">${escaparHtml(titulo)}</h1>
      </td>
    </tr>
    <tr><td style="padding:20px 32px 32px;font-size:15px;line-height:1.6;color:#4a4a55;">${contenido}</td></tr>
    <tr>
      <td style="padding:18px 32px 26px;border-top:1px solid #f0f0f4;font-size:12px;line-height:1.6;color:#9a9aa6;">
        Skinworld · by Karina Alfaro<br>
        <a href="${SITIO}" style="color:#9a9aa6;">skinworld.shop</a> ·
        <a href="mailto:${CORREO_TIENDA}" style="color:#9a9aa6;">${CORREO_TIENDA}</a>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface Correo {
  para: string;
  asunto: string;
  html: string;
  responderA?: string;
}

/**
 * Manda un correo con Resend. Si no hay llave configurada no falla: devuelve el
 * motivo para que quede en el registro y el resto del pedido siga su curso.
 */
export async function enviarCorreo({ para, asunto, html, responderA }: Correo) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { enviado: false, motivo: 'sin RESEND_API_KEY' };
  if (!para) return { enviado: false, motivo: 'sin destinatario' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: REMITENTE,
        to: [para],
        subject: asunto,
        html,
        ...(responderA ? { reply_to: responderA } : {}),
      }),
    });
    if (!res.ok) {
      return { enviado: false, motivo: `Resend respondió ${res.status}: ${await res.text()}` };
    }
    return { enviado: true };
  } catch (e) {
    return { enviado: false, motivo: String(e) };
  }
}

export { CORREO_TIENDA, SITIO };
