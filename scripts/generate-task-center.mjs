import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Genera el Centro de tareas de SkinWorld a partir de SKINWORLD_TASKS.json, que es la
// fuente de verdad. Produce dos archivos con el mismo contenido:
//   SKINWORLD_TASK_CENTER.html        documento completo, para abrirlo local
//   .artifact/task-center.html        sin <html>/<head>/<body>, para publicarlo
//                                     como artefacto (la plataforma pone esa
//                                     envoltura al publicar)
const raiz = resolve(import.meta.dirname, '..');
const datos = JSON.parse(await readFile(resolve(raiz, 'SKINWORLD_TASKS.json'), 'utf8'));

const esc = (v) =>
  String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const ESTADOS = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  requires_verification: 'Requiere verificación',
  completed: 'Terminada',
};
const TIPOS = {
  detected_problem: 'Problema detectado',
  improvement_suggestion: 'Mejora sugerida',
  requires_confirmation: 'Requiere confirmación',
};
const PRIORIDADES = {
  P0: 'Bloquea la venta',
  P1: 'Importante',
  P2: 'Deseable',
  P3: 'Cuando se pueda',
};

const tareas = [...datos.tasks].sort((a, b) => {
  const abierta = (t) => (t.status === 'completed' ? 1 : 0);
  return abierta(a) - abierta(b) || (abierta(a) === 0 && (a.id === 'SW-014' ? 1 : 0) - (b.id === 'SW-014' ? 1 : 0)) || a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id);
});
const abiertas = tareas.filter((t) => t.status !== 'completed');
const cuenta = (estado) => tareas.filter((t) => t.status === estado).length;
const porPrioridad = (p) => abiertas.filter((t) => t.priority === p).length;
const categorias = [...new Set(tareas.map((t) => t.category))].sort();
const avance = Math.round((cuenta('completed') / tareas.length) * 100);

// "Nuevo" = registrado por la inspección más reciente. Se compara contra
// `detectedIn` y no contra la fecha, porque dos inspecciones del mismo día
// darían el mismo día y marcarían como nuevo todo el registro.
const nuevas = abiertas.filter((t) => t.detectedIn === datos.lastInspectedAt);

const tarjeta = (t) => `
      <article class="tarea" data-estado="${esc(t.status)}" data-prioridad="${esc(t.priority)}" data-categoria="${esc(t.category)}">
        <div class="tarea-cab">
          <code>${esc(t.id)}</code>
          <div class="etiquetas">
            <span class="pill prio ${esc(t.priority)}" title="${esc(PRIORIDADES[t.priority] ?? '')}">${esc(t.priority)}</span>
            <span class="pill est ${esc(t.status)}">${esc(ESTADOS[t.status] ?? t.status)}</span>
          </div>
        </div>
        <h3>${esc(t.title)}</h3>
        <p class="clasif">${esc(t.category)} · ${esc(TIPOS[t.kind] ?? t.kind)}</p>
        <p class="detalle">${esc(t.details)}</p>
        <details>
          <summary>Origen, criterio de cierre e historial</summary>
          <div class="ficha">
            <p><strong>Dónde está</strong><br>${t.origin.map(esc).join('<br>')}</p>
            <p><strong>Terminada cuando</strong><br>${esc(t.doneWhen)}</p>
            <p><strong>Detectada</strong> ${esc(t.detectedAt)} · <strong>Actualizada</strong> ${esc(t.updatedAt)}</p>
            <ul>${t.history.map((h) => `<li><span>${esc(h.date)}</span> ${esc(h.note)}</li>`).join('')}</ul>
          </div>
        </details>
      </article>`;

const titulo = datos.title ?? 'Centro de tareas de SkinWorld';

const estilos = `
    /* Tablero de trabajo: resumen arriba, filtros fijos, rejilla de tarjetas.
       Paleta tomada del rosa y el oro de la tienda, sobre papel cálido. */
    :root{
      --papel:#f7f3f2; --tarjeta:#ffffff; --tinta:#241b1e; --tinta-suave:#6c5c60;
      --linea:#e7dcdc; --rosa:#bc7f8f; --oro:#b08d3c;
      --alto:#a33a3a; --medio:#a06a12; --bajo:#2b6ca3; --listo:#2c7350; --duda:#6f4a9c;
      --sombra:0 1px 2px rgba(36,27,30,.05), 0 8px 24px rgba(36,27,30,.05);
      --display:'Playfair Display',Georgia,'Times New Roman',serif;
      --texto:'Inter',ui-sans-serif,system-ui,-apple-system,sans-serif;
    }
    @media (prefers-color-scheme: dark){
      :root:not([data-theme="light"]){
        --papel:#171214; --tarjeta:#201a1c; --tinta:#f3ebec; --tinta-suave:#a99ba0;
        --linea:#342a2d; --rosa:#e0adb8; --oro:#d9b45e;
        --alto:#f0928f; --medio:#e2b45f; --bajo:#8dc0ea; --listo:#79d0a4; --duda:#c4a4ec;
        --sombra:0 1px 2px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.28);
        color-scheme: dark;
      }
    }
    :root[data-theme="dark"]{
      --papel:#171214; --tarjeta:#201a1c; --tinta:#f3ebec; --tinta-suave:#a99ba0;
      --linea:#342a2d; --rosa:#e0adb8; --oro:#d9b45e;
      --alto:#f0928f; --medio:#e2b45f; --bajo:#8dc0ea; --listo:#79d0a4; --duda:#c4a4ec;
      --sombra:0 1px 2px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.28);
      color-scheme: dark;
    }

    *{box-sizing:border-box}
    body{margin:0;background:var(--papel);color:var(--tinta);
      font:15px/1.6 var(--texto);-webkit-font-smoothing:antialiased}
    .hoja{max-width:1180px;margin:0 auto;padding-inline:16px;padding-block:32px 72px}
    h1,h2,h3{font-family:var(--display);text-wrap:balance;margin:0}
    h1{font-size:clamp(2rem,6vw,3rem);line-height:1.08;letter-spacing:-.015em}
    h2{font-size:1.35rem;margin:44px 0 14px}
    a{color:inherit}
    code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}

    .intro{max-width:64ch;color:var(--tinta-suave);margin:14px 0 0}
    .sello{margin:20px 0 0;font-size:.82rem;color:var(--tinta-suave);
      display:flex;flex-wrap:wrap;gap:6px 14px}
    .sello b{font-weight:600;color:var(--tinta)}

    .avance{margin-top:26px}
    .barra{height:9px;border-radius:99px;background:var(--linea);overflow:hidden}
    .barra i{display:block;height:100%;background:linear-gradient(90deg,var(--rosa),var(--oro))}
    .avance p{margin:9px 0 0;font-size:.85rem;color:var(--tinta-suave);
      font-variant-numeric:tabular-nums}

    .cifras{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
      gap:12px;margin-top:22px}
    .cifra{background:var(--tarjeta);border:1px solid var(--linea);border-radius:12px;
      padding:14px 16px;box-shadow:var(--sombra)}
    .cifra b{display:block;font-size:1.9rem;line-height:1.1;font-variant-numeric:tabular-nums}
    .cifra span{font-size:.82rem;color:var(--tinta-suave)}
    .cifra.p0 b{color:var(--alto)} .cifra.p1 b{color:var(--medio)}
    .cifra.duda b{color:var(--duda)} .cifra.listo b{color:var(--listo)}

    .aviso{background:var(--tarjeta);border:1px solid var(--linea);
      border-left:3px solid var(--oro);border-radius:10px;padding:16px 18px;
      box-shadow:var(--sombra)}
    .aviso p{margin:0 0 10px} .aviso p:last-child{margin-bottom:0}
    .aviso ul{margin:0;padding-left:20px} .aviso li{margin-bottom:7px}
    .aviso li span{color:var(--tinta-suave)}

    .chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
    .chips li{background:var(--tarjeta);border:1px solid var(--linea);border-radius:99px;
      padding:6px 12px;font-size:.83rem;box-shadow:var(--sombra)}
    .chips code{color:var(--rosa);font-weight:700;margin-right:6px}

    .filtros{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;
      background:var(--papel);padding-block:12px;border-bottom:1px solid var(--linea);
      margin-bottom:18px}
    .grupo{display:flex;flex-wrap:wrap;gap:7px;align-items:center;margin-bottom:8px}
    .grupo:last-child{margin-bottom:0}
    .grupo > b{font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;
      color:var(--tinta-suave);min-width:74px}
    .grupo button{font:inherit;font-size:.83rem;cursor:pointer;color:var(--tinta);
      background:var(--tarjeta);border:1px solid var(--linea);border-radius:99px;
      padding:5px 12px;transition:background .15s,border-color .15s}
    .grupo button:hover{border-color:var(--rosa)}
    .grupo button[aria-pressed="true"]{background:var(--tinta);color:var(--papel);
      border-color:var(--tinta)}
    .grupo button:focus-visible{outline:2px solid var(--rosa);outline-offset:2px}

    .rejilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px}
    .tarea{background:var(--tarjeta);border:1px solid var(--linea);border-radius:14px;
      padding:18px;box-shadow:var(--sombra);min-width:0}
    .tarea[data-prioridad="P0"]{border-left:3px solid var(--alto)}
    .tarea[data-estado="completed"]{opacity:.82}
    .tarea-cab{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .tarea-cab code{color:var(--rosa);font-weight:700;font-size:.86rem}
    .etiquetas{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}
    .pill{font-size:.71rem;font-weight:700;border-radius:99px;padding:3px 8px;
      border:1px solid currentColor;white-space:nowrap}
    .prio.P0{color:var(--alto)} .prio.P1{color:var(--medio)}
    .prio.P2{color:var(--bajo)} .prio.P3{color:var(--tinta-suave)}
    .est.pending{color:var(--medio)} .est.in_progress{color:var(--bajo)}
    .est.completed{color:var(--listo)} .est.requires_verification{color:var(--duda)}
    .tarea h3{font-size:1.08rem;line-height:1.3;margin:12px 0 4px}
    .clasif{margin:0;font-size:.82rem;color:var(--tinta-suave)}
    .detalle{margin:11px 0 0;color:var(--tinta-suave)}
    details{margin-top:13px;border-top:1px solid var(--linea);padding-top:11px}
    summary{cursor:pointer;font-weight:600;font-size:.87rem}
    summary:focus-visible{outline:2px solid var(--rosa);outline-offset:2px}
    .ficha{font-size:.86rem;color:var(--tinta-suave);overflow-wrap:anywhere}
    .ficha p{margin:11px 0} .ficha strong{color:var(--tinta)}
    .ficha ul{margin:11px 0 0;padding-left:18px}
    .ficha li{margin-bottom:6px} .ficha li span{color:var(--rosa);font-weight:600}
    .vacio{color:var(--tinta-suave);text-align:center;padding:34px 0}

    @media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
    @media (max-width:560px){
      .grupo > b{min-width:100%}
      .hoja{padding-block:24px 56px}
    }`;

const cuerpo = `
    <header>
      <h1>${esc(titulo)}</h1>
      <p class="intro">Panel maestro de pendientes de la tienda: lo que está roto, lo que se puede mejorar y lo que falta confirmar. Cada tarea conserva su identificador y su historial, así que se actualiza en lugar de duplicarse.</p>
      <p class="sello">
        <span>Última inspección <b>${esc(String(datos.lastInspectedAt).replace('T', ' a las ').slice(0, 22))}</b></span>
        <span>Por <b>${esc(datos.lastInspectedBy)}</b></span>
        <span>Fuente <b>SKINWORLD_TASKS.json</b></span>
      </p>

      <div class="avance">
        <div class="barra"><i style="width:${avance}%"></i></div>
        <p>${cuenta('completed')} de ${tareas.length} tareas terminadas · ${avance}% del registro histórico</p>
      </div>

      <div class="cifras">
        <div class="cifra p0"><b>${porPrioridad('P0')}</b><span>abiertas que bloquean la venta</span></div>
        <div class="cifra p1"><b>${porPrioridad('P1')}</b><span>abiertas importantes</span></div>
        <div class="cifra duda"><b>${cuenta('requires_verification')}</b><span>requieren verificación</span></div>
        <div class="cifra listo"><b>${cuenta('completed')}</b><span>terminadas y verificadas</span></div>
      </div>
    </header>

    <h2>Cómo leerlo</h2>
    <section class="aviso">
      <p><strong>Problema detectado.</strong> Confirmado leyendo el código o consultando la configuración real. No es una sospecha.</p>
      <p><strong>Mejora sugerida.</strong> Algo que se puede hacer mejor, pero hoy no está fallando.</p>
      <p><strong>Requiere confirmación.</strong> Depende de una prueba en vivo o de una decisión del negocio, no de escribir código.</p>
    </section>

    <h2>Nuevos pendientes detectados</h2>
    ${
      nuevas.length
        ? `<ul class="chips">${nuevas
            .map((t) => `<li><code>${esc(t.id)}</code>${esc(t.title)}</li>`)
            .join('')}</ul>`
        : '<section class="aviso"><p>La última inspección no encontró pendientes nuevos.</p></section>'
    }

    <h2>Tareas</h2>
    <div class="filtros">
      <div class="grupo" data-eje="estado">
        <b>Estado</b>
        <button data-valor="todo" aria-pressed="true">Todas (${tareas.length})</button>
        ${Object.entries(ESTADOS)
          .map(
            ([clave, nombre]) =>
              `<button data-valor="${clave}" aria-pressed="false">${esc(nombre)} (${cuenta(clave)})</button>`
          )
          .join('')}
      </div>
      <div class="grupo" data-eje="prioridad">
        <b>Prioridad</b>
        <button data-valor="todo" aria-pressed="true">Todas</button>
        ${Object.entries(PRIORIDADES)
          .map(
            ([clave, nombre]) =>
              `<button data-valor="${clave}" aria-pressed="false" title="${esc(nombre)}">${clave} · ${esc(nombre)}</button>`
          )
          .join('')}
      </div>
      <div class="grupo" data-eje="categoria">
        <b>Área</b>
        <button data-valor="todo" aria-pressed="true">Todas</button>
        ${categorias.map((c) => `<button data-valor="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}
      </div>
    </div>

    <div class="rejilla" id="rejilla">${tareas.map(tarjeta).join('')}</div>
    <p class="vacio" id="vacio" hidden>Ninguna tarea coincide con estos filtros.</p>

    <h2>Cambios recientes</h2>
    <section class="aviso">
      <ul>${datos.recentChanges
        .map((c) => `<li><span>${esc(c.date)}</span> — ${esc(c.summary)}</li>`)
        .join('')}</ul>
    </section>

    <h2>Cómo se mantiene</h2>
    <section class="aviso">
      <p><code>SKINWORLD_TASKS.json</code> es la fuente de verdad y vive en el repositorio. Esta página se genera con <code>node scripts/generate-task-center.mjs</code>.</p>
      <p>En cada sesión de trabajo: leer primero el JSON, inspeccionar el estado real, actualizar las tareas existentes por su identificador —nunca duplicarlas ni borrar las terminadas— y añadir solo hallazgos respaldados por evidencia. Las reglas completas están en <code>CLAUDE.md</code>.</p>
    </section>`;

const guion = `
    const filtros = { estado: 'todo', prioridad: 'todo', categoria: 'todo' };
    const tarjetas = [...document.querySelectorAll('.tarea')];
    const vacio = document.querySelector('#vacio');

    function aplicar() {
      let visibles = 0;
      for (const t of tarjetas) {
        const pasa =
          (filtros.estado === 'todo' || t.dataset.estado === filtros.estado) &&
          (filtros.prioridad === 'todo' || t.dataset.prioridad === filtros.prioridad) &&
          (filtros.categoria === 'todo' || t.dataset.categoria === filtros.categoria);
        t.hidden = !pasa;
        if (pasa) visibles++;
      }
      vacio.hidden = visibles > 0;
    }

    for (const grupo of document.querySelectorAll('.grupo[data-eje]')) {
      const eje = grupo.dataset.eje;
      grupo.addEventListener('click', (e) => {
        const boton = e.target.closest('button[data-valor]');
        if (!boton) return;
        filtros[eje] = boton.dataset.valor;
        for (const otro of grupo.querySelectorAll('button[data-valor]')) {
          otro.setAttribute('aria-pressed', String(otro === boton));
        }
        aplicar();
      });
    }
    aplicar();`;

const fuentes =
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap">';

const comun = `${fuentes}
  <title>${esc(titulo)}</title>
  <style>${estilos}
  </style>`;

const paginaArtefacto = `${comun}
  <main class="hoja">${cuerpo}
  </main>
  <script>${guion}
  </script>`;

const paginaCompleta = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${comun}
</head>
<body>
  <main class="hoja">${cuerpo}
  </main>
  <script>${guion}
  </script>
</body>
</html>`;

await writeFile(resolve(raiz, 'SKINWORLD_TASK_CENTER.html'), paginaCompleta);
await mkdir(resolve(raiz, '.artifact'), { recursive: true });
await writeFile(resolve(raiz, '.artifact/task-center.html'), paginaArtefacto);
console.log(`Generado SKINWORLD_TASK_CENTER.html y .artifact/task-center.html (${tareas.length} tareas, ${avance}% terminado)`);
