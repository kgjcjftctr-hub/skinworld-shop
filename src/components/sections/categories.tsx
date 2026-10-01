'use client';

import Link from 'next/link';
import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BarraDeAvisos } from '@/components/barra-avisos';
import { iniciarNecesidades } from './necesidades-motor';
import '@/styles/necesidades.css';

// Estos nombres siguen siendo los valores exactos del filtro del catálogo.
const necesidades = [
  { nombre: 'Acné', palabra: 'ACNÉ', capitulo: 'El equilibrio', descripcion: 'Un espacio para el cuidado de la piel con tendencia acneica.', base: '#f6e9eb', tono: '#ca8198', profundo: '#92495f', claro: '#fff6f1', angulo: -24 },
  { nombre: 'Dermatitis', palabra: 'CALMA', capitulo: 'La delicadeza', descripcion: 'Descubre el catálogo de cuidado para esta necesidad de tu piel.', base: '#f3eae0', tono: '#c8a690', profundo: '#8d665a', claro: '#fffaf1', angulo: 18 },
  { nombre: 'Antiedad', palabra: 'TIEMPO', capitulo: 'El tiempo', descripcion: 'Explora tu siguiente ritual de cuidado.', base: '#e8dce8', tono: '#b08aa8', profundo: '#755071', claro: '#faf0f4', angulo: -42 },
  { nombre: 'Manchas', palabra: 'LUZ', capitulo: 'La luz', descripcion: 'Encuentra opciones de cuidado para tu rutina.', base: '#f1e0d8', tono: '#c59581', profundo: '#965e50', claro: '#fff3df', angulo: 32 },
  { nombre: 'Cabello y Uñas', palabra: 'ESENCIA', capitulo: 'Los detalles', descripcion: 'El cuidado también está en los detalles.', base: '#e3ccd3', tono: '#a2657d', profundo: '#743950', claro: '#f6e6e8', angulo: -12 },
  { nombre: 'Piel de Bebé', palabra: 'SUAVE', capitulo: 'La suavidad', descripcion: 'Explora nuestra categoría de cuidado para la piel de bebé.', base: '#faf2ed', tono: '#e0c1c0', profundo: '#9b6f78', claro: '#fffefa', angulo: 24 },
  { nombre: 'Protección Solar', palabra: 'SOL', capitulo: 'Cada día', descripcion: 'Descubre los protectores solares del catálogo.', base: '#f4edde', tono: '#d1b77f', profundo: '#927145', claro: '#fffbed', angulo: -35 },
  { nombre: 'Suplementos', palabra: 'RITUAL', capitulo: 'Tu ritual', descripcion: 'Conoce nuestra selección de suplementos.', base: '#e4d9e1', tono: '#a27b99', profundo: '#74516d', claro: '#f7eaf1', angulo: 12 },
];

export function CategoriesSection({ porCategoria }: { porCategoria: Record<string, number> }) {
  const raiz = useRef<HTMLElement>(null);
  useEffect(() => raiz.current ? iniciarNecesidades(raiz.current) : undefined, []);

  return (
    <section ref={raiz} className="necesidades" aria-labelledby="necesidades-titulo" id="necesidades">
      <div className="necesidades__escena" data-necesidades-escena>
        <div className="necesidades__avisos"><BarraDeAvisos ambiente /></div>
        <div className="necesidades__encabezado">
          <p className="necesidades__etiqueta">Por necesidad</p>
          <h2 id="necesidades-titulo"><span>Encuentra</span><span>soluciones por</span><span><em>problema.</em></span></h2>
        </div>
        <p className="necesidades__lema" aria-hidden="true">Una piel. Diferentes mundos.</p>
        <div className="necesidades__mundos">
          {necesidades.map((mundo, i) => {
            const numero = String(i + 1).padStart(2, '0');
            const total = porCategoria[mundo.nombre] ?? 0;
            const tema = {
              '--ne-base': mundo.base, '--ne-tono': mundo.tono, '--ne-profundo': mundo.profundo,
              '--ne-claro': mundo.claro, '--ne-angulo': `${mundo.angulo}deg`,
            } as CSSProperties;
            return (
              <article key={mundo.nombre} id={`necesidad-${i + 1}`} className={`necesidades__mundo necesidades__mundo--${i % 2}`} style={tema} data-necesidad aria-labelledby={`necesidad-titulo-${i + 1}`}>
                <div className="necesidades__ambiente" aria-hidden="true" />
                <div className="necesidades__arte" aria-hidden="true">
                  <span className="necesidades__gigante">{mundo.palabra}</span>
                  <div className="necesidades__escultura"><div className="necesidades__sombra" /><div className="necesidades__lamina" /><div className="necesidades__aro" /><div className="necesidades__perla" /><div className="necesidades__reflejo" /></div>
                  <span className="necesidades__pie-arte">{numero} — {mundo.capitulo}</span>
                </div>
                <div className="necesidades__cantidad"><strong>{total}</strong><span>{total === 1 ? 'producto' : 'productos'}<br /> por descubrir</span></div>
                <div className="necesidades__texto">
                  <p className="necesidades__numero">{numero} <span>/ 08</span></p>
                  <h3 id={`necesidad-titulo-${i + 1}`}>{mundo.nombre}</h3>
                  <p className="necesidades__descripcion">{mundo.descripcion}</p>
                  <Link className="necesidades__explorar" href={`/tienda?categoria=${encodeURIComponent(mundo.nombre)}`}>Explorar {mundo.nombre}<ArrowUpRight aria-hidden="true" size={22} /></Link>
                </div>
              </article>
            );
          })}
        </div>
        <div className="necesidades__cierre" aria-hidden="true"><p>El cuidado continúa</p><span>Una selección.<br /><em>Tu siguiente ritual.</em></span></div>
        <div className="necesidades__inferior"><Link href="/tienda">Ver todo el catálogo <ArrowUpRight size={20} aria-hidden="true" /></Link><span aria-hidden="true">Explora a tu ritmo</span></div>
        <nav className="necesidades__indice" aria-label="Saltar a una necesidad">
          {necesidades.map((mundo, i) => <a key={mundo.nombre} href={`#necesidad-${i + 1}`} data-necesidad-enlace><span>{String(i + 1).padStart(2, '0')}</span>{mundo.nombre}</a>)}
        </nav>
        <div className="necesidades__progreso" aria-hidden="true" />
      </div>
    </section>
  );
}
