import { Filtros } from './mascota';

/** Devuelve los parámetros de consulta del listado, omitiendo los filtros vacíos. */
export function construirParametros(filtros: Filtros = {}): Record<string, string> {
  const parametros: Record<string, string> = {};
  if (filtros.especie) {
    parametros['especie'] = filtros.especie;
  }
  if (filtros.estado) {
    parametros['estado'] = filtros.estado;
  }
  return parametros;
}
