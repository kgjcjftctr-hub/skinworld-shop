/**
 * Datos que pide una factura (CFDI 4.0) y sus catálogos del SAT. Lo usan el
 * formulario de /facturacion y el servidor que lo valida. Las reglas que mandan
 * están también en la base: supabase/migraciones/004-facturas.sql.
 */

/** Persona moral (3 letras) o física (4), fecha AAMMDD y homoclave. */
export const RFC = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;

export const REGIMENES_FISCALES = [
  { clave: '601', nombre: 'General de Ley Personas Morales' },
  { clave: '603', nombre: 'Personas Morales con Fines no Lucrativos' },
  { clave: '605', nombre: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { clave: '606', nombre: 'Arrendamiento' },
  { clave: '608', nombre: 'Demás ingresos' },
  { clave: '612', nombre: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { clave: '616', nombre: 'Sin obligaciones fiscales' },
  { clave: '621', nombre: 'Incorporación Fiscal' },
  { clave: '625', nombre: 'Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
  { clave: '626', nombre: 'Régimen Simplificado de Confianza' },
] as const;

export const USOS_CFDI = [
  { clave: 'G01', nombre: 'Adquisición de mercancías' },
  { clave: 'G03', nombre: 'Gastos en general' },
  { clave: 'S01', nombre: 'Sin efectos fiscales' },
] as const;

export const nombreDeRegimen = (clave: string) =>
  REGIMENES_FISCALES.find((r) => r.clave === clave)?.nombre ?? clave;
export const nombreDeUso = (clave: string) => USOS_CFDI.find((u) => u.clave === clave)?.nombre ?? clave;
