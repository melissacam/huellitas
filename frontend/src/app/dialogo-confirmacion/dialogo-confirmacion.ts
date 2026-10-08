import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

/**
 * Diálogo modal de confirmación con el estilo de la app (en lugar de window.confirm).
 * Se muestra mientras el componente está en la plantilla; el padre lo controla con @if.
 */
@Component({
  selector: 'app-dialogo-confirmacion',
  templateUrl: './dialogo-confirmacion.html',
  host: { '(document:keydown.escape)': 'cerrar()' },
})
export class DialogoConfirmacion {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Confirmar');
  readonly textoOcupado = input('Procesando…');
  readonly ocupado = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  private readonly botonCancelar = viewChild.required<ElementRef<HTMLButtonElement>>('botonCancelar');
  private readonly botonConfirmar = viewChild.required<ElementRef<HTMLButtonElement>>('botonConfirmar');

  constructor() {
    // El foco empieza en "Cancelar": la opción segura.
    afterNextRender(() => this.botonCancelar().nativeElement.focus());
  }

  protected cerrar(): void {
    if (!this.ocupado()) {
      this.cancelar.emit();
    }
  }

  /** Mantiene el foco dentro del diálogo al usar Tab y Mayús+Tab. */
  protected atraparFoco(evento: Event): void {
    if (!(evento instanceof KeyboardEvent) || evento.key !== 'Tab') {
      return;
    }
    const cancelar = this.botonCancelar().nativeElement;
    const confirmar = this.botonConfirmar().nativeElement;
    if (evento.shiftKey && document.activeElement === cancelar) {
      evento.preventDefault();
      confirmar.focus();
    } else if (!evento.shiftKey && document.activeElement === confirmar) {
      evento.preventDefault();
      cancelar.focus();
    }
  }
}
