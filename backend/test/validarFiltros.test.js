const test = require('node:test');
const assert = require('node:assert');
const { validarFiltros } = require('../src/utils/validarFiltros');

test('sin filtros es válido y devuelve un objeto vacío', () => {
  assert.deepStrictEqual(validarFiltros({}), {
    valido: true,
    errores: {},
    filtros: {},
  });
});

test('acepta filtros válidos de especie y estado', () => {
  const r = validarFiltros({
    especie: 'perro',
    estado: 'adoptado',
  });

  assert.strictEqual(r.valido, true);
  assert.deepStrictEqual(r.filtros, {
    especie: 'perro',
    estado: 'adoptado',
  });
});

test('rechaza una especie de filtro no válida', () => {
  const r = validarFiltros({ especie: 'pez' });

  assert.strictEqual(r.valido, false);
  assert.ok(r.errores.especie);
});