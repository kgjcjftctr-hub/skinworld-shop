'use client';

import { useShippingAddress, type ShippingAddress } from '@/store/shipping-address';
import { Check, Loader2, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const ESTADOS_MEXICO = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];

interface DatosCodigoPostal {
  codigoPostal: string;
  estado: string;
  municipio: string;
  colonias: string[];
  calleEjemplo: string | null;
}

type Busqueda = 'inactiva' | 'buscando' | 'encontrado' | 'sin-resultado';

const OTRA_COLONIA = '__otra__';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400';
const inputAutoClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-600';

export function ShippingAddressForm() {
  const address = useShippingAddress((state) => state.address);
  const updateField = useShippingAddress((state) => state.updateField);

  const [datos, setDatos] = useState<DatosCodigoPostal | null>(null);
  const [busqueda, setBusqueda] = useState<Busqueda>('inactiva');
  const [coloniaLibre, setColoniaLibre] = useState(false);
  const [editandoZona, setEditandoZona] = useState(false);
  const ultimaBusqueda = useRef('');
  const primeraCarga = useRef(true);

  const codigoPostal = address.codigoPostal.replace(/\D/g, '');

  // Al completar los cinco dígitos buscamos el código postal y llenamos solos
  // el estado, la alcaldía o municipio y —si sólo hay una— la colonia.
  useEffect(() => {
    if (codigoPostal.length !== 5) {
      ultimaBusqueda.current = '';
      setDatos(null);
      setBusqueda('inactiva');
      return;
    }
    if (ultimaBusqueda.current === codigoPostal) return;

    ultimaBusqueda.current = codigoPostal;
    // Sólo en la primera búsqueda respetamos la colonia que el cliente ya tenía
    // guardada, aunque no aparezca en el catálogo.
    const esPrimeraBusqueda = primeraCarga.current;
    primeraCarga.current = false;
    setBusqueda('buscando');
    let cancelado = false;

    fetch(`/api/codigo-postal?cp=${codigoPostal}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((res: DatosCodigoPostal | null) => {
        if (cancelado || ultimaBusqueda.current !== codigoPostal) return;
        if (!res) {
          setDatos(null);
          setBusqueda('sin-resultado');
          setEditandoZona(true);
          setColoniaLibre(false);
          // Al cambiar a un código postal que no está en el catálogo, borramos
          // la zona anterior para que no se envíe a la dirección equivocada.
          if (!esPrimeraBusqueda) {
            const previo = useShippingAddress.getState().address;
            useShippingAddress
              .getState()
              .setAddress({ ...previo, estado: '', municipio: '', colonia: '' });
          }
          return;
        }

        setDatos(res);
        setBusqueda('encontrado');
        setEditandoZona(false);

        const actual = useShippingAddress.getState().address;
        // Conservamos la colonia si sigue perteneciendo al código postal —o si
        // es la que el cliente ya tenía guardada al abrir el carrito—; cuando
        // cambia de código postal la reemplazamos por la que toque.
        const conservar =
          actual.colonia !== '' && (esPrimeraBusqueda || res.colonias.includes(actual.colonia));
        const colonia = conservar
          ? actual.colonia
          : res.colonias.length === 1
            ? res.colonias[0]
            : '';
        setColoniaLibre(colonia !== '' && !res.colonias.includes(colonia));
        useShippingAddress.getState().setAddress({
          ...actual,
          estado: res.estado,
          municipio: res.municipio,
          colonia,
        });
      })
      .catch(() => {
        if (cancelado) return;
        setDatos(null);
        setBusqueda('sin-resultado');
        setEditandoZona(true);
      });

    return () => {
      cancelado = true;
    };
  }, [codigoPostal]);

  const handleChange =
    (field: keyof ShippingAddress) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateField(field, e.target.value);
    };

  const zonaBloqueada = busqueda === 'encontrado' && !editandoZona;
  const ejemploCalle = datos?.calleEjemplo ? `Ej. ${datos.calleEjemplo}` : 'Ej. Av. Insurgentes Sur';
  const ejemploColonia = datos?.colonias[0] ? `Ej. ${datos.colonias[0]}` : 'Ej. Del Valle Centro';

  return (
    <div className="rounded-2xl border border-slate-100 p-6">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary-700" />
        <h2 className="font-display text-lg font-semibold text-ink">Dirección de envío</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nombre de quien recibe</label>
            <input
              type="text"
              autoComplete="name"
              value={address.nombre}
              onChange={handleChange('nombre')}
              placeholder="Nombre completo"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input
              type="tel"
              autoComplete="tel"
              value={address.telefono}
              onChange={handleChange('telefono')}
              placeholder="55 1234 5678"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Código Postal</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              autoComplete="postal-code"
              value={address.codigoPostal}
              onChange={(e) => updateField('codigoPostal', e.target.value.replace(/\D/g, ''))}
              placeholder="5 dígitos"
              className={`${inputClass} pr-9`}
            />
            {busqueda === 'buscando' && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
            {busqueda === 'encontrado' && (
              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            )}
          </div>
          {busqueda === 'sin-resultado' ? (
            <p className="mt-1.5 text-xs text-amber-700">
              No encontramos ese código postal. Puedes llenar los datos a mano.
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">
              Con tu código postal llenamos estado, alcaldía o municipio y colonia.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Estado</label>
            {zonaBloqueada ? (
              <input type="text" value={address.estado} readOnly className={inputAutoClass} />
            ) : (
              <select value={address.estado} onChange={handleChange('estado')} className={inputClass}>
                <option value="">Selecciona</option>
                {ESTADOS_MEXICO.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className={labelClass}>Alcaldía o Municipio</label>
            {zonaBloqueada ? (
              <input type="text" value={address.municipio} readOnly className={inputAutoClass} />
            ) : (
              <input
                type="text"
                autoComplete="address-level2"
                value={address.municipio}
                onChange={handleChange('municipio')}
                placeholder="Ej. Miguel Hidalgo"
                className={inputClass}
              />
            )}
          </div>
        </div>

        {zonaBloqueada && (
          <button
            type="button"
            onClick={() => setEditandoZona(true)}
            className="text-xs font-semibold text-primary-700 underline"
          >
            Corregir estado o municipio
          </button>
        )}

        <div>
          <label className={labelClass}>Colonia</label>
          {datos && datos.colonias.length > 1 && !coloniaLibre ? (
            <select
              value={address.colonia}
              onChange={(e) => {
                if (e.target.value === OTRA_COLONIA) {
                  setColoniaLibre(true);
                  updateField('colonia', '');
                  return;
                }
                updateField('colonia', e.target.value);
              }}
              className={inputClass}
            >
              <option value="">Selecciona tu colonia</option>
              {datos.colonias.map((colonia) => (
                <option key={colonia} value={colonia}>
                  {colonia}
                </option>
              ))}
              <option value={OTRA_COLONIA}>Otra (escribirla)</option>
            </select>
          ) : (
            <input
              type="text"
              autoComplete="address-level3"
              value={address.colonia}
              onChange={handleChange('colonia')}
              placeholder={ejemploColonia}
              className={inputClass}
            />
          )}
          {coloniaLibre && datos && datos.colonias.length > 1 && (
            <button
              type="button"
              onClick={() => setColoniaLibre(false)}
              className="mt-1.5 text-xs font-semibold text-primary-700 underline"
            >
              Ver las colonias de este código postal
            </button>
          )}
        </div>

        <div>
          <label className={labelClass}>Calle</label>
          <input
            type="text"
            autoComplete="address-line1"
            value={address.calle}
            onChange={handleChange('calle')}
            placeholder={ejemploCalle}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Número exterior</label>
            <input
              type="text"
              value={address.numeroExterior}
              onChange={handleChange('numeroExterior')}
              placeholder="Ej. 123"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número interior (opcional)</label>
            <input
              type="text"
              autoComplete="address-line2"
              value={address.numeroInterior}
              onChange={handleChange('numeroInterior')}
              placeholder="Depto, piso, etc."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Referencias (opcional)</label>
          <input
            type="text"
            value={address.referencias}
            onChange={handleChange('referencias')}
            placeholder="Entre calles, color de casa, portón negro..."
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
