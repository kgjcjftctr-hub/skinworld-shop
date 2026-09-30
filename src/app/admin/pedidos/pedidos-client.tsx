'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, Package, Truck } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils';

type Etapa = 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface Pedido {
  id: string;
  created_at: string;
  status: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_name: string | null;
  shipping_address: Record<string, string> | null;
  amount_total: number;
  items: { name: string; quantity: number; amount_total: number }[] | null;
  tracking: string | null;
  tracking_url: string | null;
}

const ETAPAS: Record<Etapa, { etiqueta: string; siguiente: Etapa | null; accion: string | null; color: string }> = {
  paid: {
    etiqueta: 'Pagado',
    siguiente: 'packed',
    accion: 'Marcar empaquetado',
    color: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  packed: {
    etiqueta: 'Empaquetado',
    siguiente: 'shipped',
    accion: 'Marcar enviado',
    color: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  shipped: {
    etiqueta: 'Enviado',
    siguiente: 'delivered',
    accion: 'Marcar entregado',
    color: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  },
  delivered: {
    etiqueta: 'Entregado',
    siguiente: null,
    accion: null,
    color: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  cancelled: {
    etiqueta: 'Cancelado',
    siguiente: null,
    accion: null,
    color: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
};

const FILTROS: { clave: 'todos' | Etapa; etiqueta: string }[] = [
  { clave: 'paid', etiqueta: 'Por empaquetar' },
  { clave: 'packed', etiqueta: 'Por enviar' },
  { clave: 'shipped', etiqueta: 'En camino' },
  { clave: 'delivered', etiqueta: 'Entregados' },
  { clave: 'todos', etiqueta: 'Todos' },
];

const etapaDe = (pedido: Pedido): Etapa => (pedido.status in ETAPAS ? (pedido.status as Etapa) : 'paid');

function direccion(pedido: Pedido) {
  const d = pedido.shipping_address;
  if (!d) return '—';
  const interior = d.numeroInterior ? ` Int. ${d.numeroInterior}` : '';
  return [
    `${d.calle ?? ''} ${d.numeroExterior ?? ''}${interior}`.trim(),
    d.colonia,
    d.municipio,
    d.estado,
    d.codigoPostal ? `CP ${d.codigoPostal}` : '',
  ]
    .filter(Boolean)
    .join(', ');
}

export function PedidosClient({ pedidos }: { pedidos: Pedido[] }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<'todos' | Etapa>('paid');
  const [guardando, setGuardando] = useState<string | null>(null);
  // Pedido cuyo número de guía se está capturando antes de marcar el envío.
  const [capturandoGuia, setCapturandoGuia] = useState<string | null>(null);
  const [guia, setGuia] = useState('');

  const conteos = useMemo(() => {
    const c: Record<string, number> = { todos: pedidos.length };
    for (const p of pedidos) c[etapaDe(p)] = (c[etapaDe(p)] ?? 0) + 1;
    return c;
  }, [pedidos]);

  const visibles = filtro === 'todos' ? pedidos : pedidos.filter((p) => etapaDe(p) === filtro);

  const cambiarEtapa = async (pedido: Pedido, etapa: Etapa, numeroDeGuia?: string) => {
    setGuardando(pedido.id);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: etapa,
          ...(numeroDeGuia !== undefined ? { guia: numeroDeGuia } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo guardar el cambio');
        return;
      }
      toast.success(
        data.avisoEnviado
          ? `Pedido marcado como ${ETAPAS[etapa].etiqueta.toLowerCase()}. Se avisó al cliente por correo.`
          : `Pedido marcado como ${ETAPAS[etapa].etiqueta.toLowerCase()}.`
      );
      setCapturandoGuia(null);
      setGuia('');
      router.refresh();
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setGuardando(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.clave}
            onClick={() => setFiltro(f.clave)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === f.clave
                ? 'bg-ink text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.etiqueta}
            <span className={filtro === f.clave ? 'ml-2 text-white/60' : 'ml-2 text-slate-400'}>
              {conteos[f.clave] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibles.map((pedido) => {
          const etapa = etapaDe(pedido);
          const { siguiente, accion } = ETAPAS[etapa];
          const ocupado = guardando === pedido.id;

          return (
            <div key={pedido.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {pedido.shipping_name || 'Sin nombre'}
                    <span className="ml-2 font-accent text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {pedido.id.slice(0, 8)}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatDate(pedido.created_at)} · {pedido.customer_email || 'sin correo'}
                    {pedido.customer_phone ? ` · ${pedido.customer_phone}` : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${ETAPAS[etapa].color}`}
                >
                  {ETAPAS[etapa].etiqueta}
                </span>
              </div>

              <ul className="mb-4 space-y-1 text-sm text-slate-600">
                {(pedido.items ?? []).map((p, i) => (
                  <li key={i} className="flex justify-between gap-4">
                    <span>
                      {p.quantity}× {p.name}
                    </span>
                    <span className="whitespace-nowrap">{formatPrice(p.amount_total)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 border-t border-slate-100 pt-2 font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatPrice(pedido.amount_total)}</span>
                </li>
              </ul>

              {pedido.tracking && (
                <p className="mb-4 text-sm text-slate-600">
                  <span className="font-semibold text-ink">Guía: </span>
                  {pedido.tracking_url ? (
                    <a
                      href={pedido.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary-700 underline"
                    >
                      {pedido.tracking}
                    </a>
                  ) : (
                    pedido.tracking
                  )}
                </p>
              )}

              <p className="mb-4 text-sm text-slate-600">
                <span className="font-semibold text-ink">Entregar en: </span>
                {direccion(pedido)}
                {pedido.shipping_address?.referencias
                  ? ` — ${pedido.shipping_address.referencias}`
                  : ''}
              </p>

              {capturandoGuia === pedido.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                    placeholder="Número de guía (opcional)"
                    autoFocus
                    className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <button
                    onClick={() => cambiarEtapa(pedido, 'shipped', guia)}
                    disabled={ocupado}
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
                  >
                    {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    Confirmar envío
                  </button>
                  <button
                    onClick={() => {
                      setCapturandoGuia(null);
                      setGuia('');
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
              <div className="flex flex-wrap items-center gap-2">
                {siguiente && accion && (
                  <button
                    onClick={() =>
                      siguiente === 'shipped'
                        ? (setCapturandoGuia(pedido.id), setGuia(pedido.tracking ?? ''))
                        : cambiarEtapa(pedido, siguiente)
                    }
                    disabled={ocupado}
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
                  >
                    {ocupado ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : siguiente === 'packed' ? (
                      <Package className="h-4 w-4" />
                    ) : siguiente === 'shipped' ? (
                      <Truck className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {accion}
                  </button>
                )}
                {etapa !== 'cancelled' && etapa !== 'delivered' && (
                  <button
                    onClick={() => cambiarEtapa(pedido, 'cancelled')}
                    disabled={ocupado}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              )}
            </div>
          );
        })}

        {visibles.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
            No hay pedidos en esta etapa.
          </p>
        )}
      </div>
    </>
  );
}
