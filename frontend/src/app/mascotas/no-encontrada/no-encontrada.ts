import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Estado "Mascota no encontrada" (404); lo comparten el formulario de edición y el detalle. */
@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  templateUrl: './no-encontrada.html',
})
export class NoEncontrada {}
