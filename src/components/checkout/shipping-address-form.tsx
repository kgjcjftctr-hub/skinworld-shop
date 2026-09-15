'use client';

import { useShippingAddress, type ShippingAddress } from '@/store/shipping-address';
import { MapPin } from 'lucide-react';

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

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-600';

export function ShippingAddressForm() {
  const address = useShippingAddress((state) => state.address);
  const updateField = useShippingAddress((state) => state.updateField);

  const handleChange = (field: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateField(field, e.target.value);
  };

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
              value={address.telefono}
              onChange={handleChange('telefono')}
              placeholder="55 1234 5678"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Código Postal</label>
            <input
              type="text"
              inputMode="numeric"
              value={address.codigoPostal}
              onChange={handleChange('codigoPostal')}
              placeholder="52763"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select value={address.estado} onChange={handleChange('estado')} className={inputClass}>
              <option value="">Selecciona</option>
              {ESTADOS_MEXICO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Alcaldía o Municipio</label>
          <input
            type="text"
            value={address.municipio}
            onChange={handleChange('municipio')}
            placeholder="Ej. Huixquilucan"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Colonia</label>
          <input
            type="text"
            value={address.colonia}
            onChange={handleChange('colonia')}
            placeholder="Ej. Hacienda de las Palmas"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Calle</label>
          <input
            type="text"
            value={address.calle}
            onChange={handleChange('calle')}
            placeholder="Ej. Acueducto Río Hondo"
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
              placeholder="30"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número interior (opcional)</label>
            <input
              type="text"
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
