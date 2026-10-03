import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Genera el documento con las tres políticas legales de Skinworld (Word y PDF) a
// partir de los mismos textos que muestra el sitio, para que nunca difieran.
//   node scripts/generar-politicas.mjs
// Usa textutil (macOS) para el .docx y Google Chrome sin pantalla para el PDF.
const raiz = resolve(import.meta.dirname, '..');
const salida = resolve(raiz, 'docs/politicas');

const esc = (v) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function leerSecciones(archivo) {
  const fuente = await readFile(resolve(raiz, archivo), 'utf8');
  const ini = fuente.indexOf('const secciones: SeccionLegal[] = ');
  const fin = fuente.indexOf('\n];', ini);
  const literal = fuente.slice(ini + 'const secciones: SeccionLegal[] = '.length, fin + 2);
  return new Function(`return ${literal}`)();
}
async function leerActualizacion(archivo) {
  const fuente = await readFile(resolve(raiz, archivo), 'utf8');
  return fuente.match(/actualizacion="([^"]+)"/)[1];
}

const politicas = [
  { n: 1, titulo: 'Aviso de Privacidad', archivo: 'src/app/privacidad/page.tsx' },
  { n: 2, titulo: 'Términos y Condiciones', archivo: 'src/app/terminos/page.tsx' },
  { n: 3, titulo: 'Política de Envíos, Devoluciones, Reembolsos y Cancelaciones', archivo: 'src/app/envios/page.tsx' },
];

let cuerpo = '';
for (const p of politicas) {
  const secciones = await leerSecciones(p.archivo);
  const fecha = await leerActualizacion(p.archivo);
  cuerpo += `<h1 class="${p.n > 1 ? 'nueva' : ''}">${p.n}. ${esc(p.titulo)}</h1><p class="fecha">Última actualización: ${esc(fecha)}</p>`;
  for (const s of secciones) {
    cuerpo += `<h2>${esc(s.titulo)}</h2>`;
    for (const b of s.bloques) {
      cuerpo += Array.isArray(b)
        ? `<ul>${b.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`
        : `<p>${esc(b).replaceAll('\n', '<br>')}</p>`;
    }
  }
}

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Políticas de Skinworld</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.5;color:#241b1e;max-width:700px;margin:0 auto}
  .portada{text-align:center;padding:90px 0 60px}
  .portada h1{font-size:28pt;margin:0 0 8px}
  .portada p{margin:4px 0;color:#6c5c60}
  h1{font-size:18pt;margin:0 0 4px;color:#241b1e}
  h1.nueva{page-break-before:always}
  h2{font-size:13pt;margin:20px 0 6px;color:#8d4f62}
  .fecha{color:#6c5c60;font-size:10pt;margin:0 0 14px}
  p{margin:6px 0} ul{margin:6px 0 6px 18px;padding:0} li{margin:3px 0}
</style></head><body>
<div class="portada"><h1>Políticas de Skinworld</h1>
<p>Aviso de Privacidad · Términos y Condiciones · Política de Envíos, Devoluciones, Reembolsos y Cancelaciones</p>
<p>Karina Alfaro López, nombre comercial Skinworld · skinworld.shop</p></div>
${cuerpo}</body></html>`;

await mkdir(salida, { recursive: true });
const rutaHtml = resolve(salida, 'politicas-skinworld.html');
await writeFile(rutaHtml, html);
execFileSync('textutil', ['-convert', 'docx', '-output', resolve(salida, 'politicas-skinworld.docx'), rutaHtml]);

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (existsSync(chrome)) {
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
    `--print-to-pdf=${resolve(salida, 'politicas-skinworld.pdf')}`, `file://${rutaHtml}`,
  ], { stdio: 'ignore' });
}
console.log('Generado en docs/politicas/: politicas-skinworld.docx' + (existsSync(chrome) ? ' y .pdf' : ' (sin PDF: no se encontró Chrome)'));
