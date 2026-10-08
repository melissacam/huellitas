import { TestBed } from '@angular/core/testing';
import { NotificacionService } from './notificacion.service';

describe('NotificacionService', () => {
  let servicio: NotificacionService;

  beforeEach(() => {
    vi.useFakeTimers();
    servicio = TestBed.inject(NotificacionService);
  });

  afterEach(() => vi.useRealTimers());

  it('no muestra nada al inicio', () => {
    expect(servicio.mensaje()).toBeNull();
  });

  it('muestra el mensaje y lo limpia a los 3 s', () => {
    servicio.mostrar('Mascota registrada');
    expect(servicio.mensaje()).toBe('Mascota registrada');
    vi.advanceTimersByTime(2999);
    expect(servicio.mensaje()).toBe('Mascota registrada');
    vi.advanceTimersByTime(1);
    expect(servicio.mensaje()).toBeNull();
  });

  it('un mensaje nuevo reemplaza al anterior y reinicia el temporizador', () => {
    servicio.mostrar('Mascota registrada');
    vi.advanceTimersByTime(2000);
    servicio.mostrar('Cambios guardados');
    vi.advanceTimersByTime(2000);
    expect(servicio.mensaje()).toBe('Cambios guardados');
    vi.advanceTimersByTime(1000);
    expect(servicio.mensaje()).toBeNull();
  });
});
