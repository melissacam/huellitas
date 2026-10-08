import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { construirParametros } from './construir-parametros';
import { Filtros, Mascota, MascotaDatos, Resumen } from './mascota';

@Injectable({ providedIn: 'root' })
export class MascotasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/mascotas`;

  listar(filtros: Filtros = {}): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(this.url, { params: construirParametros(filtros) });
  }

  resumen(): Observable<Resumen> {
    return this.http.get<Resumen>(`${this.url}/resumen`);
  }

  obtener(id: string): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.url}/${encodeURIComponent(id)}`);
  }

  crear(datos: MascotaDatos): Observable<Mascota> {
    return this.http.post<Mascota>(this.url, datos);
  }

  actualizar(id: string, datos: MascotaDatos): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.url}/${encodeURIComponent(id)}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
