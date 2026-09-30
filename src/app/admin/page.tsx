import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllProducts } from '@/lib/products';
import { getSupabase } from '@/lib/supabase';
import { AdminDashboard } from './admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const products = await getAllProducts();

  // Pedidos que todavía esperan algo: los pagados están por empaquetar y los
  // empaquetados por enviar.
  const { count } = await getSupabase()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', ['paid', 'packed']);

  return <AdminDashboard initialProducts={products} pedidosPendientes={count ?? 0} />;
}
