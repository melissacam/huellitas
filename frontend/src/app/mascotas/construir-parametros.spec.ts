import { construirParametros } from './construir-parametros';

describe('construirParametros', () => {
  it('sin filtros devuelve un objeto vacío', () => {
    expect(construirParametros()).toEqual({});
    expect(construirParametros({})).toEqual({});
  });

  it('omite los filtros vacíos', () => {
    expect(construirParametros({ especie: '', estado: '' })).toEqual({});
    expect(construirParametros({ especie: undefined, estado: undefined })).toEqual({});
  });

  it('incluye solo la especie cuando es el único filtro', () => {
    expect(construirParametros({ especie: 'gato', estado: '' })).toEqual({ especie: 'gato' });
  });

  it('incluye solo el estado cuando es el único filtro', () => {
    expect(construirParametros({ estado: 'adoptado' })).toEqual({ estado: 'adoptado' });
  });

  it('combina especie y estado', () => {
    expect(construirParametros({ especie: 'perro', estado: 'disponible' })).toEqual({
      especie: 'perro',
      estado: 'disponible',
    });
  });

  it('ignora claves que no son filtros', () => {
    const filtros = { especie: 'otro', nombre: 'Luna' } as unknown as Parameters<typeof construirParametros>[0];
    expect(construirParametros(filtros)).toEqual({ especie: 'otro' });
  });
});
