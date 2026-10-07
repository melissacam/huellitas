import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Lista } from './mascotas/lista/lista';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Huellitas' },
  { path: 'mascotas', component: Lista, title: 'Mascotas · Huellitas' },
  // Las rutas de crear, editar y detalle se agregan en el Issue #4.
  // La ruta comodín DEBE ser siempre la última.
  { path: '**', redirectTo: '' },
];
