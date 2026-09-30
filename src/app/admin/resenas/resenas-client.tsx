'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Star, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils';

interface Resena {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function ResenasClient({ resenas }: { resenas: Resena[] }) {
  const router = useRouter();
  const [borrando, setBorrando] = useState<string | null>(null);

  const borrar = async (resena: Resena) => {
    setBorrando(resena.id);
    try {
      const res = await fetch(`/api/admin/resenas/${resena.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'No se pudo borrar la reseña');
        return;
      }
      toast.success('Reseña borrada');
      router.refresh();
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setBorrando(null);
    }
  };

  if (resenas.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
        Todavía no hay reseñas.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {resenas.map((resena) => (
        <div
          key={resena.id}
          className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex" aria-label={`${resena.rating} de 5 estrellas`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    aria-hidden
                    className={`h-4 w-4 ${
                      n <= resena.rating ? 'fill-gold-500 text-gold-500' : 'text-slate-200'
                    }`}
                  />
                ))}
              </span>
              <span className="text-xs text-slate-400">{formatDate(resena.created_at)}</span>
            </div>
            <p className="text-sm text-slate-600">{resena.comment}</p>
          </div>
          <button
            onClick={() => borrar(resena)}
            disabled={borrando === resena.id}
            aria-label="Borrar reseña"
            className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {borrando === resena.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
