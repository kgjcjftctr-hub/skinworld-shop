'use client';

import { useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Check, ChevronDown, ClipboardCopy, History, Loader2, Truck, X } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils';
import {
  ACCION_HACIA,
  DISPONIBILIDAD,
  ESTADOS,
  ESTADOS_ABIERTOS,
  ESTADOS_POR_COMPRAR,
  LISTA_DE_ESTADOS,
  TRANSICIONES,
  etiquetaDeEstado,
  type Disponibilidad,
  type Estado,
} from '@/lib/estados-pedido';

export type Vista = 'pedidos' | 'mepiel' | 'revisar';

export interface Articulo {
  id: number;
  product_id: string | null;
  name: string;
  quantity: number;
  amount_total: number;
  supplier_code: string | null;
  presentation: string | null;
  availability: Disponibilidad;
  purchased_at: string | null;
  supplier_order_ref: string | null;
  /** Costo de MEPIEL por pieza. Sólo existe en el panel. */
  costo: number | null;
}

export interface Evento {
  id: number;
  created_at: string;
  kind: 'estado' | 'disponibilidad' | 'compra' | 'guia' | 'correo' | 'pago' | 'nota';
  from_status: string | null;
  to_status: string | null;
  actor: string;
  note: string | null;
  data: Record<string, unknown>;
}

export interface PedidoDelPanel {
  id: string;
  created_at: string;
  status: Estado;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_name: string | null;
  shipping_address: Record<string, string> | null;
  amount_total: number;
  envio: number;
  tracking: string | null;
  tracking_url: string | null;
  articulos: Articulo[];
  historial: Evento[];
}

export interface ProductoPorRevisar {
  id: string;
  name: string;
  brand: string | null;
  price_with_iva: number | null;
  in_stock: boolean;
  supplier_code: string | null;
  motivos: ('sin_precio' | 'sin_codigo' | 'agotado_en_mepiel' | 'descontinuado_en_catalogo')[];
}

const COLOR_DE_ESTADO: Record<Estado, string> = {
  pending_payment: 'bg-orange-50 text-orange-800 ring-orange-200',
  received: 'bg-amber-50 text-amber-800 ring-amber-200',
  awaiting_supplier: 'bg-violet-50 text-violet-800 ring-violet-200',
  confirmed: 'bg-teal-50 text-teal-800 ring-teal-200',
  preparing: 'bg-sky-50 text-sky-800 ring-sky-200',
  shipped: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  refunded: 'bg-rose-50 text-rose-800 ring-rose-200',
};

const COLOR_DE_DISPONIBILIDAD: Record<Disponibilidad, string> = {
  sin_revisar: 'bg-slate-100 text-slate-600',
  disponible: 'bg-emerald-50 text-emerald-800',
  no_disponible: 'bg-rose-50 text-rose-800',
};

const MOTIVOS: Record<ProductoPorRevisar['motivos'][number], string> = {
  sin_precio: 'Sin precio de venta',
  sin_codigo: 'Sin código MEPIEL',
  agotado_en_mepiel: 'MEPIEL lo reportó agotado',
  descontinuado_en_catalogo: 'Descontinuado en el catálogo de MEPIEL',
};

/** Etapas a las que sólo se llega escribiendo algo que queda en el historial. */
const PIDEN_DATOS: Estado[] = ['shipped', 'cancelled', 'refunded'];

const referencia = (id: string) => id.slice(0, 8).toUpperCase();
const editable = (estado: Estado) => ESTADOS_ABIERTOS.includes(estado);

function direccion(pedido: PedidoDelPanel) {
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

function fechaYHora(valor: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  }).format(new Date(valor));
}

/** Por qué no se puede pasar todavía a una etapa, o null si se puede. */
function bloqueo(pedido: PedidoDelPanel, a: Estado): string | null {
  const faltan = (f: (x: Articulo) => boolean) => pedido.articulos.filter(f).length;
  if ((a === 'confirmed' || a === 'preparing') && pedido.articulos.length === 0) return 'No tiene productos registrados';
  if (a === 'confirmed') {
    const n = faltan((x) => x.availability !== 'disponible');
    if (n) return `Faltan ${n} por confirmar como disponibles`;
  }
  if (a === 'preparing') {
    const n = faltan((x) => !x.purchased_at);
    if (n) return `Faltan ${n} por marcar como comprados`;
  }
  return null;
}

function describirEvento(e: Evento): string {
  const d = e.data ?? {};
  const nombres = Array.isArray(d.articulos)
    ? (d.articulos as { nombre: string; cantidad: number }[]).map((a) => `${a.cantidad}× ${a.nombre}`).join(', ')
    : '';
  switch (e.kind) {
    case 'estado':
      return e.from_status
        ? `${etiquetaDeEstado(e.from_status)} → ${etiquetaDeEstado(e.to_status)}${d.guia ? ` · guía ${d.guia}` : ''}`
        : `Registrado como «${etiquetaDeEstado(e.to_status)}»`;
    case 'disponibilidad':
      return `${DISPONIBILIDAD[d.disponibilidad as Disponibilidad] ?? 'Disponibilidad'}: ${nombres}`;
    case 'compra':
      return d.comprado
        ? `Comprado a MEPIEL${d.folio ? ` (folio ${d.folio})` : ''}: ${nombres}`
        : `Se deshizo la compra: ${nombres}`;
    case 'guia':
      return `Guía ${d.guia}${d.anterior ? ` (antes ${d.anterior})` : ''}`;
    case 'correo': {
      const plantilla = String(d.plantilla ?? '');
      const nombre =
        plantilla === 'confirmacion' ? 'confirmación' : plantilla === 'guia' ? 'número de guía' : etiquetaDeEstado(plantilla);
      return d.enviado ? `Correo al cliente: ${nombre}` : `Correo al cliente NO enviado (${nombre}): ${d.motivo ?? ''}`;
    }
    default:
      return e.note ?? '';
  }
}

const ACTOR: Record<string, string> = { tienda: 'Panel', stripe: 'Stripe', sistema: 'Sistema' };

async function enviar(url: string, method: 'PATCH' | 'PUT', body: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'No se pudo guardar el cambio');
  return data;
}

export function PedidosClient({
  pedidos,
  migracionPendiente,
  vista,
  desde,
  hasta,
  revision,
}: {
  pedidos: PedidoDelPanel[];
  migracionPendiente: boolean;
  vista: Vista;
  desde: string;
  hasta: string;
  revision: { productos: ProductoPorRevisar[]; faltaMigracion002: boolean } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Una sola acción a la vez en toda la página: evita dobles clics y que dos
  // cambios del mismo pedido se crucen.
  const [ocupado, setOcupado] = useState<string | null>(null);
  // El estado tarda un render en verse; la referencia frena el segundo clic al instante.
  const enCurso = useRef(false);

  const irA = (cambios: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(cambios)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  /** Corre un cambio, avisa el resultado y recarga los datos del servidor. */
  const ejecutar = async (clave: string, accion: () => Promise<string>) => {
    if (enCurso.current) return false;
    enCurso.current = true;
    setOcupado(clave);
    try {
      toast.success(await accion());
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error de conexión. Intenta de nuevo.');
      return false;
    } finally {
      enCurso.current = false;
      router.refresh();
      setOcupado(null);
    }
  };

  const marcarArticulos = (clave: string, articulos: number[], cambio: { disponibilidad?: Disponibilidad; comprado?: boolean; folio?: string }) =>
    ejecutar(clave, async () => {
      await enviar('/api/admin/pedidos/articulos', 'PATCH', { articulos, ...cambio });
      if (cambio.comprado === true) return 'Compra a MEPIEL registrada.';
      if (cambio.comprado === false) return 'Compra deshecha.';
      return `Marcado como ${DISPONIBILIDAD[cambio.disponibilidad!].toLowerCase()}.`;
    });

  const cambiarEtapa = (pedido: PedidoDelPanel, a: Estado, datos: { nota?: string; guia?: string } = {}) =>
    ejecutar(`etapa-${pedido.id}`, async () => {
      const r = await enviar(`/api/admin/pedidos/${pedido.id}`, 'PATCH', { de: pedido.status, a, ...datos });
      return `Pedido ${referencia(pedido.id)}: ${ESTADOS[a].etiqueta.toLowerCase()}.${r.avisoEnviado ? ' Se avisó al cliente por correo.' : ''}`;
    });

  const guardarGuia = (pedido: PedidoDelPanel, guia: string) =>
    ejecutar(`guia-${pedido.id}`, async () => {
      const r = await enviar(`/api/admin/pedidos/${pedido.id}`, 'PUT', { guia });
      return `Guía guardada.${r.avisoEnviado ? ' Se le mandó al cliente.' : ''}`;
    });

  const acciones = { ocupado, marcarArticulos, cambiarEtapa, guardarGuia, soloLectura: migracionPendiente };

  return (
    <>
      {migracionPendiente && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Falta aplicar en Supabase <strong>002-productos-proveedor.sql</strong> y{' '}
            <strong>003-pedidos-mepiel.sql</strong>. Mientras tanto los pedidos se pueden consultar, pero no cambiar:
            sin el historial, ningún cambio quedaría registrado.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200">
        {(
          [
            ['pedidos', 'Pedidos'],
            ['mepiel', 'Compra a MEPIEL'],
            ['revisar', 'Productos por revisar'],
          ] as [Vista, string][]
        ).map(([clave, etiqueta]) => (
          <button
            key={clave}
            onClick={() => irA({ vista: clave === 'pedidos' ? '' : clave })}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              vista === clave ? 'border-ink text-ink' : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {vista !== 'revisar' && <FiltroDeFechas desde={desde} hasta={hasta} onCambiar={irA} />}

      {vista === 'pedidos' && <ListaDePedidos pedidos={pedidos} acciones={acciones} />}
      {vista === 'mepiel' && <CompraMepiel pedidos={pedidos} acciones={acciones} />}
      {vista === 'revisar' && revision && <Revision {...revision} />}
    </>
  );
}

type Acciones = {
  ocupado: string | null;
  soloLectura: boolean;
  marcarArticulos: (clave: string, articulos: number[], cambio: { disponibilidad?: Disponibilidad; comprado?: boolean; folio?: string }) => Promise<boolean>;
  cambiarEtapa: (pedido: PedidoDelPanel, a: Estado, datos?: { nota?: string; guia?: string }) => Promise<boolean>;
  guardarGuia: (pedido: PedidoDelPanel, guia: string) => Promise<boolean>;
};

function FiltroDeFechas({ desde, hasta, onCambiar }: { desde: string; hasta: string; onCambiar: (c: Record<string, string>) => void }) {
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);
  const campo =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400';
  return (
    <form
      className="mb-6 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onCambiar({ desde: d, hasta: h });
      }}
    >
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Desde
        <input type="date" value={d} max={h || undefined} onChange={(e) => setD(e.target.value)} className={`mt-1 block ${campo}`} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Hasta
        <input type="date" value={h} min={d || undefined} onChange={(e) => setH(e.target.value)} className={`mt-1 block ${campo}`} />
      </label>
      <button type="submit" className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90">
        Filtrar
      </button>
      {(desde || hasta) && (
        <button
          type="button"
          onClick={() => {
            setD('');
            setH('');
            onCambiar({ desde: '', hasta: '' });
          }}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
        >
          Quitar fechas
        </button>
      )}
    </form>
  );
}

type FiltroDeEstado = 'abiertos' | 'todos' | Estado;

function ListaDePedidos({ pedidos, acciones }: { pedidos: PedidoDelPanel[]; acciones: Acciones }) {
  const [filtro, setFiltro] = useState<FiltroDeEstado>('abiertos');

  const conteos = useMemo(() => {
    const c: Record<string, number> = { todos: pedidos.length, abiertos: 0 };
    for (const p of pedidos) {
      c[p.status] = (c[p.status] ?? 0) + 1;
      if (p.status === 'pending_payment' || ESTADOS_ABIERTOS.includes(p.status)) c.abiertos++;
    }
    return c;
  }, [pedidos]);

  const visibles = pedidos.filter((p) =>
    filtro === 'todos' ? true : filtro === 'abiertos' ? p.status === 'pending_payment' || ESTADOS_ABIERTOS.includes(p.status) : p.status === filtro
  );

  const opciones: { clave: FiltroDeEstado; etiqueta: string }[] = [
    { clave: 'abiertos', etiqueta: 'Por atender' },
    ...LISTA_DE_ESTADOS.map((e) => ({ clave: e as FiltroDeEstado, etiqueta: ESTADOS[e].etiqueta })),
    { clave: 'todos', etiqueta: 'Todos' },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {opciones.map((f) => (
          <button
            key={f.clave}
            onClick={() => setFiltro(f.clave)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === f.clave ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.etiqueta}
            <span className={filtro === f.clave ? 'ml-2 text-white/60' : 'ml-2 text-slate-400'}>{conteos[f.clave] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visibles.map((pedido) => (
          <TarjetaDePedido key={pedido.id} pedido={pedido} acciones={acciones} />
        ))}
        {visibles.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
            No hay pedidos con este filtro.
          </p>
        )}
      </div>
    </>
  );
}

function TarjetaDePedido({ pedido, acciones }: { pedido: PedidoDelPanel; acciones: Acciones }) {
  const { ocupado, soloLectura } = acciones;
  // Formulario abierto: una etapa que pide datos, o la captura de guía.
  const [formulario, setFormulario] = useState<Estado | 'guia' | null>(null);
  const [nota, setNota] = useState('');
  const [guia, setGuia] = useState('');
  const [verHistorial, setVerHistorial] = useState(false);

  const cerrar = () => {
    setFormulario(null);
    setNota('');
    setGuia('');
  };
  const destinos = TRANSICIONES[pedido.status];
  const enCurso = ocupado !== null;
  const articulosEditables = editable(pedido.status) && !soloLectura;

  const abrir = (a: Estado | 'guia') => {
    setFormulario(a);
    setGuia(a === 'shipped' || a === 'guia' ? pedido.tracking ?? '' : '');
    setNota('');
  };

  const confirmar = async () => {
    if (!formulario) return;
    const ok =
      formulario === 'guia'
        ? await acciones.guardarGuia(pedido, guia)
        : await acciones.cambiarEtapa(pedido, formulario, { nota, guia: formulario === 'shipped' ? guia : undefined });
    if (ok) cerrar();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            {pedido.shipping_name || 'Sin nombre'}
            <span className="ml-2 font-accent text-xs font-semibold uppercase tracking-wider text-slate-400">
              {referencia(pedido.id)}
            </span>
          </p>
          <p className="text-sm text-slate-500">
            {formatDate(pedido.created_at)} · {pedido.customer_email || 'sin correo'}
            {pedido.customer_phone ? ` · ${pedido.customer_phone}` : ''}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${COLOR_DE_ESTADO[pedido.status]}`}>
          {ESTADOS[pedido.status].etiqueta}
        </span>
      </div>

      <ul className="mb-4 divide-y divide-slate-100 text-sm text-slate-600">
        {pedido.articulos.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-ink">
                {a.quantity}× {a.name}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono">{a.supplier_code ?? 'Sin código MEPIEL'}</span>
                {a.presentation && <span>· {a.presentation}</span>}
                <span className={`rounded px-1.5 py-0.5 font-semibold ${COLOR_DE_DISPONIBILIDAD[a.availability]}`}>
                  {DISPONIBILIDAD[a.availability]}
                </span>
                {a.purchased_at && (
                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-semibold text-white">
                    Comprado{a.supplier_order_ref ? ` · ${a.supplier_order_ref}` : ''}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {articulosEditables && (
                <BotonesDeArticulo
                  clave={`art-${a.id}`}
                  articulos={[a]}
                  acciones={acciones}
                />
              )}
              <span className="whitespace-nowrap">{formatPrice(a.amount_total)}</span>
            </div>
          </li>
        ))}
        {pedido.envio > 0 && (
          <li className="flex justify-between gap-4 py-2">
            <span>Envío</span>
            <span className="whitespace-nowrap">{formatPrice(pedido.envio)}</span>
          </li>
        )}
        <li className="flex justify-between gap-4 pt-2 font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(pedido.amount_total)}</span>
        </li>
      </ul>

      {pedido.tracking && (
        <p className="mb-2 text-sm text-slate-600">
          <span className="font-semibold text-ink">Guía: </span>
          {pedido.tracking_url ? (
            <a href={pedido.tracking_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-700 underline">
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
        {pedido.shipping_address?.referencias ? ` — ${pedido.shipping_address.referencias}` : ''}
      </p>

      {!soloLectura && formulario && (
        <div className="mb-4 space-y-2 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-ink">
            {formulario === 'guia' ? 'Número de guía' : `${ACCION_HACIA[formulario]}`}
          </p>
          {(formulario === 'shipped' || formulario === 'guia') && (
            <input
              type="text"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              maxLength={100}
              placeholder="Número de guía"
              autoFocus
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          )}
          {formulario !== 'guia' && (
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              maxLength={500}
              placeholder={
                formulario === 'shipped'
                  ? 'Si no hay guía, cómo se entrega (p. ej. en persona)'
                  : formulario === 'refunded'
                    ? 'Motivo del reembolso (queda en el historial)'
                    : 'Motivo de la cancelación (queda en el historial)'
              }
              autoFocus={formulario !== 'shipped'}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          )}
          {formulario === 'refunded' && (
            <p className="text-xs text-slate-500">
              Esto sólo registra el reembolso. El dinero se devuelve desde Stripe; si lo haces ahí, el pedido se marca solo.
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={confirmar}
              disabled={enCurso}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-50"
            >
              {ocupado === `etapa-${pedido.id}` || ocupado === `guia-${pedido.id}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : formulario === 'shipped' ? (
                <Truck className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Guardar
            </button>
            <button onClick={cerrar} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
              Volver
            </button>
          </div>
        </div>
      )}

      {!soloLectura && !formulario && (
        <div className="flex flex-wrap items-center gap-2">
          {destinos.map((a, i) => {
            const motivo = bloqueo(pedido, a);
            const principal = i === 0 && a !== 'cancelled' && a !== 'refunded';
            return (
              <button
                key={a}
                title={motivo ?? undefined}
                onClick={() => (PIDEN_DATOS.includes(a) ? abrir(a) : acciones.cambiarEtapa(pedido, a))}
                disabled={enCurso || Boolean(motivo)}
                className={
                  principal
                    ? 'inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-40'
                    : 'rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40'
                }
              >
                {ocupado === `etapa-${pedido.id}` && principal && <Loader2 className="h-4 w-4 animate-spin" />}
                {ACCION_HACIA[a]}
              </button>
            );
          })}
          {['preparing', 'shipped', 'delivered'].includes(pedido.status) && (
            <button
              onClick={() => abrir('guia')}
              disabled={enCurso}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              {pedido.tracking ? 'Corregir guía' : 'Capturar guía'}
            </button>
          )}
          {destinos[0] && bloqueo(pedido, destinos[0]) && (
            <span className="text-xs text-slate-500">{bloqueo(pedido, destinos[0])}</span>
          )}
        </div>
      )}

      {pedido.historial.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => setVerHistorial((v) => !v)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-ink"
            aria-expanded={verHistorial}
          >
            <History className="h-4 w-4" />
            Historial ({pedido.historial.length})
            <ChevronDown className={`h-4 w-4 transition-transform ${verHistorial ? 'rotate-180' : ''}`} />
          </button>
          {verHistorial && (
            <ol className="mt-3 space-y-2 text-sm">
              {pedido.historial.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-28 shrink-0 text-xs text-slate-400">{fechaYHora(e.created_at)}</span>
                  <span className="text-slate-600">
                    {describirEvento(e)}
                    {e.kind !== 'pago' && e.kind !== 'nota' && e.note ? ` — ${e.note}` : ''}
                    <span className="ml-2 text-xs text-slate-400">{ACTOR[e.actor] ?? e.actor}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Disponible / No disponible / Comprado para uno o varios renglones. El folio
 * de la compra es opcional y se pide en el mismo lugar.
 */
function BotonesDeArticulo({ clave, articulos, acciones }: { clave: string; articulos: Articulo[]; acciones: Acciones }) {
  const [pidiendoFolio, setPidiendoFolio] = useState(false);
  const [folio, setFolio] = useState('');
  const ids = articulos.map((a) => a.id);
  const todos = (f: (a: Articulo) => boolean) => articulos.every(f);
  const algunoComprado = articulos.some((a) => a.purchased_at);
  const enCurso = acciones.ocupado !== null;
  const boton = 'rounded-md px-2 py-1 text-xs font-semibold ring-1 transition-colors disabled:opacity-40';

  if (pidiendoFolio) {
    return (
      <span className="flex items-center gap-1">
        <input
          type="text"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          maxLength={60}
          placeholder="Folio MEPIEL (opcional)"
          autoFocus
          className="w-40 rounded-md border border-slate-200 px-2 py-1 text-xs text-ink focus:border-primary-400 focus:outline-none"
        />
        <button
          disabled={enCurso}
          onClick={async () => {
            if (await acciones.marcarArticulos(clave, ids, { comprado: true, folio })) setPidiendoFolio(false);
          }}
          className={`${boton} bg-emerald-600 text-white ring-emerald-600`}
        >
          {acciones.ocupado === clave ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirmar compra'}
        </button>
        <button onClick={() => setPidiendoFolio(false)} className="p-1 text-slate-400 hover:text-ink" aria-label="Cancelar">
          <X className="h-4 w-4" />
        </button>
      </span>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-1">
      <button
        disabled={enCurso || algunoComprado || todos((a) => a.availability === 'disponible')}
        onClick={() => acciones.marcarArticulos(clave, ids, { disponibilidad: 'disponible' })}
        className={`${boton} text-emerald-700 ring-emerald-200 hover:bg-emerald-50`}
      >
        Disponible
      </button>
      <button
        disabled={enCurso || algunoComprado || todos((a) => a.availability === 'no_disponible')}
        onClick={() => acciones.marcarArticulos(clave, ids, { disponibilidad: 'no_disponible' })}
        className={`${boton} text-rose-700 ring-rose-200 hover:bg-rose-50`}
      >
        No disponible
      </button>
      {todos((a) => Boolean(a.purchased_at)) ? (
        <button
          disabled={enCurso}
          onClick={() => acciones.marcarArticulos(clave, ids, { comprado: false })}
          className={`${boton} text-slate-600 ring-slate-200 hover:bg-slate-50`}
        >
          Deshacer compra
        </button>
      ) : (
        <button
          disabled={enCurso || !todos((a) => a.availability === 'disponible')}
          title={todos((a) => a.availability === 'disponible') ? undefined : 'Primero márcalo disponible'}
          onClick={() => {
            setFolio('');
            setPidiendoFolio(true);
          }}
          className={`${boton} text-ink ring-slate-300 hover:bg-slate-50`}
        >
          Comprado
        </button>
      )}
    </span>
  );
}

interface Grupo {
  clave: string;
  codigo: string | null;
  nombre: string;
  presentacion: string | null;
  cantidad: number;
  costo: number | null;
  articulos: Articulo[];
  pedidos: PedidoDelPanel[];
}

/**
 * Lo que hay que pedirle a MEPIEL: los productos de los pedidos recibidos o en
 * espera de MEPIEL que todavía no se compran, juntos por código para pedir cada
 * uno una sola vez.
 */
function CompraMepiel({ pedidos, acciones }: { pedidos: PedidoDelPanel[]; acciones: Acciones }) {
  const [estados, setEstados] = useState<Estado[]>(ESTADOS_POR_COMPRAR);
  const enCompra = pedidos.filter((p) => estados.includes(p.status));

  const grupos = useMemo(() => {
    const porClave = new Map<string, Grupo>();
    for (const pedido of enCompra) {
      for (const a of pedido.articulos) {
        if (a.purchased_at) continue;
        const clave = a.supplier_code ?? (a.product_id ? `producto:${a.product_id}` : `nombre:${a.name}`);
        const g = porClave.get(clave) ?? {
          clave,
          codigo: a.supplier_code,
          nombre: a.name,
          presentacion: a.presentation,
          cantidad: 0,
          costo: a.costo,
          articulos: [],
          pedidos: [],
        };
        g.cantidad += a.quantity;
        g.articulos.push(a);
        if (!g.pedidos.includes(pedido)) g.pedidos.push(pedido);
        porClave.set(clave, g);
      }
    }
    // Primero lo que falta preguntar, luego lo disponible por comprar y al final lo agotado.
    const orden = (g: Grupo) =>
      g.articulos.some((a) => a.availability === 'sin_revisar') ? 0 : g.articulos.every((a) => a.availability === 'disponible') ? 1 : 2;
    return [...porClave.values()].sort((a, b) => orden(a) - orden(b) || a.nombre.localeCompare(b.nombre, 'es'));
  }, [enCompra]);

  const piezas = grupos.reduce((s, g) => s + g.cantidad, 0);
  const sinCosto = grupos.filter((g) => g.costo === null).length;
  const costoEstimado = grupos.reduce((s, g) => s + (g.costo ?? 0) * g.cantidad, 0);
  const recibidos = enCompra.filter((p) => p.status === 'received');

  const copiar = async () => {
    const texto = grupos
      .filter((g) => !g.articulos.some((a) => a.availability === 'no_disponible'))
      .map((g) => [g.codigo ?? 'SIN CÓDIGO', g.cantidad, g.nombre, g.presentacion ?? ''].join('\t'))
      .join('\n');
    try {
      await navigator.clipboard.writeText(`Código\tCantidad\tProducto\tPresentación\n${texto}`);
      toast.success('Lista copiada. Pégala en el pedido o correo a MEPIEL.');
    } catch {
      toast.error('No se pudo copiar. Selecciona la tabla y cópiala a mano.');
    }
  };

  const pedirTodos = async () => {
    for (const p of recibidos) {
      // Uno por uno: cada pedido deja su propio renglón de historial.
      if (!(await acciones.cambiarEtapa(p, 'awaiting_supplier'))) break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ESTADOS_POR_COMPRAR.map((e) => (
          <button
            key={e}
            onClick={() => setEstados((actual) => (actual.includes(e) ? actual.filter((x) => x !== e) : [...actual, e]))}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              estados.includes(e) ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {ESTADOS[e].etiqueta}
            <span className={estados.includes(e) ? 'ml-2 text-white/60' : 'ml-2 text-slate-400'}>
              {pedidos.filter((p) => p.status === e).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
        <p className="text-slate-600">
          <strong className="text-ink">{grupos.length}</strong> {grupos.length === 1 ? 'producto' : 'productos'} ·{' '}
          <strong className="text-ink">{piezas}</strong> {piezas === 1 ? 'pieza' : 'piezas'} · {enCompra.length}{' '}
          {enCompra.length === 1 ? 'pedido' : 'pedidos'}
          {grupos.length > 0 && (
            <>
              {' '}
              · costo estimado <strong className="text-ink">{formatPrice(costoEstimado)}</strong>
              {sinCosto > 0 && <span className="text-slate-400"> ({sinCosto} sin costo registrado)</span>}
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {!acciones.soloLectura && recibidos.length > 0 && (
            <button
              onClick={pedirTodos}
              disabled={acciones.ocupado !== null}
              className="rounded-lg px-3 py-2 font-semibold text-ink ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40"
            >
              Pasar {recibidos.length} {recibidos.length === 1 ? 'pedido' : 'pedidos'} a «{ESTADOS.awaiting_supplier.etiqueta}»
            </button>
          )}
          {grupos.length > 0 && (
            <button onClick={copiar} className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 font-semibold text-white hover:bg-ink/90">
              <ClipboardCopy className="h-4 w-4" />
              Copiar lista para MEPIEL
            </button>
          )}
        </div>
      </div>

      {grupos.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
          No hay productos por pedir a MEPIEL con estos filtros.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Código MEPIEL</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 text-right font-semibold">Cant.</th>
                <th className="px-4 py-3 font-semibold">Pedidos</th>
                <th className="px-4 py-3 font-semibold">Disponibilidad</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grupos.map((g) => {
                const disponibilidades = [...new Set(g.articulos.map((a) => a.availability))];
                const editables = g.articulos.filter((a) => a.id > 0);
                return (
                  <tr key={g.clave} className="align-top">
                    <td className="px-4 py-3 font-mono text-xs text-ink">{g.codigo ?? <span className="text-rose-700">Sin código</span>}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{g.nombre}</p>
                      <p className="text-xs text-slate-500">
                        {g.presentacion ?? 'Presentación no indicada'}
                        {g.costo !== null && ` · costo ${formatPrice(g.costo)} c/u`}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{g.cantidad}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {g.pedidos.map((p) => (
                          <span
                            key={p.id}
                            title={`${p.shipping_name ?? ''} · ${etiquetaDeEstado(p.status)}`}
                            className={`rounded px-1.5 py-0.5 font-mono text-xs ring-1 ${COLOR_DE_ESTADO[p.status]}`}
                          >
                            {referencia(p.id)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {disponibilidades.length === 1 ? (
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${COLOR_DE_DISPONIBILIDAD[disponibilidades[0]]}`}>
                          {DISPONIBILIDAD[disponibilidades[0]]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Distinta en cada pedido</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!acciones.soloLectura && editables.length > 0 && (
                        <BotonesDeArticulo clave={`grupo-${g.clave}`} articulos={editables} acciones={acciones} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Marcar un producto aquí lo marca en todos los pedidos de la fila y deja un renglón en el historial de cada uno. Lo que
        contesta MEPIEL también queda guardado en el producto. Cuando todos los productos de un pedido estén disponibles,
        confírmalo desde la pestaña Pedidos: ahí se le avisa al cliente.
      </p>
    </div>
  );
}

function Revision({ productos, faltaMigracion002 }: { productos: ProductoPorRevisar[]; faltaMigracion002: boolean }) {
  const [motivo, setMotivo] = useState<ProductoPorRevisar['motivos'][number] | 'todos'>('todos');
  const conteo = (m: ProductoPorRevisar['motivos'][number]) => productos.filter((p) => p.motivos.includes(m)).length;
  const visibles = productos.filter((p) => motivo === 'todos' || p.motivos.includes(motivo));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Productos que no deberían venderse como disponibles sin revisarlos. Los que no tienen precio de venta ya no se pueden
        pagar; los demás se corrigen en el panel de productos (precio, existencia) o confirmando con MEPIEL.
      </p>
      {faltaMigracion002 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Sin la migración 002 no hay códigos de MEPIEL guardados, así que todavía no se puede revisar qué productos no tienen
          código ni cuáles reportó agotados MEPIEL.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {(['todos', ...(Object.keys(MOTIVOS) as ProductoPorRevisar['motivos'][number][])] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMotivo(m)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              motivo === m ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {m === 'todos' ? 'Todos' : MOTIVOS[m]}
            <span className={motivo === m ? 'ml-2 text-white/60' : 'ml-2 text-slate-400'}>
              {m === 'todos' ? productos.length : conteo(m)}
            </span>
          </button>
        ))}
      </div>
      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">Nada por revisar aquí.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white text-sm">
          {visibles.slice(0, 300).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-ink">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {p.brand ?? 'Sin marca'} · {p.price_with_iva ? formatPrice(p.price_with_iva) : 'sin precio'} ·{' '}
                  {p.in_stock ? 'a la venta' : 'agotado en la tienda'}
                  {p.supplier_code && <span className="font-mono"> · {p.supplier_code}</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.motivos.map((m) => (
                  <span key={m} className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-900">
                    {MOTIVOS[m]}
                  </span>
                ))}
              </div>
            </li>
          ))}
          {visibles.length > 300 && (
            <li className="px-4 py-3 text-center text-xs text-slate-500">Se muestran 300 de {visibles.length}.</li>
          )}
        </ul>
      )}
    </div>
  );
}
