import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../../notificacion/notificacion.service';
import { Detalle } from './detalle';

describe('Detalle', () => {
  const url = `${environment.apiUrl}/mascotas/abc123`;
  const luna = {
    _id: 'abc123',
    nombre: 'Luna',
    especie: 'gato',
    edad: 2,
    estado: 'disponible',
    descripcion: 'Muy cariñosa',
    createdAt: '2026-10-04T12:00:00.000Z',
    updatedAt: '2026-10-04T12:00:00.000Z',
  };

  let fixture: ComponentFixture<Detalle>;
  let http: HttpTestingController;
  let elemento: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Detalle],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'abc123' }) } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Detalle);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  async function cargar(mascota: object = luna): Promise<void> {
    http.expectOne(url).flush(mascota);
    await fixture.whenStable();
  }

  const boton = (texto: string) =>
    Array.from(elemento.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes(texto),
    );

  async function pulsar(texto: string): Promise<void> {
    boton(texto)!.click();
    await fixture.whenStable();
  }

  it('muestra la ficha completa', async () => {
    await cargar();
    const texto = elemento.textContent ?? '';
    expect(elemento.querySelector('h1')?.textContent).toBe('Luna');
    expect(texto).toContain('🐱');
    expect(texto).toContain('Disponible');
    expect(texto).toContain('2 años');
    expect(texto).toContain('Muy cariñosa');
    expect(texto).toContain('4 de octubre de 2026');
    expect(elemento.querySelector('a[href="/mascotas/abc123/editar"]')).not.toBeNull();
  });

  it('muestra "Mascota no encontrada" si la API responde 404', async () => {
    http.expectOne(url).flush({ mensaje: 'Esta mascota ya no existe' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    expect(elemento.textContent).toContain('Mascota no encontrada');
  });

  it('no ofrece "Marcar como adoptada" si ya está adoptada', async () => {
    await cargar({ ...luna, estado: 'adoptado' });
    expect(boton('Marcar como adoptada')).toBeUndefined();
    expect(elemento.textContent).toContain('Adoptado');
  });

  it('marca como adoptada con PUT, deshabilita las acciones y actualiza la vista', async () => {
    await cargar();
    await pulsar('Marcar como adoptada');

    const peticion = http.expectOne(url);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual({
      nombre: 'Luna',
      especie: 'gato',
      edad: 2,
      estado: 'adoptado',
      descripcion: 'Muy cariñosa',
    });
    expect(boton('Eliminar')!.disabled).toBe(true);
    expect(boton('Guardando…')!.disabled).toBe(true);

    peticion.flush({ ...luna, estado: 'adoptado' });
    await fixture.whenStable();
    expect(TestBed.inject(NotificacionService).mensaje()).toBe('¡Luna fue marcada como adoptada!');
    expect(boton('Marcar como adoptada')).toBeUndefined();
    expect(elemento.textContent).toContain('Adoptado');
  });

  it('cancelar el diálogo no elimina la mascota', async () => {
    await cargar();
    await pulsar('Eliminar');
    expect(elemento.querySelector('[role="alertdialog"]')?.textContent).toContain('¿Eliminar a Luna?');

    await pulsar('Cancelar');
    expect(elemento.querySelector('[role="alertdialog"]')).toBeNull();
    http.expectNone({ method: 'DELETE', url });
  });

  it('al confirmar elimina, avisa y vuelve al listado', async () => {
    await cargar();
    await pulsar('Eliminar');
    await pulsar('Sí, eliminar');

    const peticion = http.expectOne({ method: 'DELETE', url });
    expect(boton('Eliminando…')!.disabled).toBe(true);
    peticion.flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(TestBed.inject(NotificacionService).mensaje()).toBe('Mascota eliminada');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/mascotas']);
  });

  it('si falla la eliminación muestra un mensaje sin detalles técnicos', async () => {
    await cargar();
    await pulsar('Eliminar');
    await pulsar('Sí, eliminar');
    http.expectOne({ method: 'DELETE', url }).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(elemento.querySelector('[role="alertdialog"]')).toBeNull();
    expect(elemento.querySelector('[role="alert"]')?.textContent).toContain('No se pudo completar la acción');
    expect(boton('Eliminar')!.disabled).toBe(false);
  });
});
