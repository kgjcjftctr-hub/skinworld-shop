#!/usr/bin/env node
/**
 * Convierte el video (o la carpeta de cuadros) de una persona en las
 * secuencias que usa la sección de necesidades, y la registra en
 * src/data/personas-necesidades.json. Ver docs/personas-necesidades.md.
 *
 *   node --experimental-websocket scripts/preparar-persona.mjs <slug> <video|carpeta> [opciones]
 *
 * Opciones:
 *   --despues <video|carpeta>   segunda secuencia alineada (modo 'doble')
 *   --fondo transparente|solido  por defecto: transparente si los cuadros traen alfa
 *   --mejora 0.35,0.68           tramo del giro en el que ocurre la mejora
 *   --salida <carpeta>           escribir en otra carpeta y no tocar el manifiesto (prueba)
 *
 * Los videos se decodifican con Google Chrome en modo sin ventana, así que no
 * hace falta ffmpeg. Las imágenes se procesan con sharp (ya viene con Next.js).
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFIESTO = path.join(RAIZ, 'src/data/personas-necesidades.json');
const SLUGS = ['acne', 'dermatitis', 'antiedad', 'manchas', 'cabello-y-unas', 'piel-de-bebe', 'proteccion-solar', 'suplementos'];
const PERFILES = { escritorio: { alto: 1100, cuadros: 48, calidad: 78 }, movil: { alto: 760, cuadros: 32, calidad: 74 } };
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = process.argv.slice(2);
const opcion = (nombre) => {
  const i = args.indexOf(nombre);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const despuesEntrada = opcion('--despues');
const fondoPedido = opcion('--fondo');
const mejora = (opcion('--mejora') ?? '0.35,0.68').split(',').map(Number);
const salidaPrueba = opcion('--salida');
const [slug, entrada] = args;

if (!slug || !entrada) {
  console.error('Uso: node --experimental-websocket scripts/preparar-persona.mjs <slug> <video|carpeta> [--despues ...] [--fondo ...] [--mejora a,b] [--salida carpeta]');
  console.error('Slugs: ' + SLUGS.join(', '));
  process.exit(1);
}
if (!salidaPrueba && !SLUGS.includes(slug)) {
  console.error(`"${slug}" no es una categoría. Usa uno de: ${SLUGS.join(', ')}`);
  process.exit(1);
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const esVideo = (p) => /\.(mp4|mov|m4v|webm)$/i.test(p) && statSync(p).isFile();

/** Extrae `n` cuadros repartidos en todo el video, como PNG en memoria. */
async function cuadrosDeVideo(archivo, n) {
  const puerto = 9600 + Math.floor(Math.random() * 300);
  const perfil = path.join(RAIZ, '.next', `chrome-persona-${puerto}`);
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${puerto}`, '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${perfil}`, 'about:blank'], { stdio: 'ignore' });
  try {
    let ws;
    for (let i = 0; i < 80 && !ws; i++) {
      await espera(250);
      try {
        const lista = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json();
        const pagina = lista.find((t) => t.type === 'page');
        if (pagina) ws = new WebSocket(pagina.webSocketDebuggerUrl);
      } catch {}
    }
    if (!ws) throw new Error('No se pudo abrir Chrome');
    await new Promise((r) => ws.addEventListener('open', r));
    let id = 0;
    const pendientes = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
    });
    const cdp = (method, params = {}) => new Promise((r) => { const k = ++id; pendientes.set(k, r); ws.send(JSON.stringify({ id: k, method, params })); });
    const ev = async (expr) => {
      const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'error en Chrome');
      return r.result?.result?.value;
    };
    // Página local junto al perfil temporal: desde file:// Chrome puede leer
    // el video y copiar sus cuadros a un canvas sin restricciones de origen.
    const html = `<!doctype html><video id="v" muted playsinline preload="auto" src="${pathToFileURL(path.resolve(archivo)).href}"></video><canvas id="c"></canvas>`;
    mkdirSync(perfil, { recursive: true });
    const pagina = path.join(perfil, 'extraer.html');
    writeFileSync(pagina, html);
    await cdp('Page.navigate', { url: pathToFileURL(pagina).href });
    await espera(800);
    const duracion = await ev(`new Promise((ok, mal) => { const v = document.getElementById('v'); if (v.readyState >= 1) ok(v.duration); v.onloadedmetadata = () => ok(v.duration); v.onerror = () => mal(new Error('Chrome no pudo leer el video')); setTimeout(() => mal(new Error('El video no cargó')), 15000); })`);
    const cuadros = [];
    for (let k = 0; k < n; k++) {
      // Se evita el último instante exacto, que algunos videos no tienen.
      const t = (duracion - 0.04) * (k / (n - 1));
      const datos = await ev(`new Promise((ok) => { const v = document.getElementById('v'); const c = document.getElementById('c'); v.onseeked = () => { c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); ok(c.toDataURL('image/png')); }; v.currentTime = ${t}; })`);
      cuadros.push(Buffer.from(datos.split(',')[1], 'base64'));
      process.stdout.write(`\r  video: cuadro ${k + 1}/${n}`);
    }
    process.stdout.write('\n');
    ws.close();
    return cuadros;
  } finally {
    chrome.kill();
    await espera(300);
    rmSync(perfil, { recursive: true, force: true });
  }
}

/** Lee una carpeta de imágenes en orden y toma `n` repartidas. */
function cuadrosDeCarpeta(carpeta, n) {
  const archivos = readdirSync(carpeta)
    .filter((f) => /\.(png|jpe?g|webp|avif|tiff?)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (archivos.length < 2) throw new Error(`La carpeta ${carpeta} necesita al menos 2 imágenes`);
  return Array.from({ length: n }, (_, k) => readFileSync(path.join(carpeta, archivos[Math.round((k / (n - 1)) * (archivos.length - 1))])));
}

async function leerCuadros(fuente, n) {
  if (!existsSync(fuente)) throw new Error(`No existe ${fuente}`);
  return esVideo(fuente) ? cuadrosDeVideo(fuente, n) : cuadrosDeCarpeta(fuente, n);
}

async function escribirSecuencia(cuadros, carpeta, perfil, fondo) {
  rmSync(carpeta, { recursive: true, force: true });
  mkdirSync(carpeta, { recursive: true });
  const { alto, cuadros: n, calidad } = PERFILES[perfil];
  const ancho = Math.round((alto * 3) / 4);
  let peso = 0;
  for (let k = 0; k < n; k++) {
    const fuente = cuadros[Math.round((k / (n - 1)) * (cuadros.length - 1))];
    const salida = path.join(carpeta, `${String(k + 1).padStart(4, '0')}.webp`);
    await sharp(fuente)
      .resize(ancho, alto, fondo === 'transparente' ? { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } } : { fit: 'cover', position: 'centre' })
      .webp({ quality: calidad, alphaQuality: 90, effort: 5 })
      .toFile(salida);
    peso += statSync(salida).size;
  }
  return { cuadros: n, ancho, alto, peso };
}

const ruta = (carpeta) => '/' + path.relative(path.join(RAIZ, 'public'), carpeta).split(path.sep).join('/');

const n = PERFILES.escritorio.cuadros;
console.log(`Preparando "${slug}" desde ${entrada}`);
const antes = await leerCuadros(entrada, n);
const despues = despuesEntrada ? await leerCuadros(despuesEntrada, n) : null;
// Los PNG que salen del video siempre traen canal alfa; lo que importa es si se usa.
const conAlfa = !(await sharp(antes[0]).stats()).isOpaque;
const fondo = fondoPedido ?? (conAlfa ? 'transparente' : 'solido');

const base = salidaPrueba ? path.resolve(salidaPrueba) : path.join(RAIZ, 'public', 'necesidades', 'personas', slug);
const entrada_ = { modo: despues ? 'doble' : 'unica', fondo, mejora };
let pesoTotal = 0;
for (const perfil of ['escritorio', 'movil']) {
  const r = await escribirSecuencia(antes, path.join(base, perfil), perfil, fondo);
  pesoTotal += r.peso;
  entrada_[perfil] = { cuadros: r.cuadros, ancho: r.ancho, alto: r.alto, ruta: ruta(path.join(base, perfil)), formato: 'webp' };
  if (despues) {
    const d = await escribirSecuencia(despues, path.join(base, 'despues', perfil), perfil, fondo);
    pesoTotal += d.peso;
    entrada_.despues ??= {};
    entrada_.despues[perfil] = { cuadros: d.cuadros, ancho: d.ancho, alto: d.alto, ruta: ruta(path.join(base, 'despues', perfil)), formato: 'webp' };
  }
}
console.log(`  listo: ${(pesoTotal / 1e6).toFixed(1)} MB en total (fondo ${fondo}, modo ${entrada_.modo})`);

if (salidaPrueba) {
  console.log(`  prueba: cuadros en ${base}; el manifiesto no se tocó`);
} else {
  const manifiesto = JSON.parse(readFileSync(MANIFIESTO, 'utf8'));
  manifiesto.personas[slug] = entrada_;
  writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2) + '\n');
  console.log(`  manifiesto actualizado: ${slug} ya se muestra en la sección`);
}
