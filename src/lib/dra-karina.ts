/**
 * Datos de la Dra. Karina Alfaro López, en un solo lugar para la página de
 * inicio y Sobre nosotros. Todo viene del contenido que ya publicaba el sitio;
 * no se agrega ninguna credencial que no estuviera ahí.
 */
export const DRA_KARINA = {
  nombre: 'Dra. Karina Alfaro López',
  especialidad: 'Especialista en dermatología',
  experiencia: '25 años de experiencia',
  foto: '/images/dra-karina-alfaro.jpg',
  consultorio: {
    lugar: 'Grupo Médico Pediátrico, sede Lomas',
    direccion: 'Acueducto Río Hondo 30, Hospital Ángeles Lomas, CDMX',
    telefono: '55 1100 1200',
    telefonoEnlace: 'tel:+525511001200',
    horario: [
      'Lunes a viernes, 10:00 a 19:00',
      'Sábado y domingo, 11:00 a 14:00 y 16:00 a 18:00',
    ],
  },
  formacion: [
    { titulo: 'Medicina General', lugar: 'UNAM' },
    { titulo: 'Medicina Interna', lugar: 'Hospital ABC' },
    { titulo: 'Dermatología', lugar: 'Centro Médico Nacional 20 de Noviembre, ISSSTE' },
  ],
  certificacion: 'Consejo Mexicano de Dermatología, vigencia 2030',
  membresias: [
    'Academia Mexicana de Dermatología',
    'Colegio Iberolatinoamericano de Dermatología',
    'Fundación para la Dermatología',
  ],
} as const;
