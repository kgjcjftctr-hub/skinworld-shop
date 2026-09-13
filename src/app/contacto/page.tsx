'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';

const contactItems = [
  { icon: Phone, label: 'Teléfono', value: '+55 9104 7107', href: 'tel:+5591047107' },
  { icon: Mail, label: 'Email', value: 'hola@skinworld.mx', href: 'mailto:hola@skinworld.mx' },
  { icon: MapPin, label: 'Ubicación', value: 'CDMX, México', href: undefined },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
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
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Error de conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-display text-4xl font-bold text-ink sm:text-5xl">
            Ponte en contacto
          </h1>
          <p className="text-lg text-slate-600">Estamos aquí para ayudarte</p>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
          {/* Info */}
          <div className="space-y-8 lg:col-span-2">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Icon className="h-5 w-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="mb-1 font-accent text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    <p className="font-display text-lg text-ink">{item.value}</p>
                  </div>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Asunto</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Mensaje</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tu mensaje..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
