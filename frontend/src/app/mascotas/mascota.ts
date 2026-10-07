export type Especie = 'perro' | 'gato' | 'otro';
export type Estado = 'disponible' | 'adoptado';

export interface Mascota {
  _id: string;
  nombre: string;
  especie: Especie;
  edad: number;
  estado: Estado;
  descripcion: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type MascotaDatos = Pick<Mascota, 'nombre' | 'especie' | 'edad' | 'estado' | 'descripcion'>;

export interface Resumen {
  disponibles: number;
  adoptados: number;
}

/** Filtros del listado; '' significa "todas" / "todos". */
export interface Filtros {
  especie?: Especie | '';
  estado?: Estado | '';
}
