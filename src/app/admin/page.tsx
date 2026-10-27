import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllProducts } from '@/lib/products';
import { getSupabase } from '@/lib/supabase';
import { ESTADOS_ABIERTOS } from '@/lib/estados-pedido';
import { AdminDashboard } from './admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const products = await getAllProducts();

  // Pedidos que todavía esperan algo de la tienda: pedirlos a MEPIEL,
  // confirmarlos, prepararlos o enviarlos. «paid» y «packed» son los nombres
  // anteriores a la migración 003.
  const { count } = await getSupabase()
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .in('status', [...ESTADOS_ABIERTOS, 'paid', 'packed']);

  return <AdminDashboard initialProducts={products} pedidosPendientes={count ?? 0} />;
}
