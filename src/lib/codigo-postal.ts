import datos from '@/data/codigos-postales.json';

/**
 * Catálogo de códigos postales de México (SEPOMEX). Cada entrada guarda el
 * índice del estado dentro de `ESTADOS_MEXICO`, la alcaldía o municipio, las
 * colonias que comparten ese código postal y, cuando se conoce, el nombre de
 * una calle real de esa zona que se usa como ejemplo en el formulario.
 */
export const ESTADOS_MEXICO = [
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
] as const;

type Entrada = [estado: number, municipio: string, colonias: string[], calle?: string];

const catalogo = datos as unknown as Record<string, Entrada>;

export interface CodigoPostal {
  codigoPostal: string;
  estado: string;
  municipio: string;
  colonias: string[];
  /** Calle real de la zona, para usarla como ejemplo. */
  calleEjemplo: string | null;
}

export function buscarCodigoPostal(cp: string): CodigoPostal | null {
  const clave = cp.replace(/\D/g, '');
  if (clave.length !== 5) return null;

  const entrada = catalogo[clave];
  if (!entrada) return null;

  const [estado, municipio, colonias, calle] = entrada;
  return {
    codigoPostal: clave,
    estado: ESTADOS_MEXICO[estado] ?? '',
    municipio,
    colonias,
    calleEjemplo: calle ?? null,
  };
}
