export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  date: string;
  author: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'rutina-diaria-piel-con-acne',
    title: 'Rutina diaria para piel con acné',
    excerpt: 'Descubre los pasos esenciales para cuidar tu piel propensa al acné sin agredirla.',
    category: 'Skincare',
    date: '2026-09-05',
    author: 'Dra. Karina Alfaro López',
    content: [
      'El acné es una de las condiciones dermatológicas más comunes, y su manejo exitoso depende en gran medida de la consistencia en la rutina diaria de cuidado.',
      'Limpieza suave: usa un limpiador facial libre de sulfatos, dos veces al día. La sobre-limpieza puede irritar la piel y empeorar la producción de sebo.',
      'Tratamiento activo: los ingredientes como el ácido salicílico o el peróxido de benzoilo, en concentraciones adecuadas, ayudan a controlar la obstrucción de poros.',
      'Hidratación no comedogénica: incluso la piel con acné necesita hidratación. Elige fórmulas ligeras que no obstruyan los poros.',
      'Protección solar diaria: muchos tratamientos para el acné aumentan la fotosensibilidad, por lo que el protector solar es indispensable.',
    ],
  },
  {
    slug: 'proteccion-solar-mas-que-un-habito',
    title: 'Protección solar: más que un hábito',
    excerpt: 'Por qué el protector solar es la mejor inversión en tu salud dermatológica a largo plazo.',
    category: 'Protección',
    date: '2026-09-03',
    author: 'Dra. Karina Alfaro López',
    content: [
      'La radiación ultravioleta es responsable de hasta el 80% del envejecimiento visible de la piel, además de ser el principal factor de riesgo para el cáncer de piel.',
      'Un protector solar de amplio espectro con SPF 30 o superior, aplicado diariamente, reduce significativamente el daño acumulado por exposición solar, incluso en días nublados.',
      'La reaplicación cada dos horas durante la exposición directa es tan importante como la aplicación inicial.',
    ],
  },
  {
    slug: 'ingredientes-activos-que-funcionan',
    title: 'Ingredientes activos que funcionan',
    excerpt: 'Guía completa de los ingredientes más efectivos y respaldados científicamente en skincare profesional.',
    category: 'Educación',
    date: '2026-09-01',
    author: 'Dra. Karina Alfaro López',
    content: [
      'No todos los ingredientes activos son iguales. La evidencia clínica respalda de forma sólida a un grupo reducido de compuestos.',
      'Retinoides: derivados de la vitamina A que aceleran la renovación celular y estimulan la producción de colágeno.',
      'Vitamina C: antioxidante que ilumina el tono de la piel y protege contra el daño ambiental.',
      'Ácido hialurónico: humectante de alto peso molecular que retiene agua en la capa superficial de la piel.',
      'Niacinamida: regula la producción de sebo y fortalece la barrera cutánea.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
