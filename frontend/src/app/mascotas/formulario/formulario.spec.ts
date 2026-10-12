import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { NotificacionService } from '../../notificacion/notificacion.service';
import { MENSAJES } from '../validadores';
import { Formulario } from './formulario';

describe('Formulario', () => {
  const url = `${environment.apiUrl}/mascotas`;
  const luna = {
    _id: 'abc123',
    nombre: 'Luna',
    especie: 'gato',
    edad: 2,
    estado: 'adoptado',
    descripcion: 'Muy cariñosa',
    createdAt: '2026-10-04T15:20:00.000Z',
    updatedAt: '2026-10-04T15:20:00.000Z',
  };

  let fixture: ComponentFixture<Formulario>;
  let http: HttpTestingController;
  let elemento: HTMLElement;

  async function crear(id: string | null): Promise<void> {
    TestBed.configureTestingModule({
      imports: [Formulario],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id ? { id } : {}) } } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(Formulario);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  }

  const campo = <T extends HTMLElement>(nombre: string) => elemento.querySelector<T>(`#campo-${nombre}`)!;
  const errores = () => Array.from(elemento.querySelectorAll('.mensaje-error')).map((p) => p.textContent?.trim());

  function escribir(nombre: string, valor: string): void {
    const control = campo<HTMLInputElement | HTMLSelectElement>(nombre);
    control.value = valor;
    control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input'));
  }

  async function enviar(): Promise<void> {
    elemento.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  afterEach(() => http.verify());

  describe('al registrar', () => {
    beforeEach(() => crear(null));

    it('no muestra errores al abrir ni el campo estado', () => {
      expect(errores()).toEqual([]);
      expect(campo('estado')).toBeNull();
      expect(elemento.querySelector('h1')?.textContent).toContain('Registrar mascota');
    });

    it('muestra el error al salir de un campo tocado', async () => {
      campo('nombre').dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(errores()).toEqual([`⚠ ${MENSAJES.nombreObligatorio}`]);
    });

    it('al guardar vacío marca todos los campos y no envía nada', async () => {
      await enviar();
      expect(errores()).toEqual([
        `⚠ ${MENSAJES.nombreObligatorio}`,
        `⚠ ${MENSAJES.especie}`,
        `⚠ ${MENSAJES.edad}`,
      ]);
      http.expectNone(url);
    });

    it('envía los datos recortados, deshabilita Guardar y avisa al terminar', async () => {
      const notificacion = TestBed.inject(NotificacionService);
      escribir('nombre', '  Luna  ');
      escribir('especie', 'gato');
      escribir('edad', '2');
      await enviar();

      const peticion = http.expectOne(url);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({
        nombre: 'Luna',
        especie: 'gato',
        edad: 2,
        estado: 'disponible',
        descripcion: '',
      });
      const boton = elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      expect(boton.disabled).toBe(true);
      expect(boton.textContent).toContain('Guardando…');

      peticion.flush({ ...luna, estado: 'disponible' });
      await fixture.whenStable();
      expect(notificacion.mensaje()).toBe('Mascota registrada');
      expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/mascotas', 'abc123']);
    });

    it('muestra junto a cada campo los errores 400 del servidor', async () => {
      escribir('nombre', 'Luna');
      escribir('especie', 'gato');
      escribir('edad', '2');
      await enviar();

      http.expectOne(url).flush(
        { mensaje: 'Los datos de la mascota no son válidos', errores: { edad: 'Edad rechazada por la API' } },
        { status: 400, statusText: 'Bad Request' },
      );
      await fixture.whenStable();
      expect(errores()).toEqual(['⚠ Edad rechazada por la API']);
      expect(elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    });
  });

  describe('al editar', () => {
    beforeEach(() => crear('abc123'));

    it('precarga los datos y muestra el estado para poder revertir la adopción', async () => {
      http.expectOne(`${url}/abc123`).flush(luna);
      await fixture.whenStable();
      expect(campo<HTMLInputElement>('nombre').value).toBe('Luna');
      expect(campo<HTMLSelectElement>('estado').value).toBe('adoptado');
      expect(elemento.querySelector('#contador-descripcion')?.textContent?.trim()).toBe('12/200');
      expect(errores()).toEqual([]);

      escribir('estado', 'disponible');
      await enviar();
      const peticion = http.expectOne(`${url}/abc123`);
      expect(peticion.request.method).toBe('PUT');
      expect(peticion.request.body.estado).toBe('disponible');
      peticion.flush({ ...luna, estado: 'disponible' });
      await fixture.whenStable();
      expect(TestBed.inject(NotificacionService).mensaje()).toBe('Cambios guardados');
    });

    it('muestra "Mascota no encontrada" si la API responde 404', async () => {
      http
        .expectOne(`${url}/abc123`)
        .flush({ mensaje: 'Esta mascota ya no existe' }, { status: 404, statusText: 'Not Found' });
      await fixture.whenStable();
      expect(elemento.textContent).toContain('Mascota no encontrada');
      expect(elemento.querySelector('form')).toBeNull();
      expect(elemento.querySelector('a')?.getAttribute('href')).toBe('/mascotas');
    });
  });
});
