'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Loader2, Send } from 'lucide-react';
import { formatDateMx, formatPrice } from '@/utils';
import { nombreDeRegimen, nombreDeUso } from '@/lib/facturas';

export interface Solicitud {
  id: string;
  order_id: string;
  created_at: string;
  email: string;
  rfc: string;
  razon_social: string;
  regimen_fiscal: string;
  codigo_postal: string;
  uso_cfdi: string;
  status: 'pendiente' | 'enviada' | 'rechazada';
  resolved_at: string | null;
  note: string | null;
  pedido: { total: number; fecha: string; nombre: string | null } | null;
}

const COLOR = {
  pendiente: 'bg-amber-50 text-amber-800 ring-amber-200',
  enviada: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  rechazada: 'bg-slate-100 text-slate-600 ring-slate-200',
} as const;
const ETIQUETA = { pendiente: 'Por emitir', enviada: 'Enviada', rechazada: 'Rechazada' } as const;

export function FacturasClient({ solicitudes, migracionPendiente }: { solicitudes: Solicitud[]; migracionPendiente: boolean }) {
  const [filtro, setFiltro] = useState<'pendiente' | 'todas'>('pendiente');
  const visibles = solicitudes.filter((s) => filtro === 'todas' || s.status === 'pendiente');

  if (migracionPendiente) {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Falta aplicar en Supabase <strong>004-facturas.sql</strong>. Mientras tanto el formulario de facturación pide a
          los clientes escribir a contacto@skinworld.shop.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex gap-2">
        {(['pendiente', 'todas'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === f ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'pendiente' ? 'Por emitir' : 'Todas'}
            <span className={filtro === f ? 'ml-2 text-white/60' : 'ml-2 text-slate-400'}>
              {f === 'pendiente' ? solicitudes.filter((s) => s.status === 'pendiente').length : solicitudes.length}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {visibles.map((s) => (
          <TarjetaDeSolicitud key={s.id} solicitud={s} />
        ))}
        {visibles.length === 0 && (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
            No hay facturas por emitir.
          </p>
        )}
      </div>
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="text-slate-500">{etiqueta}</dt>
      <dd className="flex items-center gap-2 text-right text-ink">
        <span>{valor}</span>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(valor).then(
              () => toast.success(`${etiqueta} copiado`),
              () => toast.error('No se pudo copiar')
            )
          }
          className="text-slate-400 hover:text-ink"
          aria-label={`Copiar ${etiqueta}`}
        >
          <Copy className="h-4 w-4" />
        </button>
      </dd>
    </div>
  );
}

function TarjetaDeSolicitud({ solicitud: s }: { solicitud: Solicitud }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const enCurso = useRef(false);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const pdf = useRef<HTMLInputElement>(null);
  const xml = useRef<HTMLInputElement>(null);

  const ejecutar = async (accion: () => Promise<Response>, exito: string) => {
    if (enCurso.current) return;
    enCurso.current = true;
    setOcupado(true);
    try {
      const res = await accion();
      const r = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(r.error ?? 'No se pudo completar');
        return;
      }
      toast.success(exito);
      router.refresh();
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      enCurso.current = false;
      setOcupado(false);
    }
  };

  const enviar = () => {
    const archivoPdf = pdf.current?.files?.[0];
    const archivoXml = xml.current?.files?.[0];
    if (!archivoPdf || !archivoXml) {
      toast.error('Elige el PDF y el XML de la factura');
      return;
    }
    const datos = new FormData();
    datos.append('pdf', archivoPdf);
    datos.append('xml', archivoXml);
    ejecutar(() => fetch(`/api/admin/facturas/${s.id}`, { method: 'POST', body: datos }), 'Factura enviada al cliente.');
  };

  const rechazar = () =>
    ejecutar(
      () =>
        fetch(`/api/admin/facturas/${s.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo }),
        }),
      'Solicitud rechazada. Se le explicó al cliente por correo.'
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">
            {s.razon_social}
            <span className="ml-2 font-accent text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pedido {s.order_id.slice(0, 8).toUpperCase()}
            </span>
          </p>
          <p className="text-sm text-slate-500">
            Pedida el {formatDateMx(s.created_at)} · {s.email}
            {s.pedido && ` · compra del ${formatDateMx(s.pedido.fecha)} por ${formatPrice(s.pedido.total)}`}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${COLOR[s.status]}`}>{ETIQUETA[s.status]}</span>
      </div>

      <dl className="mb-4 divide-y divide-slate-100 text-sm">
        <Dato etiqueta="RFC" valor={s.rfc} />
        <Dato etiqueta="Razón social" valor={s.razon_social} />
        <Dato etiqueta="Régimen fiscal" valor={`${s.regimen_fiscal} · ${nombreDeRegimen(s.regimen_fiscal)}`} />
        <Dato etiqueta="Código postal" valor={s.codigo_postal} />
        <Dato etiqueta="Uso del CFDI" valor={`${s.uso_cfdi} · ${nombreDeUso(s.uso_cfdi)}`} />
      </dl>

      {s.status === 'rechazada' && s.note && <p className="text-sm text-slate-600">Motivo del rechazo: {s.note}</p>}

      {s.status === 'pendiente' &&
        (rechazando ? (
          <div className="space-y-2 rounded-xl bg-slate-50 p-4">
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={500}
              autoFocus
              placeholder="Motivo (se le manda al cliente), p. ej. el RFC no coincide con la razón social"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-ink focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <div className="flex gap-2">
              <button
                onClick={rechazar}
                disabled={ocupado || !motivo.trim()}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-40"
              >
                Rechazar y avisar
              </button>
              <button onClick={() => setRechazando(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PDF
              <input ref={pdf} type="file" accept="application/pdf,.pdf" className="mt-1 block text-sm text-slate-600" />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              XML
              <input ref={xml} type="file" accept=".xml,text/xml,application/xml" className="mt-1 block text-sm text-slate-600" />
            </label>
            <button
              onClick={enviar}
              disabled={ocupado}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-40"
            >
              {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar al cliente
            </button>
            <button
              onClick={() => setRechazando(true)}
              disabled={ocupado}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              Rechazar
            </button>
          </div>
        ))}
    </div>
  );
}
