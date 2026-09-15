import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';
import { formatPrice, formatDate } from '@/utils';

function formatShippingAddress(order: any) {
  const addr = order.shipping_address;
  if (!addr) return null;
  const numeroInt = addr.numeroInterior ? ` Int. ${addr.numeroInterior}` : '';
  const calle = `${addr.calle ?? ''} ${addr.numeroExterior ?? ''}${numeroInt}`.trim();
  const resto = `${addr.colonia ?? ''}, ${addr.municipio ?? ''}, ${addr.estado ?? ''}, CP ${addr.codigoPostal ?? ''}`;
  return [order.shipping_name, calle, resto, addr.referencias, order.customer_phone]
    .filter(Boolean)
    .join(' · ');
}

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const supabase = getSupabase();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">Pedidos</h1>
        <p className="mb-8 text-slate-500">
          {orders?.length ?? 0} pedido{orders?.length !== 1 && 's'} pagado
          {orders?.length !== 1 && 's'} con Stripe
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Dirección de envío</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(orders ?? []).map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-slate-600">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-slate-600">{order.customer_email || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {Array.isArray(order.items)
                      ? order.items.map((it: any) => `${it.quantity}× ${it.name}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 max-w-xs text-slate-600">
                    {formatShippingAddress(order) || '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {formatPrice(order.amount_total)}
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    Todavía no hay pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
