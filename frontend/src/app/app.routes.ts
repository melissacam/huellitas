import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Detalle } from './mascotas/detalle/detalle';
import { Formulario } from './mascotas/formulario/formulario';
import { Lista } from './mascotas/lista/lista';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'Huellitas' },
  { path: 'mascotas', component: Lista, title: 'Mascotas · Huellitas' },
  // 'mascotas/nueva' DEBE declararse antes de 'mascotas/:id'.
  { path: 'mascotas/nueva', component: Formulario, title: 'Registrar mascota · Huellitas' },
  { path: 'mascotas/:id/editar', component: Formulario, title: 'Editar mascota · Huellitas' },
  { path: 'mascotas/:id', component: Detalle, title: 'Ficha de mascota · Huellitas' },
  // La ruta comodín DEBE ser siempre la última.
  { path: '**', redirectTo: '' },
];
