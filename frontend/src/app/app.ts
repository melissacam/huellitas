import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Notificacion } from './notificacion/notificacion';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Notificacion],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
