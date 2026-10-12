import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DialogoConfirmacion } from '../../dialogo-confirmacion/dialogo-confirmacion';
import { NotificacionService } from '../../notificacion/notificacion.service';
import { Mascota } from '../mascota';
import { MascotasService } from '../mascotas.service';
import { NoEncontrada } from '../no-encontrada/no-encontrada';
import { ESPECIES, ESTADOS, MENSAJE_ERROR, textoEdad, textoFecha } from '../presentacion';

type Operacion = 'adoptar' | 'eliminar';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, NoEncontrada, DialogoConfirmacion],
  templateUrl: './detalle.html',
})
export class Detalle {
  private readonly mascotasService = inject(MascotasService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);
  private readonly botonEliminar = viewChild<ElementRef<HTMLButtonElement>>('botonEliminar');

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  protected readonly mascota = signal<Mascota | null>(null);
  protected readonly cargando = signal(false);
  protected readonly noExiste = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  /** Operación en curso: deshabilita todas las acciones para evitar envíos duplicados. */
  protected readonly ocupado = signal<Operacion | null>(null);
  protected readonly confirmando = signal(false);

  protected readonly especies = ESPECIES;
  protected readonly estados = ESTADOS;
  protected readonly textoEdad = textoEdad;
  protected readonly textoFecha = textoFecha;

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.mascotasService.obtener(this.id).subscribe({
      next: (mascota) => {
        this.mascota.set(mascota);
        this.cargando.set(false);
      },
      error: (respuesta: HttpErrorResponse) => {
        if (respuesta.status === 404) {
          this.noExiste.set(true);
        } else {
          this.errorCarga.set(MENSAJE_ERROR);
        }
        this.cargando.set(false);
      },
    });
  }

  /** "Marcar como adoptada": PUT con los datos actuales y estado "adoptado". */
  protected adoptar(): void {
    const mascota = this.mascota();
    if (!mascota || this.ocupado() || mascota.estado !== 'disponible') {
      return;
    }
    const { nombre, especie, edad, descripcion } = mascota;
    this.iniciar('adoptar');
    this.mascotasService
      .actualizar(mascota._id, { nombre, especie, edad, estado: 'adoptado', descripcion })
      .subscribe({
        next: (actualizada) => {
          this.mascota.set(actualizada);
          this.ocupado.set(null);
          this.notificacion.mostrar(`¡${actualizada.nombre} fue marcada como adoptada!`);
        },
        error: (respuesta: HttpErrorResponse) => this.fallar(respuesta),
      });
  }

  protected pedirConfirmacion(): void {
    if (!this.ocupado()) {
      this.confirmando.set(true);
    }
  }

  protected cancelarEliminacion(): void {
    this.confirmando.set(false);
    // El foco vuelve al botón que abrió el diálogo.
    setTimeout(() => this.botonEliminar()?.nativeElement.focus());
  }

  protected eliminar(): void {
    const mascota = this.mascota();
    if (!mascota || this.ocupado()) {
      return;
    }
    this.iniciar('eliminar');
    this.mascotasService.eliminar(mascota._id).subscribe({
      next: () => {
        this.notificacion.mostrar('Mascota eliminada');
        this.router.navigate(['/mascotas']);
      },
      error: (respuesta: HttpErrorResponse) => {
        this.confirmando.set(false);
        this.fallar(respuesta);
      },
    });
  }

  private iniciar(operacion: Operacion): void {
    this.ocupado.set(operacion);
    this.error.set(null);
  }

  private fallar(respuesta: HttpErrorResponse): void {
    this.ocupado.set(null);
    if (respuesta.status === 404) {
      this.noExiste.set(true);
    } else {
      this.error.set(MENSAJE_ERROR);
    }
  }
}
