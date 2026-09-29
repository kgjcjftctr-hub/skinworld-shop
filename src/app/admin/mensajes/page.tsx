import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { listarMensajes } from '@/lib/mensajes';

export const dynamic = 'force-dynamic';

function fechaLegible(iso: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  }).format(new Date(iso));
}

export default async function AdminMessagesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const [contacto, boletin] = await Promise.all([
    listarMensajes('contacto'),
    listarMensajes('boletin'),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">Mensajes</h1>
        <p className="mb-10 text-slate-500">
          {contacto.length} mensaje{contacto.length !== 1 && 's'} del formulario de contacto ·{' '}
          {boletin.length} suscripción{boletin.length !== 1 && 'es'} al boletín
        </p>

        <section className="mb-12">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            Formulario de contacto
          </h2>
          {contacto.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
              Todavía no hay mensajes.
            </p>
          ) : (
            <div className="space-y-4">
              {contacto.map((m) => (
                <article key={m.fecha + m.email} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-ink">{m.asunto}</h3>
                    <span className="text-xs text-slate-400">{fechaLegible(m.fecha)}</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-500">
                    {m.nombre} ·{' '}
                    <a href={`mailto:${m.email}`} className="text-primary-700 underline">
                      {m.email}
                    </a>
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{m.mensaje}</p>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.asunto ?? ''}`)}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    Responder
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">Boletín</h2>
          {boletin.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
              Todavía no hay suscriptores.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
              {boletin.map((m) => (
                <li
                  key={m.fecha + m.email}
                  className="flex flex-wrap items-center justify-between gap-2 px-6 py-3"
                >
                  <a href={`mailto:${m.email}`} className="text-ink hover:underline">
                    {m.email}
                  </a>
                  <span className="text-xs text-slate-400">{fechaLegible(m.fecha)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
