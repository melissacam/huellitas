import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogoConfirmacion } from './dialogo-confirmacion';

describe('DialogoConfirmacion', () => {
  let fixture: ComponentFixture<DialogoConfirmacion>;
  let elemento: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(DialogoConfirmacion);
    fixture.componentRef.setInput('titulo', '¿Eliminar a Luna?');
    fixture.componentRef.setInput('mensaje', 'No se podrá recuperar.');
    fixture.componentRef.setInput('textoConfirmar', 'Sí, eliminar');
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

  const botones = () => Array.from(elemento.querySelectorAll('button'));

  it('es un diálogo modal accesible con el foco en "Cancelar"', () => {
    const dialogo = elemento.querySelector('[role="alertdialog"]')!;
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(elemento.querySelector('#dialogo-titulo')?.textContent).toBe('¿Eliminar a Luna?');
    expect(botones().map((b) => b.textContent?.trim())).toEqual(['Cancelar', 'Sí, eliminar']);
    expect(document.activeElement).toBe(botones()[0]);
  });

  it('emite confirmar y cancelar (también con Escape)', () => {
    const confirmar = vi.fn();
    const cancelar = vi.fn();
    fixture.componentInstance.confirmar.subscribe(confirmar);
    fixture.componentInstance.cancelar.subscribe(cancelar);

    botones()[1].click();
    botones()[0].click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(cancelar).toHaveBeenCalledTimes(2);
  });

  it('mientras está ocupado no se puede cancelar y los botones se deshabilitan', async () => {
    const cancelar = vi.fn();
    fixture.componentInstance.cancelar.subscribe(cancelar);
    fixture.componentRef.setInput('ocupado', true);
    fixture.componentRef.setInput('textoOcupado', 'Eliminando…');
    await fixture.whenStable();

    expect(botones().every((b) => b.disabled)).toBe(true);
    expect(botones()[1].textContent).toContain('Eliminando…');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(cancelar).not.toHaveBeenCalled();
  });
});
