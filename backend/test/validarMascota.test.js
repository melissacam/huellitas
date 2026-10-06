const test = require('node:test');
const assert = require('node:assert');
const { validarMascota } = require('../src/utils/validarMascota');

const base = {
  nombre: 'Luna',
  especie: 'gato',
  edad: 2,
  descripcion: 'Muy cariñosa',
};

test('acepta datos válidos y asigna estado disponible por defecto', () => {
  const r = validarMascota({ ...base, nombre: '  Luna  ' });

  assert.strictEqual(r.valido, true);
  assert.strictEqual(r.datos.nombre, 'Luna');
  assert.strictEqual(r.datos.estado, 'disponible');
});

test('rechaza un nombre vacío', () => {
  const r = validarMascota({ ...base, nombre: '   ' });

  assert.strictEqual(r.valido, false);
  assert.ok(r.errores.nombre);
});

test('rechaza una edad negativa', () => {
  const r = validarMascota({ ...base, edad: -1 });

  assert.strictEqual(r.valido, false);
  assert.ok(r.errores.edad);
});

test('rechaza una edad con decimales', () => {
  const r = validarMascota({ ...base, edad: 2.5 });

  assert.ok(r.errores.edad);
});

test('rechaza una especie no permitida', () => {
  const r = validarMascota({ ...base, especie: 'pez' });

  assert.ok(r.errores.especie);
});

test('valida la descripción recortada (máximo 200 caracteres)', () => {
  const valido = validarMascota({
    ...base,
    descripcion: 'a'.repeat(200) + ' ',
  });

  assert.strictEqual(valido.valido, true);

  const invalido = validarMascota({
    ...base,
    descripcion: 'a'.repeat(201),
  });

  assert.ok(invalido.errores.descripcion);
});