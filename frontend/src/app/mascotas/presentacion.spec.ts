import { textoEdad, textoFecha } from './presentacion';

describe('textoEdad', () => {
  it('muestra "Menos de 1 año" para crías de 0 años', () => {
    expect(textoEdad(0)).toBe('Menos de 1 año');
  });

  it('usa singular para 1 año', () => {
    expect(textoEdad(1)).toBe('1 año');
  });

  it('usa plural desde 2 años', () => {
    expect(textoEdad(2)).toBe('2 años');
    expect(textoEdad(30)).toBe('30 años');
  });
});

describe('textoFecha', () => {
  it('muestra la fecha en español con el mes en palabras', () => {
    // Mediodía UTC para que la zona horaria no cambie el día.
    expect(textoFecha('2026-10-04T12:00:00.000Z')).toBe('4 de octubre de 2026');
  });

  it('devuelve texto vacío si la fecha no es válida', () => {
    expect(textoFecha('no es fecha')).toBe('');
  });
});
