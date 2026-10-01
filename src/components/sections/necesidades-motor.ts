import { centroNecesidad, estadoNecesidad, indiceNecesidad, limitar, transicion } from './necesidades-timeline';

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

    function medir() {
      const margen = parseFloat(getComputedStyle(escenario).top) || 0;
      inicio = raiz.getBoundingClientRect().top + window.scrollY - margen;
      rango = Math.max(1, raiz.offsetHeight - escenario.offsetHeight);
      pendienteMedir = false;
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
        panel.style.visibility = estado.opacidad > 0.001 ? 'visible' : 'hidden';
        if (nueva !== actual) {
          panel.inert = nueva !== i;
          panel.setAttribute('aria-hidden', String(nueva !== i));
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
      enlaces.forEach(enlace => enlace.removeAttribute('aria-current'));
    };
  }
  function cambiar() { detener?.(); detener = escritorio.matches ? iniciarEscritorio() : undefined; }
  cambiar();
  escritorio.addEventListener('change', cambiar);
  return () => { escritorio.removeEventListener('change', cambiar); detener?.(); };
}
