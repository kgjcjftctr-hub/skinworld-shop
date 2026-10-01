import { clamp, estado, mezcla, type Destino, type Medidas } from './linea-de-tiempo';

/**
 * Motor de la intro. Un solo requestAnimationFrame lee el scroll, suaviza el
 * avance y escribe únicamente transform, opacity y unas pocas variables CSS.
 * React no vuelve a renderizar nada mientras se hace scroll.
 *
 * Se detiene solo cuando la intro sale de la pantalla y vuelve a arrancar
 * al regresar, así el resto de la página no paga ningún costo.
 */

/** Fracción de pantalla que la sección siguiente sube sobre la escena. Debe
 *  coincidir con el margin-bottom negativo de .sw-intro en intro.css. */
export const SOLAPE = 0.32;
const PROPORCION = 407 / 512;

declare global {
  interface Window {
    __swIntroActiva?: boolean;
  }
}

interface Particula {
  el: HTMLDivElement;
  x: number;
  y: number;
  z: number;
  fase: number;
}

export function iniciarIntro(raiz: HTMLElement): () => void {
  const raizDoc = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    raizDoc.classList.remove('sw-intro-js');
    return () => {};
  }
  raizDoc.classList.add('sw-intro-js');
  window.__swIntroActiva = true;

  const q = <T extends Element = HTMLElement>(nombre: string) =>
    raiz.querySelector(`[data-intro="${nombre}"]`) as T;
  const qs = <T extends Element = HTMLElement>(nombre: string) =>
    Array.from(raiz.querySelectorAll(`[data-intro="${nombre}"]`)) as T[];

  const escena = q('escena');
  const sonda = q('sonda');
  const fondoRosa = q('fondo-rosa');
  const fondoClaro = q('fondo-claro');
  const vineta = q('vineta');
  const grano = q('grano');
  const campos = qs('campo');
  const haces = qs('haz');
  const luz = q('luz');
  const contParticulas = q('particulas');
  const estelas = qs('estela');
  const mariposa = q('mariposa');
  const alaIzq = q('ala-izquierda');
  const alaDer = q('ala-derecha');
  const frentes = qs('frente');
  const nombre = q('nombre');
  const letras = qs('letra');
  const acciones = q('acciones');
  const interfaz = qs('interfaz');
  const barra = q('progreso-barra');
  const pista = q('pista');
  const saltar = q<HTMLButtonElement>('saltar');

  const ligero =
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) ||
    ((navigator.hardwareConcurrency || 8) <= 4 &&
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 8) <= 4);
  const cursorFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Escrituras con memoria: si el valor no cambió, no se toca el estilo.
  const ultimo = new WeakMap<HTMLElement, Record<string, string>>();
  const pon = (el: HTMLElement | undefined, prop: string, valor: string) => {
    if (!el) return;
    let m = ultimo.get(el);
    if (!m) ultimo.set(el, (m = {}));
    if (m[prop] === valor) return;
    m[prop] = valor;
    el.style.setProperty(prop, valor);
  };
  const opacidad = (el: HTMLElement | undefined, v: number) => pon(el, 'opacity', v.toFixed(3));
  const variable = (nombreVar: string, v: string) => {
    if (raizDoc.style.getPropertyValue(nombreVar) !== v) raizDoc.style.setProperty(nombreVar, v);
  };

  let medidas: Medidas;
  let resolucion = 2;
  let inicio = 0;
  let rango = 1;
  let particulas: Particula[] = [];
  let perfilParticulas = '';

  const crearParticulas = (movil: boolean) => {
    const n = movil ? (ligero ? 6 : 10) : ligero ? 12 : 22;
    const perfil = `${n}`;
    if (perfil === perfilParticulas) return;
    perfilParticulas = perfil;
    contParticulas.replaceChildren();
    particulas = [];
    let semilla = 11;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'sw-intro__particula';
      const z = 0.3 + azar() * 0.7;
      const tam = 5 + z * z * 22;
      el.style.width = el.style.height = `${tam}px`;
      contParticulas.appendChild(el);
      particulas.push({ el, x: azar(), y: azar(), z, fase: azar() * 6.28 });
    }
  };

  const medir = () => {
    const W = escena.clientWidth;
    const H = sonda.offsetHeight || window.innerHeight;
    const movil = W < 768;
    resolucion = movil ? 1.6 : 2;
    const base = movil ? Math.min(0.56 * W, (0.42 * H) / PROPORCION) : Math.min(0.28 * W, (0.5 * H) / PROPORCION);

    pon(mariposa, 'width', `${base * resolucion}px`);
    pon(mariposa, 'height', `${base * resolucion * PROPORCION}px`);
    estelas.forEach((el) => {
      pon(el, 'width', `${base}px`);
      pon(el, 'height', `${base * PROPORCION}px`);
    });

    // Tamaño del nombre: grande, pero sin pasar del 90 % del ancho.
    // También se limita por la altura, para que en pantallas bajas quepan
    // la mariposa, el nombre y los botones sin encimarse.
    let letra = movil ? Math.min(0.18 * W, 0.11 * H) : Math.min(0.14 * W, 240, 0.2 * H);
    nombre.style.fontSize = `${letra}px`;
    const anchoNombre = nombre.offsetWidth;
    if (anchoNombre > W * 0.9) {
      letra *= (W * 0.9) / anchoNombre;
      nombre.style.fontSize = `${letra}px`;
    }

    const alto = raiz.offsetHeight;
    inicio = raiz.getBoundingClientRect().top + window.scrollY;
    rango = Math.max(1, alto - escena.offsetHeight);

    medidas = {
      W,
      H,
      movil,
      base,
      letra,
      nombreAncho: nombre.offsetWidth,
      nombreAlto: nombre.offsetHeight,
      accionesAlto: acciones.offsetHeight,
      margenSuperior: movil ? 84 : 92,
      solape: SOLAPE,
      pEntradaSiguiente: clamp(1 - (SOLAPE * H) / rango),
    };
    crearParticulas(movil);
  };

  const destinoMariposa = document.querySelector<HTMLElement>('[data-intro-destino="mariposa"]');
  const destinoNombre = document.querySelector<HTMLElement>('[data-intro-destino="nombre"]');
  const medirDestino = (): Destino | null => {
    if (!destinoMariposa || !destinoNombre) return null;
    const a = destinoMariposa.getBoundingClientRect();
    const b = destinoNombre.getBoundingClientRect();
    if (!a.width || !b.width) return null;
    return {
      mariposa: { x: a.left, y: a.top, w: a.width, h: a.height },
      nombre: { x: b.left, y: b.top, w: b.width, h: b.height },
      letraNombre: parseFloat(getComputedStyle(destinoNombre).fontSize) || 22,
    };
  };

  // Cursor (solo con ratón o trackpad): una inclinación de pocos grados.
  const cursor = { x: 0, y: 0, ox: 0, oy: 0 };
  const alMoverCursor = (e: PointerEvent) => {
    cursor.ox = (e.clientX / window.innerWidth) * 2 - 1;
    cursor.oy = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (cursorFino) window.addEventListener('pointermove', alMoverCursor, { passive: true });

  let p = -1;
  let fase = 0;
  let reloj = 0;
  let antes = performance.now();
  let saltoInmediato = false;
  let cuadroPendiente = 0;
  let visible = true;

  const cuadro = (ahora: number) => {
    cuadroPendiente = 0;
    const dt = Math.min(0.05, Math.max(0, (ahora - antes) / 1000));
    antes = ahora;
    reloj += dt;

    const y = window.scrollY;
    const pReal = clamp((y - inicio) / rango);
    if (p < 0 || saltoInmediato) {
      p = pReal;
      saltoInmediato = false;
    } else {
      p += (pReal - p) * (1 - Math.exp(-dt * 8));
      if (Math.abs(pReal - p) < 0.0004) p = pReal;
    }

    const destino = p > 0.9 ? medirDestino() : null;
    const e = estado(p, medidas, destino);
    const { W, H, movil, base } = medidas;
    const vw = W / 100;
    const vh = H / 100;

    // Fondo
    opacidad(fondoRosa, e.fondoRosa);
    opacidad(fondoClaro, e.fondoClaro);
    opacidad(vineta, e.vineta);
    opacidad(grano, e.grano);
    const desplazamientos = [
      [-8, -12],
      [-5, 10],
      [6, -14],
    ];
    campos.forEach((el, i) => {
      opacidad(el, clamp(e.campos[i]));
      const [dx, dy] = desplazamientos[i];
      pon(el, 'transform', `translate3d(${(dx * e.camposDesplazamiento).toFixed(2)}vw,${(dy * e.camposDesplazamiento).toFixed(2)}vh,0)`);
    });
    haces.forEach((el, i) => {
      opacidad(el, e.haz * (i === 0 ? 1 : 0.6) * (movil && i > 0 ? 0 : 1));
      const x = i === 0 ? mezcla(-28, 22, e.hazAvance) : mezcla(-8, 34, e.hazAvance);
      pon(el, 'transform', `translate3d(${x.toFixed(2)}vw,0,0) rotate(${i === 0 ? -24 : -31}deg)`);
    });

    // Luz que nace al centro y luego sigue a la mariposa
    opacidad(luz, e.luz.opacidad);
    pon(luz, 'transform', `translate3d(${e.luz.x.toFixed(1)}px,${e.luz.y.toFixed(1)}px,0) scale(${e.luz.escala.toFixed(3)})`);

    // Mariposa
    const m = e.mariposa;
    fase += 2 * Math.PI * m.frecuencia * dt;
    cursor.x += (cursor.ox - cursor.x) * (1 - Math.exp(-dt * 4));
    cursor.y += (cursor.oy - cursor.y) * (1 - Math.exp(-dt * 4));
    const vida = m.vida;
    const cx = cursorFino ? cursor.x : 0;
    const cy = cursorFino ? cursor.y : 0;
    const flota = Math.sin(reloj * 1.4) * 3 * vida;
    const balanceo = Math.sin(reloj * 0.9) * 0.8 * vida;
    const esc = m.escala / resolucion;
    opacidad(mariposa, m.opacidad);
    pon(
      mariposa,
      'transform',
      `perspective(${movil ? 900 : 1200}px) translate3d(-50%,-50%,0) translate3d(${(m.x + cx * 6 * vida).toFixed(1)}px,${(m.y + cy * 5 * vida + flota).toFixed(1)}px,0) scale(${esc.toFixed(4)}) rotateZ(${(m.rz + balanceo).toFixed(2)}deg) rotateY(${(m.ry + cx * 5 * vida).toFixed(2)}deg) rotateX(${(m.rx - cy * 4 * vida).toFixed(2)}deg)`
    );
    // El desenfoque se aplica antes de escalar: se compensa la escala y se
    // limita para no pedirle a la tarjeta gráfica un desenfoque enorme.
    pon(mariposa, 'filter', m.desenfoque > 0.05 ? `blur(${Math.min(20, m.desenfoque / Math.max(esc, 0.05)).toFixed(2)}px)` : 'none');
    // Alas: abren y cierran sobre el cuerpo, con una diferencia mínima entre ellas.
    const anguloIzq = m.amplitud * (0.5 - 0.5 * Math.cos(fase));
    const anguloDer = m.amplitud * 0.94 * (0.5 - 0.5 * Math.cos(fase + 0.4));
    const perspectivaAla = (base * resolucion * 2.2).toFixed(0);
    pon(alaIzq, 'transform', `perspective(${perspectivaAla}px) rotateY(${anguloIzq.toFixed(2)}deg)`);
    pon(alaDer, 'transform', `perspective(${perspectivaAla}px) rotateY(${(-anguloDer).toFixed(2)}deg)`);
    if (!movil) {
      // Las alas captan la luz según su ángulo.
      pon(alaIzq, 'filter', `brightness(${(1 + 0.14 * Math.sin((anguloIzq * Math.PI) / 180)).toFixed(3)})`);
      pon(alaDer, 'filter', `brightness(${(1 + 0.1 * Math.sin((anguloDer * Math.PI) / 180)).toFixed(3)})`);
    }

    // Estela: un rastro tenue en el paso cerca de cámara, en vez de desenfoque real.
    estelas.forEach((el, i) => {
      const intensidad = ligero ? 0 : e.estela * (i === 0 ? 0.16 : 0.08) * (movil && i > 0 ? 0 : movil ? 0.6 : 1);
      opacidad(el, intensidad);
      if (intensidad <= 0) return;
      const g = estado(Math.max(0, p - (i + 1) * 0.012), medidas, null).mariposa;
      pon(el, 'transform', `translate3d(-50%,-50%,0) translate3d(${g.x.toFixed(1)}px,${g.y.toFixed(1)}px,0) scale(${g.escala.toFixed(4)}) rotateZ(${g.rz.toFixed(2)}deg)`);
    });

    // Partículas: polvo iluminado que la mariposa aparta al pasar.
    const bx = W / 2 + m.x;
    const by = H / 2 + m.y;
    const radio = Math.max(18 * vw, base * m.escala * 0.6);
    const opP = e.particulasOpacidad;
    for (const pt of particulas) {
      let x = pt.x * W + Math.sin(p * 6 + pt.fase) * 1.5 * vw;
      let yy = ((((pt.y * 100 - p * 120 * pt.z) % 110) + 110) % 110) * vh - 5 * vh;
      const dx = x - bx;
      const dy = yy - by;
      const d = Math.hypot(dx, dy) || 1;
      if (d < radio && m.opacidad > 0) {
        const f = ((radio - d) / radio) * 10 * vw * pt.z * (0.4 + e.cercania);
        x += (dx / d) * f;
        yy += (dy / d) * f;
      }
      pon(pt.el, 'transform', `translate3d(${x.toFixed(1)}px,${yy.toFixed(1)}px,0)`);
      opacidad(pt.el, opP * (0.12 + 0.3 * (1 - Math.abs(pt.z - 0.6))));
    }

    frentes.forEach((el, i) => {
      opacidad(el, ligero || (movil && i > 0) ? 0 : e.frente * (i === 0 ? 0.5 : 0.35) * (movil ? 0.6 : 1));
      const x = i === 0 ? 70 - p * 40 : 8 + p * 20;
      const yv = i === 0 ? 120 - p * 160 : 140 - p * 190;
      pon(el, 'transform', `translate3d(${x.toFixed(2)}vw,${yv.toFixed(2)}vh,0)`);
    });

    // Nombre
    const n = e.nombre;
    opacidad(nombre, n.opacidad);
    pon(nombre, 'transform', `translate3d(-50%,-50%,0) translate3d(${n.x.toFixed(1)}px,${(n.y + n.subida).toFixed(1)}px,0) scale(${n.escala.toFixed(4)})`);
    pon(nombre, 'filter', n.desenfoque > 0.05 && n.opacidad > 0 ? `blur(${n.desenfoque.toFixed(2)}px)` : 'none');
    const centro = (letras.length - 1) / 2;
    letras.forEach((el, i) => pon(el, 'transform', `translate3d(${((i - centro) * n.tracking).toFixed(3)}em,0,0)`));

    // Botones
    opacidad(acciones, e.acciones.opacidad);
    pon(acciones, 'visibility', e.acciones.opacidad > 0.02 ? 'visible' : 'hidden');
    pon(acciones, 'transform', `translate3d(-50%,-50%,0) translate3d(0,${(e.acciones.y + e.acciones.subida).toFixed(1)}px,0)`);

    // Interfaz: saltar, progreso y la señal para hacer scroll
    interfaz.forEach((el) => opacidad(el, e.interfaz));
    opacidad(saltar, e.interfaz);
    pon(saltar, 'pointer-events', e.interfaz > 0.1 ? 'auto' : 'none');
    pon(barra, 'transform', `scaleX(${p.toFixed(4)})`);
    opacidad(pista, e.pista);

    // Encabezado: aparece al final y su logo se enciende cuando la firma aterriza.
    const finDelPin = inicio + rango;
    const fondo = clamp((y - finDelPin) / 60);
    variable('--sw-intro-header', e.encabezado.toFixed(3));
    variable('--sw-intro-logo-mariposa', e.logoMariposa.toFixed(3));
    variable('--sw-intro-logo-nombre', e.logoNombre.toFixed(3));
    variable('--sw-intro-fondo', fondo.toFixed(3));
    const estadoEncabezado = e.encabezado < 0.05 ? 'oculto' : 'visible';
    if (raizDoc.dataset.introHeader !== estadoEncabezado) raizDoc.dataset.introHeader = estadoEncabezado;
    const conFondo = fondo > 0.5 ? 'si' : 'no';
    if (raizDoc.dataset.introFondo !== conFondo) raizDoc.dataset.introFondo = conFondo;

    // Con la intro terminada y quieta no hay nada que animar: el siguiente
    // scroll vuelve a encender el ciclo.
    const quieto = p >= 1 && pReal >= 1;
    if ((visible && !quieto) || Math.abs(pReal - p) > 0.0004) programar();
  };

  const programar = () => {
    if (!cuadroPendiente) cuadroPendiente = requestAnimationFrame(cuadro);
  };

  const observador = new IntersectionObserver(
    ([entrada]) => {
      visible = entrada.isIntersecting;
      antes = performance.now();
      programar();
    },
    { rootMargin: '120px 0px' }
  );
  observador.observe(raiz);

  const alHacerScroll = () => programar();
  window.addEventListener('scroll', alHacerScroll, { passive: true });

  let medicionPendiente = 0;
  const alRedimensionar = () => {
    if (medicionPendiente) return;
    medicionPendiente = requestAnimationFrame(() => {
      medicionPendiente = 0;
      medir();
      programar();
    });
  };
  window.addEventListener('resize', alRedimensionar);

  const alSaltar = () => {
    window.scrollTo({ top: inicio + rango, behavior: 'instant' as ScrollBehavior });
    saltoInmediato = true;
    programar();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => acciones.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }))
    );
  };
  saltar?.addEventListener('click', alSaltar);

  medir();
  programar();
  document.fonts?.ready.then(() => {
    medir();
    programar();
  });

  return () => {
    if (cuadroPendiente) cancelAnimationFrame(cuadroPendiente);
    if (medicionPendiente) cancelAnimationFrame(medicionPendiente);
    observador.disconnect();
    window.removeEventListener('scroll', alHacerScroll);
    window.removeEventListener('resize', alRedimensionar);
    window.removeEventListener('pointermove', alMoverCursor);
    saltar?.removeEventListener('click', alSaltar);
    contParticulas.replaceChildren();
    for (const v of ['--sw-intro-header', '--sw-intro-logo-mariposa', '--sw-intro-logo-nombre', '--sw-intro-fondo']) {
      raizDoc.style.removeProperty(v);
    }
    delete raizDoc.dataset.introHeader;
    delete raizDoc.dataset.introFondo;
    raizDoc.classList.remove('sw-intro-js');
    window.__swIntroActiva = false;
  };
}
