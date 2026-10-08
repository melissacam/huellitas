import { textoEdad } from './presentacion';

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
