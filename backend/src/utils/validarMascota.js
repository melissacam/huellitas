const { ESPECIES, ESTADOS } = require('./constantes');

function validarMascota(entrada = {}) {
  const errores = {};

  const nombre =
    typeof entrada.nombre === 'string'
      ? entrada.nombre.trim()
      : '';

  if (nombre.length < 2 || nombre.length > 40) {
    errores.nombre =
      'El nombre es obligatorio y debe tener entre 2 y 40 caracteres.';
  }

  if (!ESPECIES.includes(entrada.especie)) {
    errores.especie = 'La especie debe ser perro, gato u otro.';
  }

  const edad = Number(entrada.edad);
  const edadVacia =
    entrada.edad === undefined ||
    entrada.edad === null ||
    entrada.edad === '';

  if (
    edadVacia ||
    !Number.isInteger(edad) ||
    edad < 0 ||
    edad > 30
  ) {
    errores.edad = 'La edad debe ser un número entero entre 0 y 30.';
  }

  const estado = entrada.estado ?? 'disponible';

  if (!ESTADOS.includes(estado)) {
    errores.estado = 'El estado debe ser disponible o adoptado.';
  }

  const descripcion =
    typeof entrada.descripcion === 'string'
      ? entrada.descripcion.trim()
      : '';

  if (descripcion.length > 200) {
    errores.descripcion =
      'La descripción no puede superar los 200 caracteres.';
  }

  const valido = Object.keys(errores).length === 0;

  return {
    valido,
    errores,
    datos: valido
      ? {
          nombre,
          especie: entrada.especie,
          edad,
          estado,
          descripcion,
        }
      : null,
  };
}

module.exports = { validarMascota };