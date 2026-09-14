'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Reveal } from '@/components/reveal';

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-gold-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < rating ? 'currentColor' : 'none'}
          strokeWidth={i < rating ? 0 : 1.5}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${starValue} estrella${starValue > 1 ? 's' : ''}`}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 transition-colors ${filled ? 'text-gold-500' : 'text-slate-300'}`}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={filled ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Hace 1 día';
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  const years = Math.floor(months / 12);
  return `Hace ${years} año${years > 1 ? 's' : ''}`;
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setAverage(data.average ?? 0);
      setCount(data.count ?? 0);
    } catch {
      // Sin conexión: se mantiene el estado vacío.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Selecciona una calificación');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('Cuéntanos un poco más sobre tu consulta (mínimo 10 caracteres)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, website: '' }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'No se pudo enviar tu reseña');
        return;
      }

      toast.success('¡Gracias por tu reseña!', { description: 'Se publicó de forma anónima.' });
      setRating(0);
      setComment('');
      setShowForm(false);
      loadReviews();
    } catch {
      toast.error('Error de conexión. Intenta más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-gold-500" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
              Testimonios
            </span>
          </div>
          <h2 className="mb-5 font-display text-4xl font-bold text-ink sm:text-5xl">
            La confianza de quienes ya nos eligieron
          </h2>
          <p className="text-slate-600">
            ¿Ya tuviste una consulta con la Dra. Karina? Escribe tu reseña y califica tu
            experiencia — se publica de forma 100% anónima, sin pedirte nombre ni datos
            personales.
          </p>
        </Reveal>

        {/* Resumen + CTA */}
        <Reveal className="mb-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            {count > 0 ? (
              <>
                <span className="font-display text-4xl font-bold text-ink">
                  {average.toFixed(1)}
                </span>
                <div>
                  <StarDisplay rating={Math.round(average)} />
                  <p className="mt-1 text-sm text-slate-500">
                    {count} reseña{count !== 1 && 's'} de pacientes reales
                  </p>
                </div>
              </>
            ) : (
              <p className="text-slate-600">
                Todavía no hay reseñas — sé la primera persona en calificar tu consulta.
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-5 py-2.5 font-accent text-sm font-semibold text-white transition-colors hover:bg-primary-800"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Calificar mi consulta</span>
          </button>
        </Reveal>

        {/* Formulario */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-14 rounded-2xl border border-gold-400/40 bg-primary-50/40 p-6 sm:p-8"
          >
            <p className="mb-5 text-sm text-slate-600">
              Si ya tuviste una consulta con la Dra. Karina, cuéntanos cómo fue. No pedimos tu
              nombre ni ningún dato personal — tu reseña se publica de forma anónima.
            </p>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-ink">
                Tu calificación
              </label>
              <StarInput value={rating} onChange={setRating} />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-ink">Tu reseña</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Cuéntanos cómo fue tu consulta..."
                required
              />
            </div>

            {/* Honeypot anti-spam, oculto para personas */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              onChange={() => {}}
            />

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="font-accent text-sm font-semibold text-slate-500 transition-colors hover:text-ink"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de reseñas */}
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Cargando reseñas...</p>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-slate-500">
              Todavía no hay reseñas publicadas. ¡Sé quien deje la primera!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 100}>
                <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-card">
                  <div className="mb-5">
                    <StarDisplay rating={r.rating} />
                  </div>
                  <blockquote className="mb-6 flex-1 font-display text-lg italic leading-relaxed text-ink">
                    &ldquo;{r.comment}&rdquo;
                  </blockquote>
                  <figcaption className="flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-500">
                    <span className="font-accent font-semibold uppercase tracking-wide text-slate-400">
                      Paciente verificado
                    </span>
                    <span>{timeAgo(r.createdAt)}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
