// SEGURO · video demostrativo 3D (datos ficticios).
// Toda la animación es una función pura del tiempo t (segundos): window.renderAt(t)
// deja la escena exactamente en ese instante, así el render cuadro a cuadro es determinista.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Las texturas se dibujan con Inter: hay que esperar la fuente antes de construir la escena.
await Promise.all([500, 600, 700, 800].map((w) => document.fonts.load(`${w} 64px Inter`, 'ÁÉÍÓÚáéíóúñ¿?·×')));

export const DURATION = 24;
const W = 1920, H = 1080;
const PPU = 400; // píxeles de textura por unidad 3D

const C = {
  navy: '#0B1D3A', ink: '#0E2442', deep: '#050C1A',
  teal: '#14B8A6', tealBright: '#2EE0CB', orange: '#FF8A3D', orangeDark: '#E86A16',
  blue: '#2F6FED', paper: '#F6F8FB', paper2: '#EDF2F8', gray: '#5B6B82', grayLight: '#8A99AE', line: '#DCE3EC',
};

// ───────────────────────── utilidades de tiempo ─────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const easeOutBack = (x) => { x = clamp(x); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const seg = (t, a, b) => smoother((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
// visibilidad tipo "entra en [a,a+d], sale en [b,b+d]"
const window01 = (t, a, b, din = 0.5, dout = 0.4) => seg(t, a, a + din) * (1 - seg(t, b, b + dout));

const DEF = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, o: 1, d: 1 };
function track(keys) {
  // completa propiedades faltantes con las del key anterior
  let prev = { ...DEF };
  const full = keys.map(([time, p]) => { prev = { ...prev, ...p }; return [time, prev]; });
  return (t) => {
    if (t <= full[0][0]) return full[0][1];
    for (let i = 0; i < full.length - 1; i++) {
      const [ta, a] = full[i], [tb, b] = full[i + 1];
      if (t <= tb) {
        const k = smoother((t - ta) / (tb - ta));
        const out = {};
        for (const key in a) out[key] = lerp(a[key], b[key], k);
        return out;
      }
    }
    return full[full.length - 1][1];
  };
}

// PRNG determinista
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ───────────────────────── renderer y escena ─────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.deep);
scene.fog = new THREE.Fog(C.deep, 13, 30);

const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);

// luces
scene.add(new THREE.HemisphereLight(0x9cc8ff, 0x0b1d3a, 1.0));
const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(3.5, 5.5, 12);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -11, right: 11, top: 8, bottom: -8, near: 1, far: 40 });
key.shadow.bias = -0.0006;
key.shadow.normalBias = 0.03;
key.shadow.radius = 6;
scene.add(key);
const rimTeal = new THREE.PointLight(0x19c3b1, 70, 26, 1.6); rimTeal.position.set(-8, 3.5, 3); scene.add(rimTeal);
const rimOrange = new THREE.PointLight(0xff8a3d, 45, 22, 1.6); rimOrange.position.set(8, -3.5, 2.5); scene.add(rimOrange);

// fondo: pared con retícula de puntos (da referencia de parallax) + degradado
function makeWallTexture() {
  const c = document.createElement('canvas'); c.width = 2048; c.height = 1229;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(1024, 560, 60, 1024, 614, 1150);
  grad.addColorStop(0, '#1A3A66'); grad.addColorStop(0.45, '#0F2546'); grad.addColorStop(1, '#060E1E');
  g.fillStyle = grad; g.fillRect(0, 0, c.width, c.height);
  const step = 40;
  for (let y = step / 2; y < c.height; y += step) for (let x = step / 2; x < c.width; x += step) {
    const d = Math.hypot(x - 1024, y - 614) / 1100;
    g.fillStyle = `rgba(46,224,203,${0.22 * (1 - Math.min(1, d))})`;
    g.beginPath(); g.arc(x, y, 2.4, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const wall = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), new THREE.MeshStandardMaterial({ map: makeWallTexture(), roughness: 0.95 }));
wall.position.z = -5; wall.receiveShadow = true; scene.add(wall);

// partículas (polvo luminoso) delante y detrás de las tarjetas
{
  const rnd = mulberry32(7);
  const n = 260, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - 0.5) * 26; pos[i * 3 + 1] = (rnd() - 0.5) * 15; pos[i * 3 + 2] = -4.5 + rnd() * 10; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement('canvas'); dot.width = dot.height = 64;
  const dg = dot.getContext('2d'); const rg = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(160,240,230,0.6)'); rg.addColorStop(1, 'rgba(160,240,230,0)');
  dg.fillStyle = rg; dg.fillRect(0, 0, 64, 64);
  var dust = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.09, map: new THREE.CanvasTexture(dot), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);
}

// ───────────────────────── dibujo 2D de las caras ─────────────────────────
function canvasFor(wu, hu, ppu = PPU) { const c = document.createElement('canvas'); c.width = Math.round(wu * ppu); c.height = Math.round(hu * ppu); return c; }
function texFrom(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}
function font(g, weight, size) { g.font = `${weight} ${size}px Inter`; }
// escribe un texto; si no cabe en maxW reduce el tamaño (nunca se corta)
function text(g, str, x, y, { weight = 500, size = 48, color = C.navy, align = 'left', maxW = Infinity, spacing = 0 } = {}) {
  g.letterSpacing = `${spacing}px`;
  let s = size; font(g, weight, s);
  while (g.measureText(str).width > maxW && s > 10) { s -= 1; font(g, weight, s); }
  g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic';
  g.fillText(str, x, y);
  g.letterSpacing = '0px';
  return g.measureText(str).width;
}
function wrap(g, str, x, y, maxW, lineH, opts) {
  font(g, opts.weight, opts.size);
  const words = str.split(' '); let line = ''; const lines = [];
  for (const w of words) { const test = line ? line + ' ' + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
  if (line) lines.push(line);
  lines.forEach((l, i) => text(g, l, x, y + i * lineH, opts));
  return lines.length;
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function paperBase(g, w, h, r = 44) {
  rrect(g, 0, 0, w, h, r); g.save(); g.clip();
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, C.paper2);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.restore();
  g.lineWidth = 3; g.strokeStyle = C.line; rrect(g, 1.5, 1.5, w - 3, h - 3, r); g.stroke();
}
function pill(g, x, cy, label, { bg, fg, size = 56, h = 112, dot = true, outline = null, dashed = false }) {
  font(g, 700, size); const tw = g.measureText(label).width;
  const padL = dot ? 92 : 44, w = tw + padL + 48;
  rrect(g, x, cy - h / 2, w, h, h / 2);
  if (bg) { g.fillStyle = bg; g.fill(); }
  if (outline) { g.setLineDash(dashed ? [14, 10] : []); g.lineWidth = 5; g.strokeStyle = outline; rrect(g, x + 2.5, cy - h / 2 + 2.5, w - 5, h - 5, h / 2); g.stroke(); g.setLineDash([]); }
  if (dot) { g.fillStyle = fg; g.beginPath(); g.arc(x + 54, cy, 15, 0, Math.PI * 2); g.fill(); }
  text(g, label, x + padL, cy + size * 0.36, { weight: 700, size, color: fg });
  return w;
}
function checkIcon(g, cx, cy, r, bg, fg = '#fff') {
  g.fillStyle = bg; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = fg; g.lineWidth = r * 0.2; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(cx - r * 0.42, cy + r * 0.02); g.lineTo(cx - r * 0.1, cy + r * 0.34); g.lineTo(cx + r * 0.45, cy - r * 0.32); g.stroke();
}
function calendarIcon(g, x, y, s, color) {
  g.strokeStyle = color; g.lineWidth = s * 0.09; g.lineJoin = 'round';
  rrect(g, x, y + s * 0.12, s, s * 0.86, s * 0.14); g.stroke();
  g.fillStyle = color; g.fillRect(x, y + s * 0.12, s, s * 0.22);
  g.lineCap = 'round'; g.beginPath(); g.moveTo(x + s * 0.28, y); g.lineTo(x + s * 0.28, y + s * 0.24); g.moveTo(x + s * 0.72, y); g.lineTo(x + s * 0.72, y + s * 0.24); g.stroke();
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { g.fillRect(x + s * (0.18 + i * 0.25), y + s * (0.48 + j * 0.22), s * 0.14, s * 0.12); }
}
function hourglass(g, cx, cy, s, color) {
  g.strokeStyle = color; g.lineWidth = s * 0.1; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - s * 0.35, cy - s * 0.5); g.lineTo(cx + s * 0.35, cy - s * 0.5); g.lineTo(cx - s * 0.3, cy + s * 0.5);
  g.lineTo(cx + s * 0.3, cy + s * 0.5); g.lineTo(cx - s * 0.35, cy - s * 0.5); g.stroke();
}
function personIcon(g, cx, cy, s, color) {
  g.fillStyle = color; g.beginPath(); g.arc(cx, cy - s * 0.22, s * 0.22, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(cx, cy + s * 0.42, s * 0.42, s * 0.3, 0, Math.PI, 0); g.fill();
}

// ───────────────────────── tarjetas 3D ─────────────────────────
const allCards = [];
function makeCard(wu, hu, draw, { depth = 0.09, sideColor = 0xdfe6ef } = {}) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(wu, hu, depth, 5, 0.1),
    new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.45, metalness: 0.0, transparent: true }));
  body.castShadow = true; body.receiveShadow = false;
  const cv = canvasFor(wu, hu); draw(cv.getContext('2d'), cv.width, cv.height);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu),
    new THREE.MeshStandardMaterial({ map: texFrom(cv), roughness: 0.5, transparent: true }));
  face.position.z = depth / 2 + 0.003; face.receiveShadow = true; face.renderOrder = 1;
  group.add(body, face);
  group.userData.mats = [body.material, face.material];
  scene.add(group); allCards.push(group);
  return group;
}
// plano decorativo (chip, sello, fila) que vive sobre una tarjeta
function makeDecal(parent, wu, hu, draw, ppu = PPU) {
  const cv = canvasFor(wu, hu, ppu); draw(cv.getContext('2d'), cv.width, cv.height);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu), new THREE.MeshStandardMaterial({ map: texFrom(cv), transparent: true, roughness: 0.5 }));
  m.material.depthWrite = false; m.renderOrder = 2; // evita que el área transparente tape la cara
  m.receiveShadow = true; parent.add(m); parent.userData.mats.push(m.material); return m;
}
function applyPose(obj, p) {
  obj.position.set(p.x, p.y, p.z); obj.rotation.set(p.rx, p.ry, p.rz); obj.scale.setScalar(p.s);
  for (const m of obj.userData.mats || []) {
    m.opacity = p.o;
    if (!m.userData.base) m.userData.base = m.color.clone();
    m.color.copy(m.userData.base).multiplyScalar(p.d);
  }
  obj.visible = p.o > 0.005;
}

// Cotizaciones de fondo (todas ficticias)
const QUOTES = [
  { id: 'COT-0139', title: 'Volantes · 2,000 piezas', sub: 'Cliente: Ejemplo B', chip: ['Sin seguimiento', C.paper2, C.gray] },
  { id: 'COT-0140', title: 'Tarjetas · 1,000 piezas', sub: 'Cliente: Ejemplo C', chip: ['¿Respuesta?', '#FFF1E6', C.orangeDark] },
  { id: 'COT-0141', title: 'Lona · 3 × 2 m', sub: 'Cliente: Ejemplo D', chip: ['Sin responsable', C.paper2, C.gray] },
  { id: 'COT-0143', title: 'Cajas plegadizas · 300', sub: 'Cliente: Ejemplo E', chip: ['Enviada', '#E7EEFD', C.blue] },
];
function drawQuoteBase(g, w, h, q, accent) {
  paperBase(g, w, h);
  g.fillStyle = accent; rrect(g, 0, 0, 22, h, [44, 0, 0, 44]); g.fill();
  text(g, 'COTIZACIÓN', 84, 112, { weight: 700, size: 40, color: C.teal, spacing: 5 });
  text(g, q.id, w - 84, 112, { weight: 600, size: 40, color: C.grayLight, align: 'right' });
  text(g, q.title, 84, 252, { weight: 800, size: 104, color: C.navy, maxW: w - 168 });
  text(g, q.sub, 84, 352, { weight: 500, size: 54, color: C.gray, maxW: w - 168 });
  if (q.sub2) text(g, q.sub2, 84, 428, { weight: 500, size: 54, color: C.gray, maxW: w - 168 });
  g.fillStyle = C.line; g.fillRect(84, 500, w - 168, 3);
  text(g, 'ESTADO', 84, 588, { weight: 700, size: 36, color: C.grayLight, spacing: 4 });
}
const CW = 3.6, CH = 2.2;
const bgCards = QUOTES.map((q) => makeCard(CW, CH, (g, w, h) => {
  drawQuoteBase(g, w, h, q, '#C9D4E3');
  pill(g, 84, 700, q.chip[0], { bg: q.chip[1], fg: q.chip[2] });
}));

// Cotización protagonista
const HERO = { id: 'COT-0142', title: 'Etiquetas · 500 piezas', sub: 'Cliente: Ejemplo A', sub2: 'Papel adhesivo · 5 × 5 cm' };
const hero = makeCard(CW, CH, (g, w, h) => drawQuoteBase(g, w, h, HERO, C.teal));
const CHIP_STATES = [
  ['Cotizada', C.paper2, C.gray],
  ['Enviada', '#E7EEFD', C.blue],
  ['Esperando respuesta', '#FFF1E6', C.orangeDark],
];
const chips = CHIP_STATES.map(([label, bg, fg]) => {
  const m = makeDecal(hero, 3.0, 0.34, (g) => pill(g, 0, 68, label, { bg, fg, size: 56, h: 112 }));
  m.position.set(-1.59 + 1.5, 1.1 - 700 / PPU, 0.06); return m;
});

// Panel: próxima acción
const action = makeCard(3.3, CH, (g, w, h) => {
  paperBase(g, w, h);
  g.fillStyle = C.orange; rrect(g, 0, 0, 22, h, [44, 0, 0, 44]); g.fill();
  text(g, 'PRÓXIMA ACCIÓN', 84, 112, { weight: 700, size: 40, color: C.teal, spacing: 5 });
  text(g, 'Revisar mañana', 84, 252, { weight: 800, size: 108, color: C.navy, maxW: w - 168 });
  calendarIcon(g, 86, 300, 66, C.gray);
  text(g, 'Martes · 10:00 a. m.', 182, 358, { weight: 500, size: 54, color: C.gray, maxW: w - 270 });
  g.fillStyle = C.line; g.fillRect(84, 430, w - 168, 3);
  text(g, 'RESPONSABLE', 84, 520, { weight: 700, size: 36, color: C.grayLight, spacing: 4 });
  g.fillStyle = C.teal; g.beginPath(); g.arc(150, 666, 66, 0, Math.PI * 2); g.fill();
  text(g, 'AL', 150, 686, { weight: 800, size: 56, color: '#fff', align: 'center' });
  text(g, 'Ana López', 252, 654, { weight: 800, size: 66, color: C.navy, maxW: w - 340 });
  text(g, 'Ventas · ficticia', 252, 722, { weight: 500, size: 46, color: C.gray, maxW: w - 340 });
});

// Panel: borrador de seguimiento
const DW = 4.4, DH = 2.7;
const draft = makeCard(DW, DH, (g, w, h) => {
  paperBase(g, w, h);
  g.fillStyle = C.teal; rrect(g, 0, 0, 22, h, [44, 0, 0, 44]); g.fill();
  text(g, 'BORRADOR DE SEGUIMIENTO', 84, 112, { weight: 700, size: 40, color: C.teal, spacing: 5 });
  pill(g, w - 84 - 330, 98, 'No enviado', { bg: null, fg: C.gray, size: 38, h: 72, dot: true, outline: '#C9D4E3' });
  text(g, 'Para: Cliente Ejemplo A  ·  Etiquetas · 500 piezas', 84, 196, { weight: 500, size: 44, color: C.gray, maxW: w - 168 });
  // mensaje
  g.fillStyle = C.paper2; rrect(g, 84, 240, 1010, 600, 30); g.fill();
  g.strokeStyle = C.line; g.lineWidth = 3; rrect(g, 84, 240, 1010, 600, 30); g.stroke();
  const n = wrap(g, 'Hola, buen día. Le escribo para dar seguimiento a la cotización de etiquetas (500 piezas). ¿Tiene alguna duda o algún ajuste que quiera hacer?',
    130, 330, 920, 80, { weight: 500, size: 54, color: C.navy });
  text(g, '— Ana, Ventas', 130, 330 + n * 80 + 30, { weight: 600, size: 50, color: C.gray });
  // columna de aprobación (el sello cae aquí)
  g.setLineDash([18, 12]); g.strokeStyle = '#C9D4E3'; g.lineWidth = 4; rrect(g, 1140, 240, 536, 600, 30); g.stroke(); g.setLineDash([]);
  text(g, 'Requiere aprobación', 1408, 800, { weight: 600, size: 38, color: C.grayLight, align: 'center', maxW: 480 });
  // botones (estáticos: la decisión es humana)
  g.strokeStyle = C.navy; g.lineWidth = 4; rrect(g, 84, 900, 270, 110, 55); g.stroke();
  text(g, 'Editar', 219, 972, { weight: 700, size: 46, color: C.navy, align: 'center' });
  g.fillStyle = C.navy; rrect(g, 384, 900, 470, 110, 55); g.fill();
  text(g, 'Aprobar y enviar', 619, 972, { weight: 700, size: 46, color: '#fff', align: 'center', maxW: 420 });
});
const stamp = makeDecal(draft, 1.36, 0.82, (g, w, h) => {
  const col = C.orange;
  g.strokeStyle = col; g.lineWidth = 14; rrect(g, 10, 10, w - 20, h - 20, 40); g.stroke();
  g.lineWidth = 5; rrect(g, 32, 32, w - 64, h - 64, 26); g.stroke();
  g.fillStyle = 'rgba(255,138,61,0.10)'; rrect(g, 32, 32, w - 64, h - 64, 26); g.fill();
  personIcon(g, w / 2, 150, 110, col);
  text(g, 'REVISIÓN', w / 2, 332, { weight: 800, size: 104, color: col, align: 'center', spacing: 6, maxW: w - 100 });
  text(g, 'HUMANA', w / 2, 438, { weight: 800, size: 104, color: col, align: 'center', spacing: 6, maxW: w - 100 });
}, 600);
stamp.position.set(1408 / PPU - DW / 2, DH / 2 - 520 / PPU, 0.07);
stamp.castShadow = true;

// Panel: historial / registro
const LW = 4.0, LH = 2.6;
const log = makeCard(LW, LH, (g, w, h) => {
  paperBase(g, w, h);
  g.fillStyle = C.teal; rrect(g, 0, 0, 22, h, [44, 0, 0, 44]); g.fill();
  text(g, 'HISTORIAL', 84, 112, { weight: 700, size: 40, color: C.teal, spacing: 5 });
  text(g, 'Etiquetas · 500 piezas', w - 84, 112, { weight: 600, size: 42, color: C.gray, align: 'right' });
});
const ROWS = [
  { label: 'Cotización enviada', right: 'Lunes', icon: (g) => checkIcon(g, 96, 104, 44, C.blue) },
  { label: 'Seguimiento realizado', right: 'Miércoles', icon: (g) => checkIcon(g, 96, 104, 44, C.teal) },
  { label: 'Resultado por confirmar', right: 'Pendiente', icon: (g) => hourglass(g, 96, 104, 54, C.orangeDark), pending: true },
];
const rows = ROWS.map((r, i) => {
  const m = makeDecal(log, 3.6, 0.52, (g, w, h) => {
    if (r.pending) {
      g.fillStyle = '#FFF7F0'; rrect(g, 4, 4, w - 8, h - 8, 34); g.fill();
      g.setLineDash([18, 12]); g.strokeStyle = C.orange; g.lineWidth = 5; rrect(g, 4, 4, w - 8, h - 8, 34); g.stroke(); g.setLineDash([]);
    } else { g.fillStyle = C.paper2; rrect(g, 4, 4, w - 8, h - 8, 34); g.fill(); }
    r.icon(g);
    text(g, r.label, 176, 124, { weight: 700, size: 62, color: r.pending ? C.orangeDark : C.navy, maxW: 900 });
    text(g, r.right, w - 50, 122, { weight: 600, size: 46, color: C.gray, align: 'right' });
  });
  m.position.set(0, LH / 2 - 0.74 - i * 0.62, 0.06); return m;
});

// Emblema final: bloque turquesa con chevrón ("siguiente paso") y punto naranja
const emblem = new THREE.Group();
{
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.3, 1.3, 0.34, 6, 0.24),
    new THREE.MeshPhysicalMaterial({ color: 0x067a6f, roughness: 0.55, clearcoat: 0.3, clearcoatRoughness: 0.4, transparent: true }));
  base.castShadow = true;
  const sh = new THREE.Shape();
  sh.moveTo(-0.3, 0.36); sh.lineTo(-0.08, 0.36); sh.lineTo(0.22, 0); sh.lineTo(-0.08, -0.36); sh.lineTo(-0.3, -0.36); sh.lineTo(0.0, 0); sh.closePath();
  const chev = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 }),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, transparent: true }));
  chev.position.set(-0.08, 0, 0.16); chev.castShadow = true;
  const dotM = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 16), new THREE.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.3, emissive: 0xff6a1a, emissiveIntensity: 0.35, transparent: true }));
  dotM.position.set(0.36, 0, 0.22);
  emblem.add(base, chev, dotM);
  emblem.userData.mats = [base.material, chev.material, dotM.material];
  scene.add(emblem);
}

// ───────────────────────── coreografía ─────────────────────────
// Fondo: posiciones de la escena 1 (dispersas alrededor del título)
const BG_LAYOUT = [
  { x: -4.7, y: -0.2, z: -1.2, ry: 0.22, rz: 0.03 },
  { x: 4.75, y: -0.1, z: -1.5, ry: -0.24, rz: -0.03 },
  { x: -3.9, y: -2.75, z: -0.3, ry: 0.16, rz: -0.02 },
  { x: 4.0, y: -2.8, z: -0.5, ry: -0.18, rz: 0.02 },
];
const BG_BACK = [ // escenas 2-5: al fondo, oscurecidas
  { x: -6.8, y: 0.9, z: -3.9, ry: 0.3 }, { x: 6.9, y: 1.3, z: -4.0, ry: -0.3 },
  { x: -6.6, y: -2.7, z: -3.6, ry: 0.28 }, { x: 6.8, y: -2.8, z: -3.7, ry: -0.28 },
];
const BG_END = [ // cierre: anillo amplio y oscuro detrás del emblema
  { x: -7.6, y: 2.4, z: -4.2, ry: 0.35 }, { x: 7.6, y: 2.4, z: -4.2, ry: -0.35 },
  { x: -7.4, y: -2.9, z: -4.0, ry: 0.3 }, { x: 7.4, y: -2.9, z: -4.0, ry: -0.3 },
];
const GHOST = 0.035, GHOST_END = 0.025; // factor lineal sobre el albedo (la luz principal satura el papel)
const bgTracks = bgCards.map((_, i) => {
  const L = BG_LAYOUT[i], B = BG_BACK[i], E = BG_END[i];
  const t0 = 0.35 + [0, 2, 1, 3][i] * 0.28;
  return track([
    [0, { x: L.x * 1.25, y: L.y - 5.5, z: L.z - 2, rx: 0.9, ry: L.ry, rz: L.rz, o: 0 }],
    [t0, { x: L.x * 1.25, y: L.y - 5.5, z: L.z - 2, rx: 0.9, ry: L.ry, rz: L.rz, o: 0 }],
    [t0 + 1.4, { ...L, rx: 0, o: 1 }],
    [4.4, { ...L, x: L.x * 1.03, rx: 0, o: 1 }],
    [5.6, { ...B, rx: 0, rz: 0, d: GHOST }],
    [20.9, { ...B, x: B.x * 1.02, rx: 0, rz: 0, d: GHOST }],
    [22.2, { ...E, rx: 0, rz: 0, d: GHOST_END }],
  ]);
});
const heroTrack = track([
  [0, { x: 0, y: -7.5, z: -1.5, rx: 1.0, o: 0 }],
  [0.6, { x: 0, y: -7.5, z: -1.5, rx: 1.0, o: 0 }],
  [2.2, { x: 0, y: -1.45, z: 0.2, rx: 0, o: 1 }],
  [4.4, { x: 0, y: -1.5, z: 0.35 }],
  [5.6, { x: 0, y: -0.05, z: 1.2 }],
  [9.2, { x: 0.05, y: -0.05, z: 1.25 }],
  [10.2, { x: -1.9, y: -0.15, z: 1.0, ry: 0.06 }],
  [13.1, { x: -1.95, y: -0.15, z: 1.0, ry: 0.06 }],
  [14.2, { x: -5.0, y: -1.2, z: -2.4, ry: 0.32, d: 0.06 }],
  [17.6, { x: -5.1, y: -1.2, z: -2.5, ry: 0.32, d: 0.06 }],
  [18.6, { x: -6.2, y: 2.6, z: -3.2, ry: 0.32, d: GHOST }],
  [20.9, { x: -6.25, y: 2.6, z: -3.2, ry: 0.32, d: GHOST }],
  [22.2, { x: -4.6, y: -3.4, z: -3.0, ry: 0.32, d: GHOST_END }],
]);
const actionTrack = track([
  [0, { x: -1.9, y: -0.15, z: 0.75, o: 0, s: 0.92 }],
  [9.5, { x: -1.9, y: -0.15, z: 0.75, o: 0, s: 0.92 }],
  [10.7, { x: 1.85, y: -0.15, z: 1.0, ry: -0.06, o: 1, s: 1 }],
  [13.1, { x: 1.9, y: -0.15, z: 1.0, ry: -0.06 }],
  [14.2, { x: 5.0, y: -1.2, z: -2.4, ry: -0.32, d: 0.06 }],
  [17.6, { x: 5.1, y: -1.2, z: -2.5, ry: -0.32, d: 0.06 }],
  [18.6, { x: 6.2, y: 2.6, z: -3.2, ry: -0.32, d: GHOST }],
  [20.9, { x: 6.25, y: 2.6, z: -3.2, ry: -0.32, d: GHOST }],
  [22.2, { x: 4.6, y: -3.4, z: -3.0, ry: -0.32, d: GHOST_END }],
]);
const draftTrack = track([
  [0, { x: 0, y: -5.2, z: 0.8, rx: -0.7, o: 0 }],
  [13.3, { x: 0, y: -5.2, z: 0.8, rx: -0.7, o: 0 }],
  [14.5, { x: 0, y: -0.05, z: 1.4, rx: 0, o: 1 }],
  [17.5, { x: 0.05, y: -0.05, z: 1.45 }],
  [18.5, { x: -5.0, y: -1.4, z: -2.4, ry: 0.35, d: 0.06 }],
  [20.9, { x: -5.05, y: -1.4, z: -2.4, ry: 0.35, d: 0.06 }],
  [22.2, { x: -3.2, y: 3.6, z: -4.2, ry: 0.25, d: GHOST_END }],
]);
const logTrack = track([
  [0, { x: 4.5, y: -0.6, z: 0.0, ry: -0.7, o: 0 }],
  [17.7, { x: 4.5, y: -0.6, z: 0.0, ry: -0.7, o: 0 }],
  [18.7, { x: 0, y: 0.0, z: 1.45, ry: 0, o: 1 }],
  [20.9, { x: 0.05, y: 0.0, z: 1.5 }],
  [22.2, { x: 3.2, y: 3.6, z: -4.2, ry: -0.25, d: GHOST_END }],
]);
const camTrack = track([
  [0, { x: 0, y: 0.2, z: 13.4, rx: 0, ry: -0.35 }], // rx/ry aquí = objetivo y (tx, ty)
  [4.4, { x: 0.35, y: 0.1, z: 11.6, rx: 0.1, ry: -0.45 }],
  [5.7, { x: 0.2, y: 0.25, z: 7.3, rx: 0, ry: 0.42 }],
  [9.1, { x: -0.25, y: 0.3, z: 7.1, rx: 0, ry: 0.42 }],
  [10.4, { x: 0, y: 0.35, z: 8.7, rx: 0, ry: 0.5 }],
  [13.0, { x: 0.35, y: 0.3, z: 8.5, rx: 0, ry: 0.5 }],
  [14.4, { x: 0, y: 0.3, z: 9.0, rx: 0, ry: 0.5 }],
  [17.4, { x: -0.35, y: 0.35, z: 8.8, rx: 0, ry: 0.5 }],
  [18.6, { x: 0.3, y: 0.35, z: 8.4, rx: 0, ry: 0.45 }],
  [20.8, { x: 0.45, y: 0.3, z: 8.2, rx: 0, ry: 0.45 }],
  [22.2, { x: 0, y: 0.7, z: 12.0, rx: 0, ry: 0.2 }],
  [24, { x: 0, y: 0.6, z: 11.3, rx: 0, ry: 0.2 }],
]);
const emblemTrack = track([
  [0, { x: 0, y: 1.8, z: 1.2, ry: -1.6, s: 0.4, o: 0 }],
  [21.2, { x: 0, y: 1.8, z: 1.2, ry: -1.6, s: 0.4, o: 0 }],
  [22.4, { x: 0, y: 1.8, z: 1.2, ry: 0, s: 1, o: 1 }],
]);

const $ = (id) => document.getElementById(id);
function setLayer(el, o, dy = 0) { el.style.opacity = o.toFixed(3); el.style.transform = `translateY(${(dy * (1 - o)).toFixed(1)}px)`; el.style.visibility = o < 0.003 ? 'hidden' : 'visible'; }

function update(t) {
  const float = (i, amp = 0.05) => Math.sin(t * 0.9 + i * 1.7) * amp;

  bgCards.forEach((c, i) => { const p = bgTracks[i](t); applyPose(c, { ...p, y: p.y + float(i), rz: p.rz + float(i + 3, 0.01) }); });

  const hp = heroTrack(t); applyPose(hero, { ...hp, y: hp.y + float(9, 0.035) });
  // chip de estado: cada cambio es un giro sobre X de 0.5 s
  const flips = [6.2, 7.7];
  let stateIdx = 0; let flipAngle = 0;
  flips.forEach((ft, k) => {
    const k01 = clamp((t - ft) / 0.5);
    if (k01 >= 0.5) stateIdx = k + 1;
    if (k01 > 0 && k01 < 1) flipAngle = Math.sin(k01 * Math.PI) * (Math.PI / 2);
  });
  chips.forEach((m, i) => { m.visible = hero.visible && i === stateIdx; m.rotation.x = flipAngle; });

  applyPose(action, actionTrack(t));
  applyPose(draft, draftTrack(t));
  // sello: cae a las 15.1 s
  const sk = clamp((t - 15.1) / 0.45);
  const so = clamp((t - 15.1) / 0.18);
  stamp.material.opacity = so * draft.userData.mats[0].opacity;
  stamp.visible = draft.visible && t > 15.1;
  stamp.position.z = lerp(1.6, 0.075, Math.pow(sk, 2));
  stamp.scale.setScalar(sk < 1 ? lerp(1.8, 1, Math.pow(sk, 2)) * (1 + 0.06 * Math.sin(clamp((t - 15.55) / 0.3) * Math.PI)) : 1 + 0.06 * Math.sin(clamp((t - 15.55) / 0.3) * Math.PI));
  stamp.rotation.z = lerp(-0.42, -0.12, easeOutBack(sk));

  applyPose(log, logTrack(t));
  const rowIn = [17.9, 18.8, 19.7];
  rows.forEach((m, i) => {
    const k = seg(t, rowIn[i], rowIn[i] + 0.5);
    m.material.opacity = k * log.userData.mats[0].opacity;
    m.position.x = lerp(0.6, 0, k); m.visible = log.visible && k > 0.005;
    m.position.z = 0.06 + (i === 1 ? 0.04 * Math.sin(clamp((t - 19.3) / 0.6) * Math.PI) : 0);
  });

  const ep = emblemTrack(t);
  applyPose(emblem, { ...ep, ry: ep.ry + (t > 22.4 ? Math.sin((t - 22.4) * 0.9) * 0.18 : 0), rx: -0.08 + float(2, 0.03) });

  // cámara + parallax suave + pequeño impacto del sello
  const cp = camTrack(t);
  const shake = Math.exp(-Math.max(0, t - 15.5) * 9) * (t > 15.5 ? 1 : 0) * 0.035;
  camera.position.set(cp.x + Math.sin(t * 0.55) * 0.14, cp.y + Math.sin(t * 0.42 + 1) * 0.07 + Math.sin(t * 40) * shake, cp.z);
  camera.lookAt(cp.rx + Math.sin(t * 0.55) * 0.04, cp.ry, 0.6);

  dust.position.set(Math.sin(t * 0.2) * 0.3, t * 0.04, 0);
  rimOrange.intensity = 45 + 30 * window01(t, 15.0, 16.6, 0.2, 0.8);

  // capas HTML
  const capVis = Math.max(window01(t, 5.2, 8.9, 0.6, 0.4), window01(t, 9.9, 12.9, 0.6, 0.4), window01(t, 13.8, 17.3, 0.6, 0.4), window01(t, 18.1, 20.7, 0.6, 0.4));
  $('scrimTop').style.opacity = capVis.toFixed(3);
  $('scrimEnd').style.opacity = seg(t, 21.4, 22.6).toFixed(3);
  setLayer($('headline'), window01(t, 0.7, 4.0, 0.7, 0.5), 30);
  setLayer($('cap2'), window01(t, 5.4, 8.9, 0.6, 0.4), 24);
  setLayer($('cap3'), window01(t, 10.1, 12.9, 0.6, 0.4), 24);
  setLayer($('cap4'), window01(t, 14.0, 17.3, 0.6, 0.4), 24);
  setLayer($('cap5'), window01(t, 18.3, 20.7, 0.6, 0.4), 24);
  const endO = seg(t, 22.0, 22.8);
  setLayer($('end'), endO, 26);
  $('end').querySelector('.tag').style.opacity = seg(t, 22.5, 23.2).toFixed(3);
  $('end').querySelector('.small').style.opacity = seg(t, 22.9, 23.5).toFixed(3);
  setLayer($('corner'), (1 - seg(t, 21.4, 21.9)) * seg(t, 0.3, 1.0), 0);
  $('fade').style.opacity = (1 - seg(t, 0, 0.6)).toFixed(3);
}

window.renderAt = (t) => new Promise((resolve) => {
  update(t);
  renderer.render(scene, camera);
  requestAnimationFrame(() => requestAnimationFrame(resolve));
});
window.DURATION = DURATION;

window.sceneReady = true;
