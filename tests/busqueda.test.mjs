import { test } from 'node:test';
import assert from 'node:assert/strict';
import { puntuarBusqueda } from '../src/lib/busqueda.ts';
const product = { name:'Anthelios UV Air SPF50+ 50 ml', brand:'La Roche-Posay', category:'Protección Solar', variantLabel:'Tono Medio' };
test('busca palabras en distinto orden, marca y categoría con acentos omitidos',()=>{
 for(const q of ['air anthelios','roche air','proteccion solar','bloqueador','tono medio']) assert.notEqual(puntuarBusqueda(product,q),null,q);
});
test('tolera errores cortos sin mezclar tonos ni concentraciones',()=>{
 assert.notEqual(puntuarBusqueda({name:'Hyaluron Filler Epigenetic',brand:'Eucerin'},'eucerim'),null);
 assert.equal(puntuarBusqueda(product,'tono oscuro'),null);
 assert.equal(puntuarBusqueda(product,'SPF30'),null);
 assert.equal(puntuarBusqueda(product,'antibiotico'),null);
});
test('la coincidencia exacta queda antes que una aproximada y la consulta vacía no recomienda productos',()=>{
 const p={name:'Eucerin crema'};
 assert.ok(puntuarBusqueda(p,'eucerin') < puntuarBusqueda(p,'eucerim'));
 assert.equal(puntuarBusqueda(p,'  '),null);
});
