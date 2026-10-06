const { ESPECIES, ESTADOS } = require('./constantes');

function validarFiltros(query = {}) {
  const errores = {};
  const filtros = {};

  if (query.especie !== undefined && query.especie !== '') {
    if (ESPECIES.includes(query.especie)) {
      filtros.especie = query.especie;
    } else {
      errores.especie = 'El filtro de especie no es válido.';
    }
  }

  if (query.estado !== undefined && query.estado !== '') {
    if (ESTADOS.includes(query.estado)) {
      filtros.estado = query.estado;
    } else {
      errores.estado = 'El filtro de estado no es válido.';
    }
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
    filtros,
  };
}

module.exports = { validarFiltros };