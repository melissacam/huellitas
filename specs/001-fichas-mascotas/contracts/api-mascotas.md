# Contrato de la API REST: Mascotas

**Feature**: `001-fichas-mascotas` | **Base URL (desarrollo)**: `http://localhost:3000/api`

Convenciones:

- Cuerpos de petición y respuesta en JSON (`Content-Type: application/json`).
- Entidad `Mascota`: ver [data-model.md](../data-model.md).
- Formato de error único:

  ```json
  { "mensaje": "Texto en español", "errores": { "campo": "Mensaje del campo" } }
  ```

  `errores` solo aparece en respuestas 400 de validación.
- Nunca se devuelven stack traces ni mensajes de MongoDB (constitución, principio VI).

Respuestas de error comunes:

| Código | Cuándo                                                         | `mensaje`                                                        |
|--------|----------------------------------------------------------------|------------------------------------------------------------------|
| 400    | Datos inválidos (POST/PUT)                                     | `Los datos de la mascota no son válidos` + `errores` por campo    |
| 400    | Filtro con valor no permitido (GET listado)                    | `El filtro de especie no es válido` / `El filtro de estado no es válido` |
| 400    | Cuerpo que no es JSON válido                                   | `El cuerpo de la solicitud no es un JSON válido`                  |
| 404    | `:id` inexistente o con formato inválido                       | `Esta mascota ya no existe`                                       |
| 404    | Ruta no definida                                               | `Recurso no encontrado`                                           |
| 500    | Error inesperado (p. ej. base de datos caída)                  | `Ocurrió un error interno. Intenta de nuevo más tarde`            |

---

## GET /api/mascotas

Lista las mascotas, de la más reciente a la más antigua (`createdAt` descendente).

**Query (opcionales, combinables)**:

| Parámetro | Valores                     |
|-----------|-----------------------------|
| `especie` | `perro`, `gato`, `otro`     |
| `estado`  | `disponible`, `adoptado`    |

Un parámetro ausente o vacío no filtra.

**200**

```json
[
  {
    "_id": "6650f1c2a1b2c3d4e5f60718",
    "nombre": "Luna",
    "especie": "gato",
    "edad": 2,
    "estado": "disponible",
    "descripcion": "Muy cariñosa",
    "createdAt": "2026-10-04T15:20:00.000Z",
    "updatedAt": "2026-10-04T15:20:00.000Z"
  }
]
```

Sin coincidencias → `200` con `[]`. **400** si un filtro tiene un valor no permitido.

---

## GET /api/mascotas/resumen

Contadores para el inicio. Se declara antes de `/:id`. Calculado con `contarPorEstado`.

**200**

```json
{ "disponibles": 4, "adoptados": 2 }
```

Sin mascotas → `{ "disponibles": 0, "adoptados": 0 }`.

---

## GET /api/mascotas/:id

**200**: la `Mascota` completa. **404**: `Esta mascota ya no existe`.

---

## POST /api/mascotas

Crea una mascota. Se valida con `validarMascota` antes de persistir; solo se guardan los
campos permitidos, normalizados.

**Cuerpo**

```json
{
  "nombre": "Luna",
  "especie": "gato",
  "edad": 2,
  "estado": "disponible",
  "descripcion": "Muy cariñosa"
}
```

`estado` es opcional (por defecto `disponible`); `descripcion` es opcional.

**201**: la `Mascota` creada (con `_id`, `createdAt`, `updatedAt`).

**400** (ejemplo)

```json
{
  "mensaje": "Los datos de la mascota no son válidos",
  "errores": {
    "nombre": "El nombre es obligatorio",
    "edad": "La edad debe ser un número entero entre 0 y 30"
  }
}
```

---

## PUT /api/mascotas/:id

Reemplaza todos los datos editables de la mascota. Mismas reglas y cuerpo que POST. Gana el
último que guarda (FR-030): no hay control de versiones. "Marcar como adoptada" usa este
endpoint enviando los datos actuales con `"estado": "adoptado"`.

**200**: la `Mascota` actualizada. **400**: validación (mismo formato que POST).
**404**: `Esta mascota ya no existe`.

---

## DELETE /api/mascotas/:id

Elimina la mascota de forma definitiva.

**204**: sin cuerpo. **404**: `Esta mascota ya no existe`.

---

## Contrato de rutas del frontend

| Ruta                    | Pantalla                                   | Llamadas a la API                         |
|-------------------------|--------------------------------------------|-------------------------------------------|
| `` (vacía)              | Inicio: bienvenida, contadores, accesos    | `GET /mascotas/resumen`                   |
| `/mascotas`             | Listado en tarjetas con filtros            | `GET /mascotas?especie=&estado=`          |
| `/mascotas/nueva`       | Formulario de alta                         | `POST /mascotas`                          |
| `/mascotas/:id`         | Detalle con editar, eliminar y adoptar     | `GET /mascotas/:id`, `PUT`, `DELETE`      |
| `/mascotas/:id/editar`  | Formulario de edición precargado           | `GET /mascotas/:id`, `PUT /mascotas/:id`  |
| `**`                    | Redirige a inicio                          | —                                         |

`/mascotas/nueva` se declara antes de `/mascotas/:id`. Todas las llamadas pasan por
`MascotasService` con métodos `listar(filtros)`, `obtenerResumen()`, `obtener(id)`,
`crear(datos)`, `actualizar(id, datos)` y `eliminar(id)`.
