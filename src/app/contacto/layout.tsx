// La página de contacto es un componente de cliente y no puede exportar
// metadatos, así que van aquí.
export const metadata = {
  title: 'Contacto',
  description:
    'Escríbenos para dudas sobre productos, pedidos o asesoría dermatológica. Atención de lunes a viernes de 10 a 18 h.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
