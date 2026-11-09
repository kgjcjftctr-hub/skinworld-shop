// Render determinista de scene.html con Chromium headless (Playwright) → ffmpeg (H.264).
//   node render.mjs --stills 0.5,3,7,...   → PNG sueltos en frames_debug/ (revisión)
//   node render.mjs --video out.mp4         → video completo sin audio, 30 fps
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // Playwright preinstalado globalmente

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIRS = ['/usr/share/fonts/opentype/inter', path.join(ROOT, 'fonts')];
const FPS = 30;
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.otf': 'font/otf', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, url === '/' ? 'scene.html' : url);
  if (url.startsWith('/fonts/')) file = FONT_DIRS.map((d) => path.join(d, path.basename(url))).find((f) => fs.existsSync(f));
  if (!file || !file.startsWith('/') || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(base);
await page.waitForFunction(() => window.sceneReady === true, null, { timeout: 60000 }).catch(() => {
  console.error(logs.join('\n')); process.exit(1);
});
const duration = await page.evaluate(() => window.DURATION);

async function shot(t) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
}

if (opt('--stills')) {
  const dir = path.join(ROOT, 'frames_debug'); fs.mkdirSync(dir, { recursive: true });
  for (const t of opt('--stills').split(',').map(Number)) {
    fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`), await shot(t));
    console.log('still', t);
  }
} else if (opt('--video')) {
  const out = opt('--video');
  const total = Math.round(duration * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    const buf = await shot(f / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
  console.log('video listo', out);
}
if (logs.some((l) => l.includes('error'))) console.error(logs.join('\n'));
await browser.close();
server.close();
