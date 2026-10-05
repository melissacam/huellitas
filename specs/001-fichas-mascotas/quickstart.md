# Guía de arranque y validación: Fichas de mascotas en adopción

**Feature**: `001-fichas-mascotas` | **Plan**: [plan.md](plan.md)

Guía para levantar el proyecto en local y comprobar de punta a punta que la funcionalidad
cumple la [especificación](spec.md). Los detalles de la API están en
[contracts/api-mascotas.md](contracts/api-mascotas.md) y los del modelo en
[data-model.md](data-model.md).

## Requisitos previos

- Node.js 24 LTS y npm 11 (`node -v`, `npm -v`).
- Angular CLI 22 (`ng version`).
- Un clúster gratuito de MongoDB Atlas con un usuario de base de datos y la IP local permitida
  en *Network Access*.

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
```

Editar `backend/.env` (nunca se versiona):

```env
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/huellitas
PORT=3000
```

```bash
npm test     # pruebas unitarias con node --test (no necesitan base de datos)
npm run dev  # o: npm start
```

**Esperado**: las pruebas pasan; la consola indica que se conectó a MongoDB y que escucha en
el puerto 3000. Sin `MONGODB_URI` el servidor muestra un error claro y no arranca.

## 2. Frontend

```bash
cd frontend
npm install
npm test -- --watch=false   # pruebas unitarias
npm start                   # ng serve → http://localhost:4200
```

`src/environments/environment.ts` debe apuntar a `http://localhost:3000/api`.

## 3. Comprobación rápida de la API

Con el backend levantado (usar `curl.exe` en PowerShell):

| Paso | Petición                                                                                      | Resultado esperado                                       |
|------|-----------------------------------------------------------------------------------------------|----------------------------------------------------------|
| 1    | `GET /api/mascotas/resumen`                                                                   | `200` `{ "disponibles": 0, "adoptados": 0 }` en base vacía |
| 2    | `POST /api/mascotas` con `{"nombre":"Luna","especie":"gato","edad":2}`                        | `201`, `estado: "disponible"`, `descripcion: ""`          |
| 3    | `POST /api/mascotas` con `{"nombre":"  ","especie":"pez","edad":2.5}`                         | `400` con errores en `nombre`, `especie` y `edad`         |
| 4    | `GET /api/mascotas?especie=gato&estado=disponible`                                            | `200` con Luna                                            |
| 5    | `PUT /api/mascotas/<id>` con los datos de Luna y `"estado":"adoptado"`                        | `200`, estado actualizado                                 |
| 6    | `GET /api/mascotas/resumen`                                                                   | `{ "disponibles": 0, "adoptados": 1 }`                    |
| 7    | `DELETE /api/mascotas/<id>` y luego `GET /api/mascotas/<id>`                                  | `204`, luego `404` "Esta mascota ya no existe"            |
| 8    | `GET /api/mascotas/abc`                                                                       | `404` (id con formato inválido)                           |
| 9    | `GET /api/mascotas?especie=pez`                                                               | `400` `{ "mensaje": "El filtro de especie no es válido" }` |

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/mascotas -H "Content-Type: application/json" \
  -d '{"nombre":"Luna","especie":"gato","edad":2}'
```

## 4. Validación de punta a punta en el navegador

Con ambos servidores levantados, en `http://localhost:4200`:

1. **Inicio (HU5)**: con la base vacía, ver bienvenida y contadores en 0; accesos a listado y
   registro.
2. **Registro (HU1)**: abrir el formulario → no hay errores visibles; estado preseleccionado
   "disponible". Pulsar Guardar vacío → nombre y edad marcados a la vez. Edad -1 o 31 → mensaje
   de edad. Descripción de 201 caracteres y salir del campo → mensaje. Registrar "Luna", gato,
   2 → indicador de carga, botón deshabilitado y confirmación "Mascota registrada
   correctamente".
3. **Listado (HU2)**: registrar 3 perros y 2 gatos; ver 5 tarjetas, la más reciente primero.
   Filtrar por especie, por estado y combinados. Con filtros sin resultados → mensaje y opción
   de quitar filtros. Con base vacía → estado vacío con acceso a registrar.
4. **Detalle (HU3)**: abrir una tarjeta → todos los datos. "Marcar como adoptada" → estado
   cambia, confirmación, el botón desaparece y el inicio lo refleja. "Eliminar" → pedir
   confirmación; cancelar no borra; confirmar borra, avisa y vuelve al listado.
5. **Edición (HU4)**: editar → datos precargados; cambiar edad y guardar → "Cambios guardados".
   Revertir una adopción cambiando el estado a "disponible". Cancelar no guarda.
6. **Casos límite**: abrir `/mascotas/<id-eliminado>` → "Esta mascota ya no existe" con enlace
   al listado. Detener el backend e intentar guardar → mensaje claro en español, el formulario
   conserva lo escrito.
7. **Diseño adaptable (FR-031–033)**: en las herramientas del navegador a 360 px → una columna,
   sin desplazamiento horizontal; en tablet/escritorio → 2–3 columnas. Navegar con teclado y
   comprobar foco visible y `label` en cada campo.

## 5. Comandos que ejecutará la CI

```bash
# job backend
cd backend && npm ci && npm test
# job frontend
cd frontend && npm ci && npm test -- --watch=false && npm run build
```
