const test = require('node:test');
const assert = require('node:assert');
const { contarPorEstado } = require('../src/utils/contarPorEstado');

test('cuenta mascotas disponibles y adoptadas', () => {
  const mascotas = [
    { nombre: 'Luna', estado: 'disponible' },
    { nombre: 'Toby', estado: 'adoptado' },
    { nombre: 'Mishi', estado: 'disponible' },
  ];

  assert.deepStrictEqual(contarPorEstado(mascotas), {
    disponibles: 2,
    adoptados: 1,
  });
});

test('devuelve ceros con una lista vacía', () => {
  assert.deepStrictEqual(contarPorEstado([]), {
    disponibles: 0,
    adoptados: 0,
  });
});