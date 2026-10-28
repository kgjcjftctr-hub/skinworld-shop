import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';
import { faltaMigracion } from '@/lib/pedidos-db';
import { FacturasClient, type Solicitud } from './facturas-client';

export const dynamic = 'force-dynamic';

export default async function AdminFacturasPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('invoice_requests')
    .select('*, orders(amount_total, created_at, shipping_name)')
    .order('created_at', { ascending: false })
    .limit(300);

  const solicitudes = ((data ?? []) as (Omit<Solicitud, 'pedido'> & {
    orders: { amount_total: number; created_at: string; shipping_name: string | null } | null;
  })[]).map(({ orders, ...s }) => ({
    ...s,
    pedido: orders ? { total: Number(orders.amount_total), fecha: orders.created_at, nombre: orders.shipping_name } : null,
  }));

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

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">Facturas</h1>
        <p className="mb-8 text-slate-500">
          Emite cada factura en tu sistema de facturación con estos datos y sube aquí el PDF y el XML: se los mandamos al
          cliente por correo.
        </p>

        <FacturasClient solicitudes={solicitudes} migracionPendiente={faltaMigracion(error)} />
      </div>
    </div>
  );
}
