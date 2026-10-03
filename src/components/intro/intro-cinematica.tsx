'use client';

import Link from 'next/link';
import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { ALA_DERECHA, ALA_IZQUIERDA, CUERPO, Mariposa } from '@/components/ui/mariposa';
import { iniciarIntro } from './motor';
import '@/styles/intro.css';

// useLayoutEffect evita un parpadeo al llegar al inicio desde otra página;
// en el servidor no existe y se usa useEffect para no generar avisos.
const useEfectoAntesDePintar = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const LETRAS = Array.from('Skinworld');

/**
 * Intro cinematográfica del inicio: la mariposa nace en la oscuridad, cruza
 * la escena, gira, se queda viva al centro y se convierte en el logo del
 * encabezado. Todo lo controla el scroll (ver linea-de-tiempo.ts y motor.ts).
 *
 * Sin JavaScript o con "reducir movimiento" se muestra una composición fija:
 * la mariposa, Skinworld y los dos botones.
 */
export function IntroCinematica() {
  const raiz = useRef<HTMLElement>(null);
  const id = useId().replace(/:/g, '');

  useEfectoAntesDePintar(() => {
    if (!raiz.current) return;
    return iniciarIntro(raiz.current);
  }, []);

  const gradienteIzq = `${id}-ala-izq`;
  const gradienteDer = `${id}-ala-der`;

  return (
    <section ref={raiz} className="sw-intro" aria-labelledby={`${id}-titulo`}>
      <div className="sw-intro__escena" data-intro="escena">
        <div className="sw-intro__sonda" data-intro="sonda" aria-hidden />

        <div className="sw-intro__capas" aria-hidden>
          <div className="sw-intro__fondo sw-intro__fondo--oscuro" />
          <div className="sw-intro__fondo sw-intro__fondo--rosa" data-intro="fondo-rosa" />
          <div className="sw-intro__fondo sw-intro__fondo--claro" data-intro="fondo-claro" />
          <div className="sw-intro__campo sw-intro__campo--1" data-intro="campo" />
          <div className="sw-intro__campo sw-intro__campo--2" data-intro="campo" />
          <div className="sw-intro__campo sw-intro__campo--3" data-intro="campo" />
          <div className="sw-intro__haz sw-intro__haz--1" data-intro="haz" />
          <div className="sw-intro__haz sw-intro__haz--2" data-intro="haz" />
        </div>

        {/* Plano de composición: mide 100svh para que la escena quede centrada
            en la parte visible aunque el navegador muestre sus barras. */}
        <div className="sw-intro__plano">
          <div className="sw-intro__luz" data-intro="luz" aria-hidden />
          <div className="sw-intro__particulas" data-intro="particulas" aria-hidden />
          <div className="sw-intro__estela" data-intro="estela" aria-hidden>
            <Mariposa className="h-full w-full" />
          </div>
          <div className="sw-intro__estela" data-intro="estela" aria-hidden>
            <Mariposa className="h-full w-full" />
          </div>

          <h1 id={`${id}-titulo`} className="sw-intro__nombre" data-intro="nombre">
            <span className="sr-only">Skinworld</span>
            <span aria-hidden className="sw-intro__letras">
              {LETRAS.map((letra, i) => (
                <span key={i} className="sw-intro__letra" data-intro="letra">
                  {letra}
                </span>
              ))}
            </span>
          </h1>

          <div className="sw-intro__mariposa" data-intro="mariposa" aria-hidden>
            <div className="sw-intro__pieza sw-intro__ala" data-intro="ala-izquierda">
              <svg viewBox="0 0 512 407" focusable="false">
                <defs>
                  <linearGradient id={gradienteIzq} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#F6C6D2" />
                    <stop offset="0.55" stopColor="#E9A9B9" />
                    <stop offset="1" stopColor="#DE98AB" />
                  </linearGradient>
                </defs>
                <path fill={`url(#${gradienteIzq})`} d={ALA_IZQUIERDA} />
              </svg>
            </div>
            <div className="sw-intro__pieza">
              <svg viewBox="0 0 512 407" focusable="false">
                <path fill="#E5A2B4" d={CUERPO} />
              </svg>
            </div>
            <div className="sw-intro__pieza sw-intro__ala" data-intro="ala-derecha">
              <svg viewBox="0 0 512 407" focusable="false">
                <defs>
                  <linearGradient id={gradienteDer} x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F6C6D2" />
                    <stop offset="0.55" stopColor="#E9A9B9" />
                    <stop offset="1" stopColor="#DE98AB" />
                  </linearGradient>
                </defs>
                <path fill={`url(#${gradienteDer})`} d={ALA_DERECHA} />
              </svg>
            </div>
          </div>

          <div className="sw-intro__frente sw-intro__frente--1" data-intro="frente" aria-hidden />
          <div className="sw-intro__frente sw-intro__frente--2" data-intro="frente" aria-hidden />

          <div className="sw-intro__acciones" data-intro="acciones">
            <Link href="/tienda" className="sw-btn sw-btn-primary h-14 px-9 text-base">
              Explorar productos
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/sobre-nosotros" className="sw-btn sw-btn-secondary h-14 px-9 text-base">
              Conocer a la Dra. Karina
            </Link>
          </div>
        </div>

        <div className="sw-intro__vineta" data-intro="vineta" aria-hidden />
        <div className="sw-intro__grano" data-intro="grano" aria-hidden />

        <div className="sw-intro__pista" data-intro="pista" aria-hidden>
          <span />
        </div>
        <button type="button" className="sw-intro__saltar" data-intro="saltar">
          Saltar intro
        </button>
        <div className="sw-intro__progreso" data-intro="interfaz" aria-hidden>
          <i data-intro="progreso-barra" />
        </div>
      </div>
    </section>
  );
}
