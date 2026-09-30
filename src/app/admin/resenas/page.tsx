import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';
import { ResenasClient } from './resenas-client';

export const dynamic = 'force-dynamic';

export default async function AdminResenasPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const { data: resenas } = await getSupabase()
    .from('reviews')
    .select('id, rating, comment, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">Reseñas</h1>
        <p className="mb-8 text-slate-500">
          Las reseñas se publican en cuanto el cliente las envía. Aquí puedes quitar las que no deban
          quedarse.
        </p>

        <ResenasClient resenas={(resenas ?? []) as never[]} />
      </div>
    </div>
  );
}
