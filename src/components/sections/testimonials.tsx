'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-sw-pink-deep">
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
            className="rounded-sw-sm p-1"
          >
            <Star
              className={`h-7 w-7 transition-colors ${filled ? 'text-sw-pink-deep' : 'text-sw-muted/50'}`}
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

  const destacada = reviews[0];

  return (
    <section aria-labelledby="opiniones-titulo" className="bg-sw-surface py-12 sm:py-16">
      <div className="sw-container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)_auto] lg:items-center lg:gap-12">
          <div>
            <h2 id="opiniones-titulo" className="font-display text-2xl font-semibold text-sw-ink">
              Opiniones de consulta
            </h2>
            {loading ? (
              <p className="mt-2 text-sw-small text-sw-muted">Cargando opiniones…</p>
            ) : count > 0 ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="font-display text-4xl font-semibold tabular-nums text-sw-ink">
                  {average.toFixed(1)}
                </span>
                <div>
                  <StarDisplay rating={Math.round(average)} />
                  <p className="mt-1 text-sw-small text-sw-muted">
                    {count} {count === 1 ? 'opinión publicada' : 'opiniones publicadas'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sw-body text-sw-muted">
                Todavía no hay opiniones. Si ya tuviste consulta, puedes dejar la primera.
              </p>
            )}
          </div>

          {destacada ? (
            <figure className="border-l-2 border-sw-pink pl-5 sm:pl-6">
              <blockquote className="font-display text-xl leading-snug text-sw-ink sm:text-2xl">
                &ldquo;{destacada.comment}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-sw-small text-sw-muted">
                Opinión anónima, {timeAgo(destacada.createdAt).toLowerCase()}
              </figcaption>
            </figure>
          ) : (
            <div className="hidden lg:block" />
          )}

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            aria-expanded={showForm}
            aria-controls="formulario-opinion"
            className="sw-btn sw-btn-secondary h-12 self-start lg:self-center"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden />
            Calificar mi consulta
          </button>
        </div>

        {reviews.length > 1 && (
          <ul className="mt-10 grid gap-6 border-t border-sw-ink/10 pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(1).map((r) => (
              <li key={r.id}>
                <figure>
                  <StarDisplay rating={r.rating} />
                  <blockquote className="mt-3 font-display text-lg leading-snug text-sw-ink">
                    &ldquo;{r.comment}&rdquo;
                  </blockquote>
                  <figcaption className="mt-2 text-sw-xs text-sw-muted">
                    Opinión anónima, {timeAgo(r.createdAt).toLowerCase()}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}

        {showForm && (
          <form
            id="formulario-opinion"
            onSubmit={handleSubmit}
            className="mt-10 max-w-2xl rounded-sw-lg border border-sw-border bg-sw-warm-white p-6 sm:p-8"
          >
            <p className="mb-6 text-sw-body text-sw-muted">
              Si ya tuviste una consulta con la Dra. Karina, cuéntanos cómo fue. No pedimos tu
              nombre ni ningún dato personal: tu opinión se publica de forma anónima.
            </p>

            <fieldset className="mb-5">
              <legend className="mb-2 text-sw-small font-semibold text-sw-ink">Tu calificación</legend>
              <StarInput value={rating} onChange={setRating} />
            </fieldset>

            <div className="mb-6">
              <label htmlFor="opinion-texto" className="mb-2 block text-sw-small font-semibold text-sw-ink">
                Tu opinión
              </label>
              <textarea
                id="opinion-texto"
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

            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={submitting} className="sw-btn sw-btn-primary h-12">
                {submitting ? 'Enviando...' : 'Publicar opinión'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-12 px-2 text-sw-small font-semibold text-sw-muted transition-colors hover:text-sw-ink"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
