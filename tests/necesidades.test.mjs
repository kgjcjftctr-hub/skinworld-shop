import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const cargar = async (file, reemplazos = []) => {
  let source = readFileSync(new URL('../src/components/sections/' + file, import.meta.url), 'utf8');
  for (const [a, b] of reemplazos) source = source.replace(a, b);
  return import('data:text/javascript;base64,' + Buffer.from(ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext })).toString('base64'));
};
const manifiesto = JSON.parse(readFileSync(new URL('../src/data/personas-necesidades.json', import.meta.url), 'utf8'));
const t = await cargar('necesidades-timeline.ts');
const personas = await cargar('necesidades-personas.ts', [["import manifiesto from '@/data/personas-necesidades.json';", `const manifiesto = ${JSON.stringify(manifiesto)};`]]);

const muestras = Array.from({ length: 20001 }, (_, k) => k / 20000);

test('el mismo scroll da el mismo estado (reversible, sin estado interno)', () => {
  const ida = muestras.map(p => JSON.stringify(t.estadoAnillos(p)));
  const vuelta = [...muestras].reverse().map(p => JSON.stringify(t.estadoAnillos(p))).reverse();
  assert.deepEqual(ida, vuelta);
});

test('los 16 estados aparecen en orden y siempre problema → piel perfecta', () => {
  let ultimo = 0;
  const vistos = new Set();
  for (const p of muestras) {
    const e = t.estadoAnillos(p);
    assert.ok(e.estado >= ultimo && e.estado <= ultimo + 1, `salto en p=${p}`);
    ultimo = e.estado;
    vistos.add(e.estado);
  }
  assert.deepEqual([...vistos].sort((a, b) => a - b), Array.from({ length: 16 }, (_, i) => i));
});

test('la foto solo cambia cuando el anillo principal la tapa', () => {
  let previo = t.estadoAnillos(0);
  for (const p of muestras) {
    const e = t.estadoAnillos(p);
    if (e.estado !== previo.estado) {
      assert.ok(t.cierre(e.giro) > 0.995 && t.cierre(previo.giro) > 0.995, `cambio visible en p=${p}`);
    }
    assert.ok(e.giro >= previo.giro - 1e-9, 'el giro solo avanza al bajar');
    previo = e;
  }
});

test('el índice llega al problema con el rostro a la vista, luego la piel perfecta', () => {
  for (let i = 0; i < 8; i++) {
    const e = t.estadoAnillos(t.destinoNecesidad(i));
    assert.equal(e.estado, 2 * i);
    assert.ok(t.cierre(e.giro) < 0.05, 'anillo de frente: no tapa el rostro');
    assert.equal(t.indiceNecesidad(t.destinoNecesidad(i)), i);
    const despues = t.estadoAnillos(t.inicioNecesidad(i) + 0.075);
    assert.equal(despues.estado, 2 * i + 1);
    assert.ok(t.cierre(despues.giro) < 0.05);
  }
});

test('las ocho categorías tienen su problema, todas la misma piel perfecta, y cada ruta existe', () => {
  const nombres = ['Acné', 'Dermatitis', 'Antiedad', 'Manchas', 'Cabello y Uñas', 'Piel de Bebé', 'Protección Solar', 'Suplementos'];
  for (const nombre of nombres) {
    const e = personas.estadosDe(nombre);
    assert.ok(e, nombre);
    assert.equal(e.despues, personas.estadosDe('Acné').despues);
    for (const ruta of [e.antes.escritorio, e.antes.movil, e.despues.escritorio, e.despues.movil]) {
      assert.ok(readFileSync(new URL('../public' + ruta, import.meta.url)).length > 10000, ruta);
    }
  }
  assert.equal(personas.estadosDe('Otra'), null);
});

test('la precarga solo conserva las fotos pedidas', async () => {
  const creadas = [];
  globalThis.Image = class { constructor() { creadas.push(this); this.naturalWidth = 900; } decode() { return Promise.resolve(); } };
  const pre = new personas.Precarga();
  pre.pedir(['/a', '/b', null]);
  await new Promise(r => setTimeout(r, 0));
  assert.ok(pre.lista('/a') && pre.lista('/b'));
  pre.pedir(['/b', '/c']);
  await new Promise(r => setTimeout(r, 0));
  assert.ok(!pre.lista('/a') && pre.lista('/b') && pre.lista('/c'));
  assert.equal(creadas.length, 3);
  pre.vaciar();
  assert.ok(!pre.lista('/b'));
});
