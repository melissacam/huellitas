# Modelo de datos: Fichas de mascotas en adopción

**Feature**: `001-fichas-mascotas` | **Fecha**: 2026-10-04 | **Plan**: [plan.md](plan.md)

## Entidad: Mascota

Colección única de MongoDB: `mascotas` (constitución, principio II). Modelo Mongoose
`Mascota` en `backend/src/models/mascota.js`, con `timestamps: true` y `versionKey: false`.

| Campo         | Tipo     | Obligatorio | Reglas                                                                 | Origen      |
|---------------|----------|-------------|------------------------------------------------------------------------|-------------|
| `_id`         | ObjectId | Sí          | Generado por MongoDB. Se expone tal cual como `string`.                | Sistema     |
| `nombre`      | String   | Sí          | Se recorta (`trim`). Longitud tras recortar: 2–40 caracteres.          | Usuario     |
| `especie`     | String   | Sí          | Uno de: `perro`, `gato`, `otro`.                                       | Usuario     |
| `edad`        | Number   | Sí          | Entero (`Number.isInteger`) entre 0 y 30, ambos incluidos.             | Usuario     |
| `estado`      | String   | Sí          | Uno de: `disponible`, `adoptado`. Por defecto `disponible`.            | Usuario     |
| `descripcion` | String   | No          | Se recorta. Máximo 200 caracteres. Ausente o vacía → `""`.             | Usuario     |
| `createdAt`   | Date     | Sí          | Automático (timestamps). Fecha de registro; ordena el listado (desc). | Sistema     |
| `updatedAt`   | Date     | Sí          | Automático (timestamps).                                               | Sistema     |

Relaciones: ninguna. Índices: solo el `_id` por defecto (volumen pequeño; sin índices extra).

## Reglas de validación y mensajes

La función pura `validarMascota(datos)` (`backend/src/utils/validarMascota.js`) aplica estas
reglas a POST y PUT; el formulario de Angular muestra exactamente los mismos textos.

| Campo         | Condición de error                                                   | Mensaje (español)                                              |
|---------------|----------------------------------------------------------------------|----------------------------------------------------------------|
| `nombre`      | Ausente, no es texto o vacío tras recortar                           | `El nombre es obligatorio`                                     |
| `nombre`      | Longitud tras recortar < 2 o > 40                                    | `El nombre debe tener entre 2 y 40 caracteres`                 |
| `especie`     | Ausente o fuera de `perro`/`gato`/`otro`                             | `La especie debe ser perro, gato u otro`                       |
| `edad`        | Ausente, no numérica, decimal, < 0 o > 30                            | `La edad debe ser un número entero entre 0 y 30`               |
| `estado`      | Fuera de `disponible`/`adoptado` (ausente → `disponible`)            | `El estado debe ser disponible o adoptado`                     |
| `descripcion` | No es texto (si viene) o longitud tras recortar > 200                | `La descripción no puede superar los 200 caracteres`           |

Contrato de la función:

- Entrada: objeto con los datos recibidos (cualquier forma; puede ser `null` o tener campos
  extra, que se ignoran).
- Salida: `{ valido: boolean, errores: { [campo]: string }, datos: { nombre, especie, edad,
  estado, descripcion } }`. `datos` contiene solo los cinco campos permitidos, normalizados; se
  usa para crear o actualizar el documento (nunca el `req.body` crudo).
- Se informa un error por campo (el primero que falle) y todos los campos inválidos a la vez.

Notas:

- Al editar (PUT) el estado ausente también se interpreta como `disponible`; el frontend
  siempre envía el estado, así que en la práctica no ocurre.
- Los nombres repetidos están permitidos (no hay índice único).

## Función de resumen

`contarPorEstado(mascotas)` (`backend/src/utils/contarPorEstado.js`):

- Entrada: arreglo de objetos con al menos la propiedad `estado`.
- Salida: `{ disponibles: number, adoptados: number }`. Arreglo vacío → `{ disponibles: 0,
  adoptados: 0 }`. Elementos con un estado desconocido no se cuentan.

## Transiciones de estado

```text
           alta (POST)                     "Marcar como adoptada" (detalle)
  ──────────────────────▶ disponible ─────────────────────────────────────▶ adoptado
                              ▲          o edición del campo estado (PUT)       │
                              │                                                 │
                              └──────── edición del campo estado (PUT) ─────────┘
                                         (única vía para revertir, FR-012)

  Cualquier estado ── DELETE (con confirmación) ──▶ eliminada (definitivo, FR-025)
```

- "Marcar como adoptada" solo se ofrece cuando `estado === "disponible"` (FR-023).
- No hay estado intermedio ni borrado lógico.

## Modelo en el frontend

Interfaz TypeScript en `frontend/src/app/mascotas/mascota.ts`:

```ts
type Especie = 'perro' | 'gato' | 'otro';
type Estado = 'disponible' | 'adoptado';

interface Mascota {
  _id: string;
  nombre: string;
  especie: Especie;
  edad: number;
  estado: Estado;
  descripcion: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

type MascotaDatos = Pick<Mascota, 'nombre' | 'especie' | 'edad' | 'estado' | 'descripcion'>;

interface Resumen { disponibles: number; adoptados: number; }
```
