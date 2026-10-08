import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Formulario } from './mascotas/formulario/formulario';
import { Lista } from './mascotas/lista/lista';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Huellitas' },
  { path: 'mascotas', component: Lista, title: 'Mascotas · Huellitas' },
  // 'mascotas/nueva' DEBE declararse antes de 'mascotas/:id'.
  { path: 'mascotas/nueva', component: Formulario, title: 'Registrar mascota · Huellitas' },
  { path: 'mascotas/:id/editar', component: Formulario, title: 'Editar mascota · Huellitas' },
  // La ruta de detalle 'mascotas/:id' se agrega en la etapa 2 del Issue #4.
  // La ruta comodín DEBE ser siempre la última.
  { path: '**', redirectTo: '' },
];
