'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { RFC, REGIMENES_FISCALES, USOS_CFDI } from '@/lib/facturas';

const VACIO = {
  referencia: '',
  correo: '',
  rfc: '',
  razon_social: '',
  regimen_fiscal: '',
  codigo_postal: '',
  uso_cfdi: 'G03',
  website: '',
};

const campo =
  '!h-12 !rounded-sw !border-sw-border !bg-sw-white !px-4 !text-sw-ink placeholder:!text-sw-muted focus:!border-sw-pink-deep focus:!ring-sw-pink-deep/25';
const etiqueta = 'mb-2 block text-sw-small font-semibold text-sw-ink';

export function FormularioDeFactura() {
  const [datos, setDatos] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);
  // Frena el segundo clic antes de que el botón alcance a deshabilitarse.
  const enCurso = useRef(false);

  const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: name === 'rfc' ? value.toUpperCase() : value }));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enCurso.current) return;
    if (!RFC.test(datos.rfc.trim())) {
      toast.error('Revisa el RFC: 12 caracteres si es empresa, 13 si es persona física.');
      return;
    }
    enCurso.current = true;
    setEnviando(true);
    try {
      const res = await fetch('/api/factura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const r = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(r.error || 'No se pudo enviar la solicitud');
        return;
      }
      setListo(true);
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      enCurso.current = false;
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <div role="status">
        <h2 className="font-display text-2xl font-semibold text-sw-ink">Recibimos tu solicitud</h2>
        <p className="mt-4 text-sw-body text-sw-text">
          Te mandamos un correo con los datos que nos diste. La factura te llega al mismo correo en cuanto la emitamos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-sw-ink">Datos de la factura</h2>
      {/* Campo trampa para robots: no se ve ni se puede enfocar. */}
      <input
        type="text"
        name="website"
        value={datos.website}
        onChange={cambiar}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="factura-referencia" className={etiqueta}>
            Referencia del pedido
          </label>
          <input id="factura-referencia" name="referencia" value={datos.referencia} onChange={cambiar} required
            maxLength={8} pattern="[0-9a-fA-F]{8}" title="Los 8 caracteres que aparecen como «Pedido» en tu correo"
            placeholder="Ej. 3F9A12BC" autoComplete="off" className={`${campo} uppercase`} />
        </div>
        <div>
          <label htmlFor="factura-correo" className={etiqueta}>
            Correo con el que compraste
          </label>
          <input id="factura-correo" type="email" name="correo" value={datos.correo} onChange={cambiar} required
            maxLength={200} autoComplete="email" placeholder="tu@email.com" className={campo} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="factura-rfc" className={etiqueta}>
            RFC
          </label>
          <input id="factura-rfc" name="rfc" value={datos.rfc} onChange={cambiar} required minLength={12} maxLength={13}
            autoComplete="off" placeholder="XAXX010101000" className={`${campo} uppercase`} />
        </div>
        <div>
          <label htmlFor="factura-cp" className={etiqueta}>
            Código postal fiscal
          </label>
          <input id="factura-cp" name="codigo_postal" value={datos.codigo_postal} onChange={cambiar} required
            inputMode="numeric" pattern="\d{5}" maxLength={5} title="5 dígitos" placeholder="06700" className={campo} />
        </div>
      </div>

      <div>
        <label htmlFor="factura-razon" className={etiqueta}>
          Nombre o razón social
        </label>
        <input id="factura-razon" name="razon_social" value={datos.razon_social} onChange={cambiar} required
          maxLength={300} autoComplete="organization" placeholder="Como aparece en tu Constancia de Situación Fiscal"
          className={campo} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="factura-regimen" className={etiqueta}>
            Régimen fiscal
          </label>
          <select id="factura-regimen" name="regimen_fiscal" value={datos.regimen_fiscal} onChange={cambiar} required
            className={campo}>
            <option value="" disabled>
              Elige tu régimen
            </option>
            {REGIMENES_FISCALES.map((r) => (
              <option key={r.clave} value={r.clave}>
                {r.clave} · {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="factura-uso" className={etiqueta}>
            Uso del CFDI
          </label>
          <select id="factura-uso" name="uso_cfdi" value={datos.uso_cfdi} onChange={cambiar} required className={campo}>
            {USOS_CFDI.map((u) => (
              <option key={u.clave} value={u.clave}>
                {u.clave} · {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={enviando} className="sw-btn sw-btn-primary h-12 w-full sm:w-auto sm:px-10">
        {enviando ? 'Enviando...' : 'Pedir factura'}
      </button>
      <p className="text-sw-small text-sw-muted">
        Usamos estos datos sólo para emitir tu factura, como dice nuestro aviso de privacidad.
      </p>
    </form>
  );
}
