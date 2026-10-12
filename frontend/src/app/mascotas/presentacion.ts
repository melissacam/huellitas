import { Especie, Estado } from './mascota';

/** Avatar y etiqueta de cada especie (fondo pastel distinto por especie). */
export const ESPECIES: Record<Especie, { etiqueta: string; emoji: string; fondo: string; sombra: string }> = {
  perro: { etiqueta: 'Perro', emoji: '🐶', fondo: 'bg-durazno', sombra: 'shadow-durazno' },
  gato: { etiqueta: 'Gato', emoji: '🐱', fondo: 'bg-celeste', sombra: 'shadow-celeste' },
  otro: { etiqueta: 'Otro', emoji: '🐾', fondo: 'bg-rosa', sombra: 'shadow-rosa' },
};

/** Insignia de estado: menta = disponible, lavanda = adoptado. */
export const ESTADOS: Record<Estado, { etiqueta: string; fondo: string }> = {
  disponible: { etiqueta: 'Disponible', fondo: 'bg-menta' },
  adoptado: { etiqueta: 'Adoptado', fondo: 'bg-lavanda' },
};

export const MENSAJE_ERROR = 'No se pudo completar la acción. Revisa tu conexión e inténtalo de nuevo.';

/** Edad en años completos: 0 → "Menos de 1 año", 1 → "1 año", n → "n años". */
export function textoEdad(edad: number): string {
  if (edad < 1) {
    return 'Menos de 1 año';
  }
  return edad === 1 ? '1 año' : `${edad} años`;
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });

/** Fecha de registro legible: "4 de octubre de 2026". Fecha inválida → "". */
export function textoFecha(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : FORMATO_FECHA.format(fecha);
}
