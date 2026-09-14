'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Plus, Trash2, LogOut, X } from 'lucide-react';
import { formatPrice } from '@/utils';
import type { Product } from '@/types';

type AdminProduct = Product & Record<string, any>;

type FormState = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  image: string;
  description: string;
  inStock: boolean;
  featured: boolean;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  category: '',
  brand: '',
  price: '',
  compareAtPrice: '',
  image: '',
  description: '',
  inStock: true,
  featured: false,
};

function productToForm(p: AdminProduct): FormState {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category ?? '',
    brand: p.brand ?? '',
    price: String(p.price),
    compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
    image: p.image ?? '',
    description: p.description ?? '',
    inStock: Boolean(p.inStock),
    featured: Boolean(p.featured),
  };
}

export function AdminDashboard({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm(productToForm(p));
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error('Nombre y precio válido son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const url = isEdit ? `/api/admin/products/${form.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          category: form.category.trim(),
          brand: form.brand.trim(),
          price: priceNum,
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
          image: form.image.trim(),
          description: form.description.trim(),
          inStock: form.inStock,
          featured: form.featured,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al guardar el producto');
        return;
      }

      if (isEdit) {
        setProducts((prev) =>
          prev.map((p) => (p.id === form.id ? { ...p, ...mapDbProduct(data.product) } : p))
        );
        toast.success('Producto actualizado');
      } else {
        setProducts((prev) => [...prev, mapDbProduct(data.product)]);
        toast.success('Producto creado');
      }
      setFormOpen(false);
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Error al eliminar el producto');
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Producto eliminado');
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Panel de administración</h1>
            <p className="text-slate-500">{products.length} productos en tu tienda</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openCreate} className="btn btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-ink/20 px-4 py-2.5 font-accent text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, categoría o marca..."
          className="mb-6"
        />

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Destacado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-medium text-ink">{p.name}</p>
                    {p.brand && <p className="text-xs text-slate-400">{p.brand}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        Boolean(p.inStock)
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {Boolean(p.inStock) ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.featured ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        aria-label="Editar"
                        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        aria-label="Eliminar"
                        className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                {form.id ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={closeForm} aria-label="Cerrar">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              {form.id && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Slug (URL del producto)
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Precio (sin IVA) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Precio antes (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Categoría</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="ej. Acné"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Marca</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="ej. ISDIN"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">
                  URL de la imagen
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Disponible en stock
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Destacado en inicio
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">
                  {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear producto'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md border border-ink/20 px-5 py-2.5 font-accent text-sm font-semibold text-ink"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function mapDbProduct(row: any): AdminProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    priceWithIVA: Number(row.price_with_iva),
    compareAtPriceWithIVA:
      row.compare_at_price_with_iva != null ? Number(row.compare_at_price_with_iva) : undefined,
    brand: row.brand ?? undefined,
    image: row.image ?? undefined,
    category: row.category ?? undefined,
    inStock: row.in_stock ? 1 : 0,
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
