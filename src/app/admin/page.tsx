import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllProducts } from '@/lib/products';
import { AdminDashboard } from './admin-dashboard';

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const products = await getAllProducts();

  return <AdminDashboard initialProducts={products} />;
}
