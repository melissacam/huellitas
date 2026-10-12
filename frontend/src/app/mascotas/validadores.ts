import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MascotaDatos } from './mascota';

export type Campo = keyof MascotaDatos;

export const NOMBRE_MIN = 2;
export const NOMBRE_MAX = 40;
export const DESCRIPCION_MAX = 200;

/** Mismos textos que devuelve la API (data-model.md). */
export const MENSAJES = {
  nombreObligatorio: 'El nombre es obligatorio',
  nombreLongitud: 'El nombre debe tener entre 2 y 40 caracteres',
  especie: 'La especie debe ser perro, gato u otro',
  edad: 'La edad debe ser un número entero entre 0 y 30',
  estado: 'El estado debe ser disponible o adoptado',
  descripcion: 'La descripción no puede superar los 200 caracteres',
} as const;

function recortado(control: AbstractControl): string {
  return typeof control.value === 'string' ? control.value.trim() : '';
}

/** Nombre obligatorio de 2 a 40 caracteres, sin contar espacios al inicio o al final. */
export const nombreValido: ValidatorFn = (control) => {
  const nombre = recortado(control);
  if (nombre === '') {
    return { obligatorio: true };
  }
  return nombre.length < NOMBRE_MIN || nombre.length > NOMBRE_MAX ? { longitud: true } : null;
};

/** Descripción opcional de hasta 200 caracteres, sin contar espacios al inicio o al final. */
export const descripcionValida: ValidatorFn = (control) =>
  recortado(control).length > DESCRIPCION_MAX ? { longitud: true } : null;

/** Texto que se muestra junto al campo; el error del servidor tiene prioridad. */
export function mensajeDeError(campo: Campo, errores: ValidationErrors | null): string | null {
  if (!errores) {
    return null;
  }
  if (typeof errores['servidor'] === 'string') {
    return errores['servidor'];
  }
  if (campo === 'nombre') {
    return errores['obligatorio'] ? MENSAJES.nombreObligatorio : MENSAJES.nombreLongitud;
  }
  return MENSAJES[campo];
}

/**
 * Coloca los errores 400 de la API junto a cada campo con `setErrors({ servidor })`.
 * Devuelve `true` si se aplicó al menos uno.
 */
export function aplicarErroresServidor(formulario: FormGroup, errores: unknown): boolean {
  if (!errores || typeof errores !== 'object') {
    return false;
  }
  let aplicados = false;
  for (const [campo, mensaje] of Object.entries(errores)) {
    const control = formulario.get(campo);
    if (control && typeof mensaje === 'string') {
      control.setErrors({ servidor: mensaje });
      control.markAsTouched();
      aplicados = true;
    }
  }
  return aplicados;
}
