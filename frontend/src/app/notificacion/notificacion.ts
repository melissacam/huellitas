import { Component, inject } from '@angular/core';
import { NotificacionService } from './notificacion.service';

@Component({
  selector: 'app-notificacion',
  templateUrl: './notificacion.html',
})
export class Notificacion {
  protected readonly notificacion = inject(NotificacionService);
}
