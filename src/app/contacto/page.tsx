'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';

const contactItems = [
  { icon: Phone, label: 'Teléfono', value: '+52 56 1288 4245', href: 'tel:+525612884245' },
  { icon: Mail, label: 'Correo', value: 'contacto@skinworld.shop', href: 'mailto:contacto@skinworld.shop' },
  { icon: MapPin, label: 'Ubicación', value: 'CDMX, México', href: undefined },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Error al enviar el mensaje');
        return;
      }

      toast.success('Mensaje enviado', {
        description: 'Nos pondremos en contacto contigo pronto.',
      });
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      toast.error('Error de conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const campo =
    '!h-12 !rounded-sw !border-sw-border !bg-sw-white !px-4 !text-sw-ink placeholder:!text-sw-muted focus:!border-sw-pink-deep focus:!ring-sw-pink-deep/25';

  return (
    <div className="pb-sw-section pt-12 sm:pt-16">
      <div className="sw-container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <p className="sw-label">Contacto</p>
          <h1 className="mt-3 font-display text-sw-h1 font-semibold text-sw-ink">Ponte en contacto</h1>
          <p className="mt-4 max-w-sw-prose text-sw-lead text-sw-muted">
            Estamos aquí para ayudarte con tu pedido, un producto o tu rutina.
          </p>

          <ul className="mt-10 border-t border-sw-ink/80">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <span className="flex items-center gap-4 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sw-pink-pale">
                    <Icon className="h-5 w-5 text-sw-pink-deep" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sw-small text-sw-muted">{item.label}</span>
                    <span className="block font-display text-xl text-sw-ink">{item.value}</span>
                  </span>
                </span>
              );
              return (
                <li key={item.label} className="border-b border-sw-border">
                  {item.href ? (
                    <a href={item.href} className="block text-sw-ink hover:text-sw-pink-deep">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-sw-body text-sw-text">Atención de lunes a viernes, de 10 a 18 h.</p>
          <p className="mt-2 text-sw-body text-sw-text">
            Antes de escribir, quizá te ayuden las{' '}
            <Link href="/preguntas-frecuentes" className="font-semibold text-sw-ink underline decoration-sw-pink underline-offset-4 hover:text-sw-pink-deep">
              preguntas frecuentes
            </Link>{' '}
            o la página de{' '}
            <Link href="/envios" className="font-semibold text-sw-ink underline decoration-sw-pink underline-offset-4 hover:text-sw-pink-deep">
              envíos y devoluciones
            </Link>
            .
          </p>
        </div>

        <div className="rounded-sw-lg border border-sw-border bg-sw-white p-6 sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-sw-ink">Escríbenos</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Campo trampa para robots: no se ve ni se puede enfocar. */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contacto-nombre" className="mb-2 block text-sw-small font-semibold text-sw-ink">
                  Nombre
                </label>
                <input
                  id="contacto-nombre"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                  className={campo}
                />
              </div>

              <div>
                <label htmlFor="contacto-correo" className="mb-2 block text-sw-small font-semibold text-sw-ink">
                  Correo electrónico
                </label>
                <input
                  id="contacto-correo"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                  className={campo}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contacto-asunto" className="mb-2 block text-sw-small font-semibold text-sw-ink">
                Asunto
              </label>
              <input
                id="contacto-asunto"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="¿En qué podemos ayudarte?"
                className={campo}
              />
            </div>

            <div>
              <label htmlFor="contacto-mensaje" className="mb-2 block text-sw-small font-semibold text-sw-ink">
                Mensaje
              </label>
              <textarea
                id="contacto-mensaje"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Tu mensaje..."
                className="!rounded-sw !border-sw-border !bg-sw-white !px-4 !py-3 !text-sw-ink placeholder:!text-sw-muted focus:!border-sw-pink-deep focus:!ring-sw-pink-deep/25"
              />
            </div>

            <button type="submit" disabled={loading} className="sw-btn sw-btn-primary h-12 w-full sm:w-auto sm:px-10">
              {loading ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
