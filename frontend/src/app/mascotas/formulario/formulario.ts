import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Especie, Estado, MascotaDatos } from '../mascota';
import { MascotasService } from '../mascotas.service';
import { NoEncontrada } from '../no-encontrada/no-encontrada';
import { ESPECIES, MENSAJE_ERROR } from '../presentacion';
import { NotificacionService } from '../../notificacion/notificacion.service';
import {
  Campo,
  DESCRIPCION_MAX,
  aplicarErroresServidor,
  descripcionValida,
  mensajeDeError,
  nombreValido,
} from '../validadores';

/** Un solo formulario para registrar (/mascotas/nueva) y editar (/mascotas/:id/editar). */
@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, RouterLink, NoEncontrada],
  templateUrl: './formulario.html',
})
export class Formulario {
  private readonly mascotasService = inject(MascotasService);
  private readonly notificacion = inject(NotificacionService);
  private readonly router = inject(Router);

  protected readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly esEdicion = this.id !== null;

  protected readonly formulario = inject(NonNullableFormBuilder).group({
    nombre: ['', nombreValido],
    especie: ['' as Especie | '', Validators.required],
    edad: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(30), Validators.pattern(/^\d+$/)],
    ],
    estado: ['disponible' as Estado, Validators.required],
    descripcion: ['', descripcionValida],
  });

  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly noExiste = signal(false);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly nombreActual = signal('');

  private readonly especie = toSignal(this.formulario.controls.especie.valueChanges, {
    initialValue: this.formulario.controls.especie.value,
  });
  private readonly descripcion = toSignal(this.formulario.controls.descripcion.valueChanges, {
    initialValue: this.formulario.controls.descripcion.value,
  });

  /** El avatar del encabezado cambia según la especie elegida. */
  protected readonly avatar = computed(() => {
    const especie = this.especie();
    return especie ? ESPECIES[especie] : { emoji: '🐾', fondo: 'bg-lavanda', sombra: 'shadow-lavanda' };
  });
  protected readonly caracteres = computed(() => this.descripcion().trim().length);
  protected readonly descripcionMax = DESCRIPCION_MAX;
  protected readonly especies = ESPECIES;

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    if (this.id === null) {
      return;
    }
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.mascotasService.obtener(this.id).subscribe({
      next: ({ nombre, especie, edad, estado, descripcion }) => {
        this.formulario.reset({ nombre, especie, edad, estado, descripcion });
        this.nombreActual.set(nombre);
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

  /** Mensaje del campo, solo si ya se salió de él o se intentó guardar (FR-018a). */
  protected mensaje(campo: Campo): string | null {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched ? mensajeDeError(campo, control.errors) : null;
  }

  protected guardar(): void {
    if (this.guardando()) {
      return;
    }
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.enfocarPrimerError();
      return;
    }

    const valores = this.formulario.getRawValue();
    const datos: MascotaDatos = {
      nombre: valores.nombre.trim(),
      especie: valores.especie as Especie,
      edad: Number(valores.edad),
      estado: valores.estado,
      descripcion: valores.descripcion.trim(),
    };

    this.guardando.set(true);
    this.error.set(null);
    const peticion =
      this.id === null
        ? this.mascotasService.crear(datos)
        : this.mascotasService.actualizar(this.id, datos);

    peticion.subscribe({
      next: (mascota) => {
        this.notificacion.mostrar(this.esEdicion ? 'Cambios guardados' : 'Mascota registrada');
        this.router.navigate(['/mascotas', mascota._id]);
      },
      error: (respuesta: HttpErrorResponse) => {
        this.guardando.set(false);
        if (respuesta.status === 404) {
          this.noExiste.set(true);
        } else if (respuesta.status === 400 && aplicarErroresServidor(this.formulario, respuesta.error?.errores)) {
          this.enfocarPrimerError();
        } else {
          // Se conserva todo lo escrito para que se pueda reintentar.
          this.error.set(MENSAJE_ERROR);
        }
      },
    });
  }

  private enfocarPrimerError(): void {
    const campos = Object.keys(this.formulario.controls) as Campo[];
    const campo = campos.find((nombre) => this.formulario.controls[nombre].invalid);
    if (campo) {
      document.getElementById(`campo-${campo}`)?.focus();
    }
  }
}
