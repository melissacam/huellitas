import { Injectable, signal } from '@angular/core';

/** Confirmaciones breves (toast) que desaparecen solas a los ~3 s. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly texto = signal<string | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  readonly mensaje = this.texto.asReadonly();

  mostrar(texto: string, duracion = 3000): void {
    // Un mensaje nuevo reemplaza al anterior y reinicia el temporizador.
    clearTimeout(this.temporizador);
    this.texto.set(texto);
    this.temporizador = setTimeout(() => this.texto.set(null), duracion);
  }
}
