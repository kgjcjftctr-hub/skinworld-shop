import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabase } from '@/lib/supabase';
import { normalizarEstado, presentacionDe } from '@/lib/estados-pedido';
import { faltaMigracion } from '@/lib/pedidos-db';
import {
  PedidosClient,
  type Articulo,
  type Evento,
  type PedidoDelPanel,
  type ProductoPorRevisar,
  type Vista,
} from './pedidos-client';

export const dynamic = 'force-dynamic';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const VISTAS: Vista[] = ['pedidos', 'mepiel', 'revisar'];
// Hora del centro de México (sin horario de verano desde 2022).
const ZONA = '-06:00';

type Fila = Record<string, unknown>;

/** Consulta por bloques para no armar URLs enormes con cientos de ids. */
async function porBloques<T>(ids: string[], consulta: (bloque: string[]) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const filas: T[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await consulta(ids.slice(i, i + 100));
    if (error) return { filas, error: error as { code?: string; message?: string } };
    filas.push(...(data ?? []));
  }
  return { filas, error: null };
}

/** Datos internos de MEPIEL de cada producto. Sólo existen después de la migración 002. */
async function datosDeProveedor(productos: string[]) {
  const supabase = getSupabase();
  const { filas, error } = await porBloques<Fila>(productos, (bloque) =>
    supabase
      .from('product_suppliers')
      .select('product_id, supplier_code, supplier_cost, presentation')
      .eq('supplier', 'MEPIEL')
      .in('product_id', bloque)
  );
  return { porProducto: new Map(filas.map((f) => [String(f.product_id), f])), error };
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
  const desde = FECHA.test(uno(params.desde)) ? uno(params.desde) : '';
  const hasta = FECHA.test(uno(params.hasta)) ? uno(params.hasta) : '';
  const vista = (VISTAS as string[]).includes(uno(params.vista)) ? (uno(params.vista) as Vista) : 'pedidos';

  const supabase = getSupabase();
  let consulta = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(300);
  if (desde) consulta = consulta.gte('created_at', `${desde}T00:00:00${ZONA}`);
  if (hasta) consulta = consulta.lte('created_at', `${hasta}T23:59:59.999${ZONA}`);
  const { data: filasDePedidos } = await consulta;
  const pedidos = (filasDePedidos ?? []) as Fila[];
  const ids = pedidos.map((p) => String(p.id));

  const articulos = await porBloques<Fila>(ids, (bloque) =>
    supabase.from('order_items').select('*').in('order_id', bloque).order('position')
  );
  const eventos = await porBloques<Fila>(ids, (bloque) =>
    supabase.from('order_events').select('*').in('order_id', bloque).order('created_at').order('id')
  );
  const migracionPendiente = faltaMigracion(articulos.error) || faltaMigracion(eventos.error);

  const productosEnPedidos = [...new Set(articulos.filas.map((a) => a.product_id).filter(Boolean).map(String))];
  const proveedor = await datosDeProveedor(productosEnPedidos);

  const articulosPorPedido = new Map<string, Articulo[]>();
  for (const a of articulos.filas) {
    const ps = a.product_id ? proveedor.porProducto.get(String(a.product_id)) : undefined;
    const lista = articulosPorPedido.get(String(a.order_id)) ?? [];
    lista.push({
      id: Number(a.id),
      product_id: (a.product_id as string | null) ?? null,
      name: String(a.name),
      quantity: Number(a.quantity),
      amount_total: Number(a.amount_total),
      // Si el pedido entró antes de relacionar el producto con MEPIEL, se usa
      // el código que tiene hoy.
      supplier_code: (a.supplier_code as string | null) ?? ((ps?.supplier_code as string | undefined) ?? null),
      presentation: (a.presentation as string | null) ?? ((ps?.presentation as string | undefined) ?? null),
      availability: a.availability as Articulo['availability'],
      purchased_at: (a.purchased_at as string | null) ?? null,
      supplier_order_ref: (a.supplier_order_ref as string | null) ?? null,
      costo: ps?.supplier_cost != null ? Number(ps.supplier_cost) : null,
    });
    articulosPorPedido.set(String(a.order_id), lista);
  }

  const eventosPorPedido = new Map<string, Evento[]>();
  for (const e of eventos.filas) {
    const lista = eventosPorPedido.get(String(e.order_id)) ?? [];
    lista.push(e as unknown as Evento);
    eventosPorPedido.set(String(e.order_id), lista);
  }

  const delPanel: PedidoDelPanel[] = pedidos.map((p) => {
    const id = String(p.id);
    const items = (p.items as { name: string; quantity: number; amount_total: number }[] | null) ?? [];
    return {
      id,
      created_at: String(p.created_at),
      status: normalizarEstado(p.status),
      customer_email: (p.customer_email as string | null) ?? null,
      customer_phone: (p.customer_phone as string | null) ?? null,
      shipping_name: (p.shipping_name as string | null) ?? null,
      shipping_address: (p.shipping_address as Record<string, string> | null) ?? null,
      amount_total: Number(p.amount_total),
      envio: items.filter((i) => i.name === 'Envío').reduce((s, i) => s + Number(i.amount_total), 0),
      tracking: (p.tracking as string | null) ?? null,
      tracking_url: (p.tracking_url as string | null) ?? null,
      // Sin la migración 003 los productos sólo existen dentro del pedido; se
      // muestran para consulta, sin acciones.
      articulos: migracionPendiente
        ? items
            .filter((i) => i.name !== 'Envío')
            .map((i, n) => ({
              id: -(n + 1),
              product_id: null,
              name: i.name,
              quantity: i.quantity,
              amount_total: i.amount_total,
              supplier_code: null,
              presentation: presentacionDe(i.name),
              availability: 'sin_revisar' as const,
              purchased_at: null,
              supplier_order_ref: null,
              costo: null,
            }))
        : articulosPorPedido.get(id) ?? [],
      historial: eventosPorPedido.get(id) ?? [],
    };
  });

  const revision = vista === 'revisar' ? await productosPorRevisar() : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <h1 className="mb-2 font-display text-3xl font-bold text-ink">Pedidos</h1>
        <p className="mb-8 text-slate-500">
          Cada cambio queda en el historial del pedido. Al confirmar, preparar, enviar, entregar, cancelar o
          reembolsar se le avisa al cliente por correo.
        </p>

        <PedidosClient
          pedidos={delPanel}
          migracionPendiente={migracionPendiente}
          vista={vista}
          desde={desde}
          hasta={hasta}
          revision={revision}
        />
      </div>
    </div>
  );
}

/**
 * Productos que no deberían venderse como disponibles sin que alguien los
 * revise: sin precio de venta, sin relación con MEPIEL (no hay a quién
 * pedirlos) o que MEPIEL reportó agotados o descontinuados.
 */
async function productosPorRevisar(): Promise<{ productos: ProductoPorRevisar[]; faltaMigracion002: boolean }> {
  const supabase = getSupabase();
  const productos: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, brand, price_with_iva, in_stock')
      .order('name')
      .order('id')
      .range(desde, desde + 999);
    if (error || !data) break;
    productos.push(...data);
    if (data.length < 1000) break;
  }

  const proveedor = new Map<string, Fila>();
  let faltaMigracion002 = false;
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await supabase
      .from('product_suppliers')
      .select('product_id, supplier_code, availability, supplier_status')
      .eq('supplier', 'MEPIEL')
      .range(desde, desde + 999);
    if (error) {
      faltaMigracion002 = faltaMigracion(error);
      break;
    }
    for (const f of data ?? []) proveedor.set(String(f.product_id), f);
    if (!data || data.length < 1000) break;
  }

  const porRevisar: ProductoPorRevisar[] = [];
  for (const p of productos) {
    const ps = proveedor.get(String(p.id));
    const motivos: ProductoPorRevisar['motivos'] = [];
    if (!(Number(p.price_with_iva) > 0)) motivos.push('sin_precio');
    if (p.in_stock) {
      if (!faltaMigracion002 && !ps) motivos.push('sin_codigo');
      if (ps && ['agotado', 'descontinuado'].includes(String(ps.availability))) motivos.push('agotado_en_mepiel');
      if (ps && /DESCONTINUADO/i.test(String(ps.supplier_status ?? ''))) motivos.push('descontinuado_en_catalogo');
    }
    if (motivos.length) {
      porRevisar.push({
        id: String(p.id),
        name: String(p.name),
        brand: (p.brand as string | null) ?? null,
        price_with_iva: Number(p.price_with_iva) || null,
        in_stock: Boolean(p.in_stock),
        supplier_code: (ps?.supplier_code as string | undefined) ?? null,
        motivos,
      });
    }
  }
  return { productos: porRevisar, faltaMigracion002 };
}
