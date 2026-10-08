import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { MascotaDatos } from './mascota';
import { MascotasService } from './mascotas.service';

describe('MascotasService', () => {
  const url = `${environment.apiUrl}/mascotas`;
  let servicio: MascotasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(MascotasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar sin filtros hace GET al listado sin parámetros', () => {
    servicio.listar().subscribe();
    const peticion = http.expectOne((r) => r.url === url);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.keys()).toEqual([]);
    peticion.flush([]);
  });

  it('listar envía solo los filtros con valor', () => {
    servicio.listar({ especie: 'gato', estado: '' }).subscribe();
    const peticion = http.expectOne((r) => r.url === url);
    expect(peticion.request.params.keys()).toEqual(['especie']);
    expect(peticion.request.params.get('especie')).toBe('gato');
    peticion.flush([]);
  });

  it('resumen hace GET a /mascotas/resumen', () => {
    let resultado: unknown;
    servicio.resumen().subscribe((r) => (resultado = r));
    const peticion = http.expectOne(`${url}/resumen`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush({ disponibles: 4, adoptados: 2 });
    expect(resultado).toEqual({ disponibles: 4, adoptados: 2 });
  });

  const datos: MascotaDatos = {
    nombre: 'Luna',
    especie: 'gato',
    edad: 2,
    estado: 'disponible',
    descripcion: 'Muy cariñosa',
  };

  it('obtener hace GET a /mascotas/:id', () => {
    servicio.obtener('abc123').subscribe();
    const peticion = http.expectOne(`${url}/abc123`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush({ _id: 'abc123', ...datos });
  });

  it('crear hace POST al listado con los datos', () => {
    servicio.crear(datos).subscribe();
    const peticion = http.expectOne(url);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toEqual(datos);
    peticion.flush({ _id: 'nuevo', ...datos });
  });

  it('actualizar hace PUT a /mascotas/:id con los datos', () => {
    servicio.actualizar('abc123', { ...datos, estado: 'adoptado' }).subscribe();
    const peticion = http.expectOne(`${url}/abc123`);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual({ ...datos, estado: 'adoptado' });
    peticion.flush({ _id: 'abc123', ...datos, estado: 'adoptado' });
  });

  it('eliminar hace DELETE a /mascotas/:id', () => {
    servicio.eliminar('abc123').subscribe();
    const peticion = http.expectOne(`${url}/abc123`);
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush(null, { status: 204, statusText: 'No Content' });
  });
});
