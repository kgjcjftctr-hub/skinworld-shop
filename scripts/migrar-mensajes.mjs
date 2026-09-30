// Pasa a la tabla `messages` los mensajes que quedaran guardados como objetos
// en el bucket de Storage, que es donde vivían antes de que existiera la tabla.
// Se puede correr varias veces: los objetos ya migrados se borran al pasar.
//
//   node --env-file=.env.local scripts/migrar-mensajes.mjs
const url = process.env.SUPABASE_URL;
const llave = process.env.SUPABASE_SECRET_KEY;
if (!url || !llave) {
  console.error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY');
  process.exit(1);
}
const cabeceras = { apikey: llave, Authorization: `Bearer ${llave}`, 'Content-Type': 'application/json' };

async function listar(prefijo) {
  const res = await fetch(`${url}/storage/v1/object/list/mensajes`, {
    method: 'POST',
    headers: cabeceras,
    body: JSON.stringify({ prefix: prefijo, limit: 1000 }),
  });
  return res.ok ? res.json() : [];
}

let migrados = 0;
for (const tipo of ['contacto', 'boletin']) {
  const objetos = await listar(tipo);
  for (const objeto of objetos) {
    if (!objeto.name.endsWith('.json')) continue;
    const ruta = `${tipo}/${objeto.name}`;
    const archivo = await fetch(`${url}/storage/v1/object/mensajes/${ruta}`, { headers: cabeceras });
    if (!archivo.ok) continue;
    const m = await archivo.json();

    const alta = await fetch(`${url}/rest/v1/messages`, {
      method: 'POST',
      headers: { ...cabeceras, Prefer: 'return=minimal' },
      body: JSON.stringify({
        kind: m.tipo,
        name: m.nombre ?? null,
        email: m.email,
        subject: m.asunto ?? null,
        body: m.mensaje ?? null,
        created_at: m.fecha,
      }),
    });

    // 409 es el índice único del boletín: ya estaba migrado.
    if (alta.ok || alta.status === 409) {
      await fetch(`${url}/storage/v1/object/mensajes`, {
        method: 'DELETE',
        headers: cabeceras,
        body: JSON.stringify({ prefixes: [ruta] }),
      });
      migrados++;
    } else {
      console.error(`No se pudo migrar ${ruta}: ${alta.status} ${await alta.text()}`);
    }
  }
}
console.log(`Mensajes migrados: ${migrados}`);
