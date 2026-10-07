import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Resumen } from '../mascotas/mascota';
import { MascotasService } from '../mascotas/mascotas.service';
import { MENSAJE_ERROR } from '../mascotas/presentacion';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly mascotasService = inject(MascotasService);

  protected readonly resumen = signal<Resumen | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.mascotasService.resumen().subscribe({
      next: (resumen) => {
        this.resumen.set(resumen);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(MENSAJE_ERROR);
        this.cargando.set(false);
      },
    });
  }
}
