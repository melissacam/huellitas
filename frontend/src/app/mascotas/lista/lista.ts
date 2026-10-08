import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Especie, Estado, Mascota } from '../mascota';
import { MascotasService } from '../mascotas.service';
import { ESPECIES, ESTADOS, MENSAJE_ERROR, textoEdad } from '../presentacion';

@Component({
  selector: 'app-lista',
  imports: [RouterLink],
  templateUrl: './lista.html',
})
export class Lista {
  private readonly mascotasService = inject(MascotasService);
  private peticion?: Subscription;

  protected readonly mascotas = signal<Mascota[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly especie = signal<Especie | ''>('');
  protected readonly estado = signal<Estado | ''>('');
  protected readonly hayFiltros = computed(() => this.especie() !== '' || this.estado() !== '');

  protected readonly especies = ESPECIES;
  protected readonly estados = ESTADOS;
  protected readonly textoEdad = textoEdad;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.peticion?.unsubscribe());
    this.cargar();
  }

  protected cambiarEspecie(valor: string): void {
    this.especie.set(valor as Especie | '');
    this.cargar();
  }

  protected cambiarEstado(valor: string): void {
    this.estado.set(valor as Estado | '');
    this.cargar();
  }

  protected quitarFiltros(): void {
    this.especie.set('');
    this.estado.set('');
    this.cargar();
  }

  protected cargar(): void {
    // Si cambian los filtros antes de responder, se descarta la consulta anterior.
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);
    this.peticion = this.mascotasService
      .listar({ especie: this.especie(), estado: this.estado() })
      .subscribe({
        next: (mascotas) => {
          this.mascotas.set(mascotas);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(MENSAJE_ERROR);
          this.cargando.set(false);
        },
      });
  }
}
