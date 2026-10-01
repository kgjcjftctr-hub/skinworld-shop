import { centroNecesidad, estadoNecesidad, estadoPersona, estadoPersonaCompacta, indiceNecesidad, limitar, transicion } from './necesidades-timeline';
import { enModoMuestra, personaDe, PersonaEnEscena } from './necesidades-personas';

/** Crea la persona de cada mundo que tenga secuencia en el manifiesto. */
function crearPersonas(paneles: HTMLElement[], perfil: 'escritorio' | 'movil') {
  return paneles.map((panel) => {
    const persona = personaDe(panel.dataset.categoria ?? '');
    const ranura = panel.querySelector<HTMLElement>('[data-persona]');
    if (!persona || !ranura) return null;
    panel.dataset.personaActiva = 'true';
    return new PersonaEnEscena(ranura, persona, perfil);
  });
}

function quitarPersonas(paneles: HTMLElement[], personas: (PersonaEnEscena | null)[]) {
  personas.forEach((persona, i) => {
    if (!persona) return;
    persona.liberar();
    persona.canvas.remove();
    delete paneles[i].dataset.personaActiva;
  });
}

function avisoDeMuestra(escenario: HTMLElement) {
  if (!enModoMuestra()) return () => {};
  const aviso = document.createElement('p');
  aviso.className = 'necesidades__aviso-muestra';
  aviso.textContent = 'Secuencia de prueba: aquí irá la persona de cada categoría';
  escenario.appendChild(aviso);
  return () => aviso.remove();
}

/**
 * Personas fuera de la escena fija (celular, o cualquier tamaño con
 * movimiento reducido): cada bloque dibuja su persona mientras cruza la
 * pantalla, o un solo cuadro fijo si se pidió reducir el movimiento.
 */
function iniciarPersonasApiladas(raiz: HTMLElement, reducido: boolean) {
  const paneles = Array.from(raiz.querySelectorAll<HTMLElement>('[data-necesidad]'));
  const personas = crearPersonas(paneles, window.innerWidth < 768 ? 'movil' : 'escritorio');
  if (!personas.some(Boolean)) return () => {};
  const quitarAviso = avisoDeMuestra(raiz.querySelector<HTMLElement>('[data-necesidades-escena]')!);
  const cerca = new Set<number>();
  let cuadro = 0;

  function pintar() {
    cuadro = 0;
    const alto = window.innerHeight;
    cerca.forEach((i) => {
      const persona = personas[i];
      if (!persona) return;
      if (reducido) return persona.dibujar(1);
      const r = paneles[i].getBoundingClientRect();
      const t = limitar((alto - r.top) / (alto + r.height));
      const e = estadoPersonaCompacta(t);
      // Las variables van en el mundo completo: la escultura también las usa
      // para moverse en paralaje detrás de la persona.
      const mundo = paneles[i];
      mundo.style.setProperty('--ne-p-x', `${e.x.toFixed(2)}vw`);
      mundo.style.setProperty('--ne-p-escala', e.escala.toFixed(4));
      mundo.style.setProperty('--ne-p-plano', `${e.plano.toFixed(2)}deg`);
      mundo.style.setProperty('--ne-p-opacidad', e.opacidad.toFixed(4));
      persona.dibujar(e.giro);
    });
  }
  const programar = () => { if (!cuadro) cuadro = requestAnimationFrame(pintar); };
  personas.forEach((p) => { if (p) p.alNecesitarCuadro = programar; });

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      const i = paneles.indexOf(entrada.target as HTMLElement);
      const persona = personas[i];
      if (!persona) return;
      if (entrada.isIntersecting) {
        cerca.add(i);
        persona.medir();
        if (reducido) persona.cargarFinal(); else persona.cargar();
      } else {
        cerca.delete(i);
        persona.liberar();
      }
    });
    programar();
  }, { rootMargin: '60% 0px' });
  paneles.forEach((panel, i) => { if (personas[i]) observador.observe(panel); });
  const alRedimensionar = () => { personas.forEach((p) => p?.medir()); programar(); };
  window.addEventListener('scroll', programar, { passive: true });
  window.addEventListener('resize', alRedimensionar);
  return () => {
    cancelAnimationFrame(cuadro);
    observador.disconnect();
    window.removeEventListener('scroll', programar);
    window.removeEventListener('resize', alRedimensionar);
    quitarAviso();
    quitarPersonas(paneles, personas);
  };
}

/** Mejora progresiva: sin JS, en móvil y con movimiento reducido son ocho escenas normales. */
export function iniciarNecesidades(raiz: HTMLElement) {
  const escritorio = window.matchMedia('(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)');
  const cursor = window.matchMedia('(hover: hover) and (pointer: fine)');
  let detener: (() => void) | undefined;

  function iniciarEscritorio() {
    const escenario = raiz.querySelector<HTMLElement>('[data-necesidades-escena]')!;
    const paneles = Array.from(raiz.querySelectorAll<HTMLElement>('[data-necesidad]'));
    const enlaces = Array.from(raiz.querySelectorAll<HTMLAnchorElement>('[data-necesidad-enlace]'));
    let cuadro = 0, visible = true, inicio = 0, rango = 1, actual = -2, pendienteMedir = true;
    raiz.dataset.inmersiva = 'true';
    const personas = crearPersonas(paneles, 'escritorio');
    const quitarAviso = personas.some(Boolean) ? avisoDeMuestra(escenario) : () => {};

    function medir() {
      const margen = parseFloat(getComputedStyle(escenario).top) || 0;
      inicio = raiz.getBoundingClientRect().top + window.scrollY - margen;
      rango = Math.max(1, raiz.offsetHeight - escenario.offsetHeight);
      pendienteMedir = false;
      personas.forEach((persona) => persona?.medir());
    }
    function pintar() {
      cuadro = 0;
      if (pendienteMedir) medir();
      const p = limitar((window.scrollY - inicio) / rango);
      const indice = indiceNecesidad(p);
      const intro = transicion(p, 0, 0.105);
      const salida = transicion(p, 0.92, 1);
      escenario.style.setProperty('--ne-intro', String(intro));
      escenario.style.setProperty('--ne-salida', String(salida));
      escenario.style.setProperty('--ne-progreso', String(p));
      const nueva = p >= 0.12 && p < 0.97 ? indice : -1;
      const focoAnterior = paneles.some(panel => panel.contains(document.activeElement));
      paneles.forEach((panel, i) => {
        const estado = estadoNecesidad(p, i);
        panel.style.setProperty('--ne-opacidad', estado.opacidad.toFixed(4));
        panel.style.setProperty('--ne-y', `${estado.y.toFixed(2)}px`);
        panel.style.setProperty('--ne-escala', estado.escala.toFixed(4));
        panel.style.setProperty('--ne-texto', estado.texto.toFixed(4));
        panel.style.visibility = estado.opacidad > 0.001 ? 'visible' : 'hidden';
        if (nueva !== actual) {
          panel.inert = nueva !== i;
          panel.setAttribute('aria-hidden', String(nueva !== i));
        }
        const persona = personas[i];
        if (persona) {
          // Solo se cargan la categoría en pantalla y sus vecinas; las demás se liberan.
          const distancia = Math.abs(i - (p - 0.17) / 0.1);
          if (distancia < 1.3) persona.cargar();
          else if (distancia > 1.9 && persona.cargando) persona.liberar();
          const e = estadoPersona(p, i);
          panel.style.setProperty('--ne-p-x', `${e.x.toFixed(2)}vw`);
          panel.style.setProperty('--ne-p-escala', e.escala.toFixed(4));
          panel.style.setProperty('--ne-p-plano', `${e.plano.toFixed(2)}deg`);
          panel.style.setProperty('--ne-p-opacidad', e.opacidad.toFixed(4));
          panel.style.setProperty('--ne-p-luz', e.luz.toFixed(4));
          if (e.visible) persona.dibujar(e.giro);
        }
      });
      if (nueva !== actual) {
        enlaces.forEach((enlace, i) => {
          if (i === nueva) enlace.setAttribute('aria-current', 'step');
          else enlace.removeAttribute('aria-current');
        });
        if (focoAnterior && nueva >= 0) paneles[nueva].querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
        actual = nueva;
      }
    }
    function programar() { if (!cuadro && visible) cuadro = requestAnimationFrame(pintar); }
    personas.forEach((persona) => { if (persona) persona.alNecesitarCuadro = programar; });
    function redimensionar() { pendienteMedir = true; programar(); }
    const observador = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      if (visible) { pendienteMedir = true; programar(); }
    }, { rootMargin: '200px 0px' });
    const tamano = new ResizeObserver(redimensionar);
    observador.observe(raiz);
    tamano.observe(escenario);
    window.addEventListener('scroll', programar, { passive: true });
    window.addEventListener('resize', redimensionar);

    const saltos = enlaces.map((enlace, i) => {
      const saltar = (evento: MouseEvent) => {
        if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
        evento.preventDefault();
        medir();
        window.scrollTo({ top: inicio + centroNecesidad(i) * rango, behavior: 'smooth' });
      };
      enlace.addEventListener('click', saltar);
      return () => enlace.removeEventListener('click', saltar);
    });
    let cursorCuadro = 0, x = 0, y = 0;
    const pintarCursor = () => {
      cursorCuadro = 0;
      escenario.style.setProperty('--ne-cursor-x', `${x.toFixed(1)}px`);
      escenario.style.setProperty('--ne-cursor-y', `${y.toFixed(1)}px`);
    };
    const mover = (e: PointerEvent) => {
      if (!cursor.matches) return;
      const r = escenario.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      y = ((e.clientY - r.top) / r.height - 0.5) * 8;
      if (!cursorCuadro) cursorCuadro = requestAnimationFrame(pintarCursor);
    };
    const salir = () => { x = 0; y = 0; if (!cursorCuadro) cursorCuadro = requestAnimationFrame(pintarCursor); };
    escenario.addEventListener('pointermove', mover, { passive: true });
    escenario.addEventListener('pointerleave', salir);
    medir();
    pintar();
    document.fonts.ready.then(() => { if (raiz.dataset.inmersiva) redimensionar(); });
    return () => {
      delete raiz.dataset.inmersiva;
      cancelAnimationFrame(cuadro);
      cancelAnimationFrame(cursorCuadro);
      observador.disconnect();
      tamano.disconnect();
      window.removeEventListener('scroll', programar);
      window.removeEventListener('resize', redimensionar);
      escenario.removeEventListener('pointermove', mover);
      escenario.removeEventListener('pointerleave', salir);
      saltos.forEach(limpiar => limpiar());
      paneles.forEach(panel => { panel.inert = false; panel.removeAttribute('aria-hidden'); panel.style.removeProperty('visibility'); });
      quitarAviso();
      quitarPersonas(paneles, personas);
      enlaces.forEach(enlace => enlace.removeAttribute('aria-current'));
    };
  }
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  function cambiar() {
    detener?.();
    detener = escritorio.matches ? iniciarEscritorio() : iniciarPersonasApiladas(raiz, reducido.matches);
  }
  cambiar();
  escritorio.addEventListener('change', cambiar);
  return () => { escritorio.removeEventListener('change', cambiar); detener?.(); };
}
