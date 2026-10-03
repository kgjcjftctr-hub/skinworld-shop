import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { destinoNecesidad, estadoAnillos, estadoNecesidad, indiceNecesidad, transicion } from './necesidades-timeline';
import { estadosDe, fuenteDeEstado, Precarga, type Perfil } from './necesidades-personas';

gsap.registerPlugin(ScrollTrigger);

/**
 * Estudio compartido: la mujer nunca se mueve; un giroscopio de anillos de
 * cristal gira a su alrededor (WebGL, necesidades-anillos.ts). La foto solo
 * cambia cuando el anillo principal está de canto frente al rostro y la tapa.
 * Three.js se carga aparte, solo cuando la sección se acerca; mientras tanto (o
 * sin WebGL) se ve la foto sola.
 */
function crearEstudio(raiz: HTMLElement, perfil: Perfil) {
  const estudio = raiz.querySelector<HTMLElement>('[data-estudio]');
  const categorias = Array.from(raiz.querySelectorAll<HTMLElement>('[data-necesidad]')).map(panel => estadosDe(panel.dataset.categoria ?? ''));
  if (!estudio || !categorias.some(Boolean)) return null;
  const lienzo = estudio.querySelector<HTMLCanvasElement>('[data-anillos]')!;
  const respaldo = estudio.querySelector<HTMLImageElement>('[data-capa="foto"]')!;
  const fondos = Array.from(raiz.querySelectorAll<HTMLElement>('[data-necesidad]')).map(panel => getComputedStyle(panel).getPropertyValue('--ne-base').trim());
  const precarga = new Precarga();
  const fuente = (s: number) => (s < 0 || s > 15 ? null : fuenteDeEstado(categorias, s, perfil));
  let anillos: import('./necesidades-anillos').Anillos | null = null;
  let cargando = false, vivo = true, lado = 0, ultimo = '';
  let alLlegar: () => void = () => {};
  raiz.dataset.estudio = 'true';

  const medir = () => {
    lado = Math.round(Math.min(estudio.clientWidth, estudio.clientHeight));
    lienzo.style.width = lienzo.style.height = `${lado}px`;
    anillos?.medir(lado);
    ultimo = '';
  };
  const cargarAnillos = () => {
    if (cargando || anillos) return;
    cargando = true;
    import('./necesidades-anillos').then(m => {
      if (!vivo || !m.hayWebGL()) return;
      anillos = new m.Anillos(lienzo, perfil === 'movil');
      estudio.dataset.webgl = 'true';
      medir();
      alLlegar();
    }).catch(() => undefined);
  };

  return {
    medir,
    set alLlegar(fn: () => void) { alLlegar = fn; precarga.alLlegar = fn; },
    pintar(p: number, cerca: boolean) {
      if (cerca) cargarAnillos();
      const e = estadoAnillos(p);
      const vecinas = [fuente(e.estado), fuente(e.estado + 1), fuente(e.estado + 2), fuente(e.estado - 1)];
      precarga.pedir(cerca ? vecinas : []);
      anillos?.conservar(vecinas);
      const url = fuente(e.estado);
      const lista = !!url && precarga.lista(url);
      // Respaldo sin WebGL: la foto sola.
      if (lista && respaldo.getAttribute('src') !== url) respaldo.src = url!;
      const presencia = url && lista ? e.presencia : 0;
      estudio.style.setProperty('--ne-e-presencia', presencia.toFixed(4));
      raiz.style.setProperty('--ne-cristal', Math.sin((e.giro * Math.PI) / 180).toFixed(4));
      if (!anillos || !url) return;
      if (!anillos.ponerFoto(url, precarga.imagen(url))) return;
      const fondo = fondos[Math.floor(e.estado / 2)] ?? '#f6e9eb';
      anillos.fondo(fondo);
      const clave = `${e.giro.toFixed(2)}|${url}|${lado}|${fondo}`;
      if (clave === ultimo) return;
      ultimo = clave;
      anillos.pintar(e.giro);
    },
    liberar() { precarga.vaciar(); },
    quitar() {
      vivo = false;
      precarga.vaciar();
      anillos?.destruir();
      anillos = null;
      delete raiz.dataset.estudio;
      delete estudio.dataset.webgl;
      raiz.style.removeProperty('--ne-cristal');
      respaldo.removeAttribute('src');
      lienzo.removeAttribute('style');
      estudio.style.removeProperty('--ne-e-presencia');
    },
  };
}

export function iniciarNecesidades(raiz: HTMLElement) {
  const escena = raiz.querySelector<HTMLElement>('[data-necesidades-escena]')!;
  const paneles = Array.from(raiz.querySelectorAll<HTMLElement>('[data-necesidad]'));
  const enlaces = Array.from(raiz.querySelectorAll<HTMLAnchorElement>('[data-necesidad-enlace]'));
  const mm = gsap.matchMedia();
  mm.add({
    escritorio: '(min-width: 768px)',
    fija: '(min-width: 1024px) and (min-height: 620px), (max-width: 1023px) and (min-height: 600px)',
    reducido: '(prefers-reduced-motion: reduce)',
  }, context => {
    const { escritorio, fija, reducido } = context.conditions!;
    // Sin escena fija (movimiento reducido o pantalla baja) quedan ocho
    // bloques normales, cada uno con su retrato quieto.
    if (!fija || reducido) return;
    raiz.dataset.inmersiva = 'true';
    const estudio = crearEstudio(raiz, escritorio ? 'escritorio' : 'movil');
    let vivo = true, cuadro = 0, progreso = 0, actual = -2, cerca = false;
    const set = (el: HTMLElement, key: string, value: number) => el.style.setProperty(key, value.toFixed(4));

    function pintar() {
      cuadro = 0;
      if (!vivo) return;
      const p = progreso;
      const indice = indiceNecesidad(p);
      const activa = p >= 0.12 && p < 0.92 ? indice : -1;
      // El título ya está completo cuando la sección entra: nada de pantalla vacía.
      set(escena, '--ne-intro', 1);
      set(escena, '--ne-salida', transicion(p, 0.94, 1));
      set(escena, '--ne-progreso', p);
      const focoAnterior = paneles.some(panel => panel.contains(document.activeElement));
      paneles.forEach((panel, i) => {
        const e = estadoNecesidad(p, i);
        const mostrando = e.opacidad > 0.001;
        if (mostrando || panel.style.visibility !== 'hidden') {
          set(panel, '--ne-opacidad', e.opacidad);
          set(panel, '--ne-texto', e.texto);
          panel.style.visibility = mostrando ? 'visible' : 'hidden';
          panel.dataset.visible = String(mostrando);
        }
        if (activa !== actual) {
          panel.inert = activa !== i;
          panel.setAttribute('aria-hidden', String(activa !== i));
        }
      });
      estudio?.pintar(p, cerca);
      if (activa !== actual) {
        enlaces.forEach((enlace, i) => {
          if (i === activa) enlace.setAttribute('aria-current', 'step');
          else enlace.removeAttribute('aria-current');
        });
        if (focoAnterior) (activa >= 0 ? paneles[activa].querySelector<HTMLAnchorElement>('a') : enlaces[actual])?.focus({ preventScroll: true });
        actual = activa;
      }
    }
    function programar() { if (vivo && !cuadro) cuadro = requestAnimationFrame(pintar); }
    if (estudio) estudio.alLlegar = programar;

    const principal = ScrollTrigger.create({
      trigger: raiz,
      start: () => `top top+=${parseFloat(getComputedStyle(escena).top) || 0}`,
      end: () => `+=${Math.max(1, raiz.offsetHeight - escena.offsetHeight)}`,
      onUpdate: self => { progreso = self.progress; programar(); },
      onRefresh: self => { progreso = self.progress; estudio?.medir(); programar(); },
    });
    // Las fotos solo se piden cuando la sección está cerca de la pantalla.
    const observador = new IntersectionObserver(([entry]) => {
      cerca = entry.isIntersecting;
      if (!cerca) estudio?.liberar();
      programar();
    }, { rootMargin: '600px 0px' });
    observador.observe(raiz);

    const limpiarSaltos: (() => void)[] = [];
    const ir = (i: number, suave: boolean) => {
      window.scrollTo({ top: principal.start + destinoNecesidad(i) * (principal.end - principal.start), behavior: suave ? 'smooth' : 'instant' });
    };
    enlaces.forEach((enlace, i) => {
      const saltar = (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        history.replaceState(null, '', enlace.hash);
        ir(i, true);
      };
      enlace.addEventListener('click', saltar);
      limpiarSaltos.push(() => enlace.removeEventListener('click', saltar));
    });
    const desdeHash = () => {
      const i = enlaces.findIndex(enlace => enlace.hash === location.hash);
      if (i >= 0) ir(i, false);
    };
    window.addEventListener('hashchange', desdeHash);
    limpiarSaltos.push(() => window.removeEventListener('hashchange', desdeHash));
    desdeHash();

    const medidas = new ResizeObserver(() => { estudio?.medir(); programar(); });
    medidas.observe(escena);
    document.fonts.ready.then(() => { if (vivo) { principal.refresh(); programar(); } });
    estudio?.medir();
    programar();
    return () => {
      vivo = false;
      cancelAnimationFrame(cuadro);
      observador.disconnect(); medidas.disconnect();
      principal.kill();
      limpiarSaltos.forEach(fn => fn());
      estudio?.quitar();
      delete raiz.dataset.inmersiva;
      paneles.forEach(panel => {
        panel.inert = false; panel.removeAttribute('aria-hidden');
        delete panel.dataset.visible;
        panel.style.removeProperty('visibility');
        panel.style.removeProperty('--ne-opacidad');
        panel.style.removeProperty('--ne-texto');
      });
      enlaces.forEach(enlace => enlace.removeAttribute('aria-current'));
    };
  });
  return () => mm.revert();
}
