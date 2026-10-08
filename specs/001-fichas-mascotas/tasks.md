---

description: "Lista de tareas para implementar las fichas de mascotas en adopción"
---

# Tareas: Fichas de mascotas en adopción

**Entrada**: documentos de diseño en `specs/001-fichas-mascotas/`

**Prerrequisitos**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/api-mascotas.md](contracts/api-mascotas.md),
[quickstart.md](quickstart.md)

**Pruebas**: se incluyen solo las pruebas unitarias que exige la constitución (principio IV) y
que el plan define: `validarMascota`, `validarFiltros` y `contarPorEstado` con `node --test`
(escritas antes que la implementación, en TDD), una prueba de humo para arrancar la CI y, en el
frontend, `MascotasService` y los validadores del formulario con `ng test`. No hay pruebas de
integración ni de punta a punta automatizadas; la validación manual sigue
[quickstart.md](quickstart.md).

**Organización**: las tareas se agrupan por **Issue de GitHub** (una rama corta y un Pull Request
por Issue, con `Closes #n`). Dentro de cada grupo, la etiqueta `[USn]` indica a qué historia de
usuario de la spec sirve cada tarea.

> **Nota sobre la CI**: Los PR de documentación (#1, #2) son previos al pipeline; desde el PR de
> #7 todo cambio de código pasa por CI y main exige el check en verde.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: se puede hacer en paralelo (archivo distinto y sin dependencias pendientes).
- **[USn]**: historia de usuario de [spec.md](spec.md):
  - **US1** Registrar una mascota (P1)
  - **US2** Consultar el listado con filtros (P1)
  - **US3** Ver detalle, marcar como adoptada y eliminar (P2)
  - **US4** Editar una mascota (P2)
  - **US5** Inicio con contadores (P3)
- Las tareas de estructura o infraestructura no llevan etiqueta de historia.
- Las rutas son relativas a la raíz del repositorio (`backend/`, `frontend/`).

## Convenciones de nombres del frontend

- Los **servicios** llevan el sufijo `.service.ts` y el sufijo `Service` en la clase
  (`mascotas.service.ts` → `MascotasService`, `notificacion.service.ts` → `NotificacionService`).
- Los **componentes** siguen la convención del CLI 22, **sin** sufijo (`inicio.ts`, `lista.ts`,
  `detalle.ts`, `formulario.ts`, `notificacion.ts`), con su plantilla `.html` al lado.
- Las pruebas usan el sufijo `.spec.ts` junto al archivo que prueban.

---

## Issue #7 — Workflow de GitHub Actions (CI), job backend

**Responsable**: Andy

**Objetivo**: poner en marcha la CI antes de cualquier código de negocio (constitución,
principio IV), con lo mínimo del backend para que el job `backend` tenga algo que ejecutar. El
job `frontend` se añade en el Issue #3.

**Prueba independiente**: el Pull Request de este Issue muestra el job `backend` en verde, y
`main` queda protegida exigiendo ese check.

**Depende de**: nada. Es el primer grupo de código.

- [ ] T001 Crear `backend/package.json` mínimo (dentro de `backend/`, `npm init -y`) con `"name": "huellitas-backend"`, `"private": true`, sin `"type"` (CommonJS) y solo el script `"test": "node --test"`. Sin dependencias. Ejecutar `npm install` para generar `backend/package-lock.json` (lo necesita `npm ci` en la CI).
- [ ] T002 [P] Crear la prueba de humo `backend/test/smoke.test.js` con `node:test` y `node:assert/strict`: una única prueba que siempre pasa (p. ej. `assert.equal(1 + 1, 2)`), para que `npm test` tenga al menos una prueba que ejecutar. Se conserva después como comprobación de que el runner funciona.
- [ ] T003 [P] Crear `.github/workflows/ci.yml` con nombre "CI", disparado en `pull_request` y en `push` a `main`, con un job `backend` en `ubuntu-latest`: `actions/checkout`, `actions/setup-node` (Node 24, `cache: npm`, `cache-dependency-path: backend/package-lock.json`), `defaults.run.working-directory: backend`, y los pasos `npm ci` → `npm test`. No usar secretos: las pruebas no necesitan `MONGODB_URI`. Dejar el archivo preparado para añadir un segundo job independiente `frontend` (Issue #3).
- [ ] T004 Ejecutar `npm test` en `backend/` y confirmar que pasa la prueba de humo; abrir el Pull Request de este Issue, comprobar que el job `backend` de `.github/workflows/ci.yml` termina en verde y, tras fusionar, configurar en la protección de `main` en GitHub que el check `backend` sea obligatorio.

**Punto de control**: desde aquí ningún cambio de código entra a `main` con el pipeline en rojo.

---

## Issue #8 — Pruebas unitarias de contarPorEstado, validarMascota y validarFiltros con node --test (TDD)

**Responsable**: Andy

**Objetivo**: escribir primero las pruebas de la lógica de negocio pura y después su
implementación en `backend/src/utils/`, sin dependencias extra ni base de datos.

**Enfoque TDD explícito** (dos commits en la rama del Issue):
1. **Primer commit, solo pruebas** (T005–T008), p. ej.
   `test(utils): agregar pruebas de contarPorEstado, validarMascota y validarFiltros`.
   La CI queda **en rojo, como se espera**, porque los módulos aún no existen.
2. **Segundo commit, implementación** (T009–T012), p. ej.
   `feat(utils): implementar contarPorEstado, validarMascota y validarFiltros`.
   La CI pasa **a verde** y el PR se puede fusionar.

**Prueba independiente**: `npm test` dentro de `backend/`, sin `.env` ni conexión a internet,
termina con todas las pruebas en verde; el historial del PR muestra el paso de rojo a verde.

**Depende de**: Issue #7 (`backend/package.json` y CI activa).

### Primer commit: pruebas (CI en rojo esperado)

- [ ] T005 [P] [US1] Escribir `backend/src/utils/validarMascota.test.js` con `node:test` y `node:assert/strict`, importando `{ validarMascota }` de `./validarMascota`, cubriendo: datos válidos (`valido: true`, `errores` vacío); nombre ausente, vacío y solo espacios → "El nombre es obligatorio"; nombre de 1 y de 41 caracteres → "El nombre debe tener entre 2 y 40 caracteres"; nombres de 2 y 40 caracteres aceptados; nombre con espacios alrededor se recorta en `datos`; especie `"pez"` y ausente → "La especie debe ser perro, gato u otro"; edad `-1`, `31`, `2.5`, `"3"` y ausente → "La edad debe ser un número entero entre 0 y 30"; edades `0` y `30` aceptadas; descripción de 200 caracteres aceptada, de 201 rechazada con "La descripción no puede superar los 200 caracteres" y de 200 con espacios alrededor aceptada; descripción ausente → `""`; estado ausente → `disponible`; estado inválido → "El estado debe ser disponible o adoptado"; nombre y edad vacíos a la vez → dos errores; campos extra (p. ej. `_id`, `createdAt`) no aparecen en `datos`; entrada `null` → inválida sin lanzar excepción.
- [ ] T006 [P] [US5] Escribir `backend/src/utils/contarPorEstado.test.js` con `node:test` y `node:assert/strict`, importando `{ contarPorEstado }` de `./contarPorEstado`, cubriendo: arreglo vacío → `{ disponibles: 0, adoptados: 0 }`; 4 disponibles y 2 adoptados → `{ disponibles: 4, adoptados: 2 }`; elementos con estado desconocido no se cuentan.
- [ ] T007 [P] [US2] Escribir `backend/src/utils/validarFiltros.test.js` con `node:test` y `node:assert/strict`, importando `{ validarFiltros }` de `./validarFiltros`, cubriendo: query `undefined` y `{}` → válido con `filtro: {}` y `mensaje: null`; `{ especie: '', estado: '' }` → `filtro: {}`; `{ especie: 'perro' }`, `{ estado: 'adoptado' }` y ambos combinados → `filtro` con solo esas claves; `{ especie: 'pez' }` → "El filtro de especie no es válido"; `{ estado: 'perdido' }` → "El filtro de estado no es válido"; ambos inválidos → se informa el de especie; `{ especie: ['perro', 'gato'] }` → inválido; claves extra (p. ej. `nombre`) no aparecen en `filtro`.
- [ ] T008 Hacer el primer commit solo con `backend/src/utils/validarMascota.test.js`, `backend/src/utils/contarPorEstado.test.js` y `backend/src/utils/validarFiltros.test.js`, subir la rama y abrir el PR; comprobar que el job `backend` falla porque los módulos no existen (rojo esperado). No fusionar todavía.

### Segundo commit: implementación (CI en verde)

- [ ] T009 [P] Implementar la función pura `validarMascota(datos)` en `backend/src/utils/validarMascota.js` según [data-model.md](data-model.md): devuelve `{ valido, errores, datos }`; acepta `null` o campos extra (se ignoran); recorta `nombre` y `descripcion`; reglas y mensajes literales: nombre ausente, no texto o vacío tras recortar → "El nombre es obligatorio"; longitud recortada < 2 o > 40 → "El nombre debe tener entre 2 y 40 caracteres"; especie fuera de `perro`/`gato`/`otro` → "La especie debe ser perro, gato u otro"; edad que no cumpla `Number.isInteger` o fuera de 0–30 → "La edad debe ser un número entero entre 0 y 30"; estado ausente → `disponible`, fuera de `disponible`/`adoptado` → "El estado debe ser disponible o adoptado"; descripción ausente o vacía → `""`, no texto o > 200 caracteres tras recortar → "La descripción no puede superar los 200 caracteres". Un error por campo y todos los campos inválidos a la vez. `datos` solo contiene `nombre, especie, edad, estado, descripcion`. Exportar con `module.exports = { validarMascota }`.
- [ ] T010 [P] Implementar la función pura `contarPorEstado(mascotas)` en `backend/src/utils/contarPorEstado.js`: recibe un arreglo de objetos con `estado` y devuelve `{ disponibles, adoptados }`; arreglo vacío → `{ disponibles: 0, adoptados: 0 }`; estados desconocidos no se cuentan. Exportar con `module.exports = { contarPorEstado }`.
- [ ] T011 [P] Implementar la función pura `validarFiltros(query)` en `backend/src/utils/validarFiltros.js`: recibe el objeto de query (puede ser `undefined` o tener claves extra, que se ignoran) y devuelve `{ valido, mensaje, filtro }`. `especie` y `estado` son opcionales; ausentes o cadena vacía no filtran. Si `especie` tiene un valor que no es exactamente `perro`, `gato` u `otro` (incluido un arreglo por parámetro repetido) → `valido: false`, `mensaje: 'El filtro de especie no es válido'`; lo mismo para `estado` fuera de `disponible`/`adoptado` → `'El filtro de estado no es válido'` (si ambos fallan, se informa el de especie). Si es válido, `filtro` contiene solo las claves presentes y no vacías (p. ej. `{}` o `{ especie: 'gato', estado: 'disponible' }`) y `mensaje` es `null`. Exportar con `module.exports = { validarFiltros }`.
- [ ] T012 Ejecutar `npm test` en `backend/` sin `backend/.env` y confirmar que pasan la prueba de humo y las de `validarMascota`, `contarPorEstado` y `validarFiltros` (si alguna falla, corregir la implementación, no la prueba, salvo que contradiga [data-model.md](data-model.md)); hacer el segundo commit con los tres archivos de implementación, comprobar que el job `backend` del PR pasa a verde y fusionar tras la aprobación.

**Punto de control**: lógica de negocio del backend probada, con evidencia de TDD en el PR.

---

## Issue #6 — Backend: API REST + modelo + conexión MongoDB Atlas

**Responsable**: Andy

**Objetivo**: API Express en `backend/` con los 6 endpoints de
[contracts/api-mascotas.md](contracts/api-mascotas.md), usando `validarMascota`, `validarFiltros` y
`contarPorEstado` (Issue #8) y conectada a MongoDB Atlas por `MONGODB_URI`.

**Prueba independiente**: con `backend/.env` apuntando a Atlas, `npm run dev` arranca y las
comprobaciones de la sección 3 de [quickstart.md](quickstart.md) dan el resultado esperado; el job
`backend` de la CI sigue en verde.

**Depende de**: Issue #8 (utils) e Issue #7 (CI activa).

### Configuración

- [ ] T013 Instalar las dependencias de producción `express` (v5), `mongoose`, `cors` y `dotenv` en `backend/package.json`, actualizando `backend/package-lock.json`, y añadir los scripts `"start": "node src/server.js"` y `"dev": "node --watch src/server.js"` junto al `"test"` existente. No añadir dependencias de desarrollo.
- [ ] T014 [P] Crear `backend/.env.example` con `MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/huellitas` y `PORT=3000`, y comprobar que el `.gitignore` de la raíz ignora `backend/.env` (reglas `.env` y `!.env.example` ya existentes).

### Modelo y aplicación Express

- [ ] T015 [P] Crear el esquema Mongoose `Mascota` en `backend/src/models/mascota.js` (colección `mascotas`, `timestamps: true`, `versionKey: false`) con: `nombre` String requerido con `trim`; `especie` String requerido con `enum: ['perro', 'gato', 'otro']`; `edad` Number requerido con `min: 0`, `max: 30`; `estado` String con `required: true`, `enum: ['disponible', 'adoptado']` y `default: 'disponible'`; `descripcion` String con `trim`, `maxlength: 200` y `default: ''`. Exportar con `mongoose.model('Mascota', esquema)` (depende de T013).
- [ ] T016 Crear `backend/src/routes/mascotas.js` con un `express.Router()` exportado y una función auxiliar interna que responda `404 { mensaje: 'Esta mascota ya no existe' }`, usada cuando `mongoose.isValidObjectId(id)` sea falso o el documento no exista (depende de T015).
- [ ] T017 Crear `backend/src/app.js`: `express()`, `cors()` con la configuración por defecto, `express.json()`, montar el router de T016 en `/api/mascotas`, responder `404 { mensaje: 'Recurso no encontrado' }` para rutas no definidas y un middleware de errores final que responda `400 { mensaje: 'El cuerpo de la solicitud no es un JSON válido' }` si `err.type === 'entity.parse.failed'` y en otro caso haga `console.error(err)` y responda `500 { mensaje: 'Ocurrió un error interno. Intenta de nuevo más tarde' }`. Exportar `app` sin llamar a `listen` (depende de T016).
- [ ] T018 Crear `backend/src/server.js`: `require('dotenv').config()`; si falta `MONGODB_URI`, mostrar un mensaje claro en español y salir con código 1; `mongoose.connect(MONGODB_URI)`; luego `app.listen(process.env.PORT || 3000)` con un mensaje de arranque; si la conexión falla, mostrar el error y salir con código 1 (depende de T017).

### Endpoints (todos en `backend/src/routes/mascotas.js`, en este orden)

- [ ] T019 [US2] Implementar `GET /` en `backend/src/routes/mascotas.js`: llamar a `validarFiltros(req.query)` (T011); si no es válido, responder `400 { mensaje }` con el mensaje devuelto; si lo es, `Mascota.find(resultado.filtro).sort({ createdAt: -1 })` y responder `200` con el arreglo.
- [ ] T020 [US5] Implementar `GET /resumen` en `backend/src/routes/mascotas.js`, declarado ANTES de `/:id`: `Mascota.find({}, 'estado')` → `contarPorEstado` → `200 { disponibles, adoptados }`.
- [ ] T021 [US3] Implementar `GET /:id` en `backend/src/routes/mascotas.js`: 404 con la función auxiliar de T016 si el id es inválido o no existe; `200` con la mascota.
- [ ] T022 [US1] Implementar `POST /` en `backend/src/routes/mascotas.js`: `validarMascota(req.body)`; si no es válida, `400 { mensaje: 'Los datos de la mascota no son válidos', errores }`; si lo es, `Mascota.create(resultado.datos)` y `201` con la mascota creada.
- [ ] T023 [US4] Implementar `PUT /:id` en `backend/src/routes/mascotas.js`: 404 si el id es inválido; validar con `validarMascota` (400 igual que POST); `Mascota.findByIdAndUpdate(id, resultado.datos, { new: true, runValidators: true })`; 404 si devuelve `null`; `200` con la mascota actualizada. Sin control de versiones (gana el último que guarda, FR-030). También lo usa "Marcar como adoptada" (US3). **Comportamiento documentado**: si el cuerpo no trae `estado`, `validarMascota` lo interpreta como `disponible` y la ficha queda disponible; se mantiene así a propósito (ver [data-model.md](data-model.md)) porque el frontend siempre envía el estado.
- [ ] T024 [US3] Implementar `DELETE /:id` en `backend/src/routes/mascotas.js`: 404 si el id es inválido o `findByIdAndDelete` devuelve `null`; `204` sin cuerpo si se eliminó.

### Verificación

- [ ] T025 Verificar manualmente la API contra MongoDB Atlas siguiendo la sección 3 de `specs/001-fichas-mascotas/quickstart.md` (los 9 pasos, incluido el filtro inválido `?especie=pez` → 400) y comprobar que ninguna respuesta de error incluye stack traces ni mensajes de MongoDB.

**Punto de control**: API completa y funcionando contra Atlas; el frontend puede consumirla.

---

## Issue #3 — Frontend: estructura Angular + Tailwind, inicio y listado con filtros

**Responsable**: Melissa

**Objetivo**: proyecto Angular 22 en `frontend/` con Tailwind y el tema de la constitución,
`MascotasService`, notificaciones, inicio con contadores (US5), listado con filtros (US2) y el
job `frontend` en la CI.

**Prueba independiente**: con el backend levantado, el listado muestra el estado vacío con la base
sin mascotas; tras crear mascotas por API (curl), el inicio muestra los contadores correctos y el
listado muestra las tarjetas, filtra y muestra el estado sin coincidencias; el PR muestra los
jobs `backend` y `frontend` en verde.

**Depende de**: Issue #7 para el `ci.yml` (T042). El resto se puede empezar en paralelo con #6
trabajando contra el contrato; para probar en el navegador necesita la API de #6.

### Estructura

- [ ] T026 Crear el proyecto desde la raíz del repositorio con `ng new frontend --defaults --skip-git --style=tailwind --ssr=false` (Angular CLI 22; `--defaults` evita las preguntas interactivas; `--skip-git` porque el repositorio ya existe; componentes standalone y TypeScript estricto por defecto), generando `frontend/package.json` y `frontend/package-lock.json`. Si la opción `--style=tailwind` no está disponible, crear con `--style=css` y ejecutar `ng add tailwindcss --defaults` dentro de `frontend/`. No crear un repositorio git anidado.
- [ ] T027 Definir el tema en `frontend/src/styles.css` tras `@import "tailwindcss";` con `@theme`: colores pastel durazno, menta, lavanda y crema (con variantes de texto oscuro con contraste legible) y `--font-sans` con Nunito; fondo crema en `body`.
- [ ] T028 [P] Actualizar `frontend/src/index.html`: `lang="es"`, título "Huellitas" y enlace a Google Fonts para Nunito (pesos 400, 600, 700, 800).
- [ ] T029 [P] Generar el archivo de entorno con `ng generate environments` y dejar `frontend/src/environments/environment.ts` con `apiUrl: 'http://localhost:3000/api'`.
- [ ] T030 Añadir `provideHttpClient()` a los providers de `frontend/src/app/app.config.ts` (junto al `provideRouter(routes)` existente).

### Servicios compartidos

- [ ] T031 [P] Crear los tipos en `frontend/src/app/mascotas/mascota.ts`: `Especie = 'perro' | 'gato' | 'otro'`, `Estado = 'disponible' | 'adoptado'`, `Mascota` (`_id`, `nombre`, `especie`, `edad`, `estado`, `descripcion`, `createdAt`, `updatedAt`), `MascotaDatos` (los cinco campos editables) y `Resumen` (`disponibles`, `adoptados`), según [data-model.md](data-model.md).
- [ ] T032 Crear `MascotasService` (`providedIn: 'root'`) en `frontend/src/app/mascotas/mascotas.service.ts` usando `environment.apiUrl`: `listar(filtros: { especie?: string; estado?: string })` (añade cada parámetro solo si tiene valor), `obtenerResumen()`, `obtener(id)`, `crear(datos)`, `actualizar(id, datos)` y `eliminar(id)`, con las URL y métodos de [contracts/api-mascotas.md](contracts/api-mascotas.md) (depende de T029 y T031).
- [ ] T033 Escribir `frontend/src/app/mascotas/mascotas.service.spec.ts` con `HttpTestingController`: cada método llama a la URL y al método HTTP correctos; `listar` sin filtros no envía parámetros y con filtros envía solo los que tienen valor (depende de T032).
- [ ] T034 [P] Crear `NotificacionService` en `frontend/src/app/notificacion/notificacion.service.ts` con una señal `mensaje` y un método `mostrar(texto)` que la asigna y la limpia a los ~3 s (reiniciando el temporizador si llega otro mensaje); y el componente `frontend/src/app/notificacion/notificacion.ts` que lo muestra en una burbuja con `role="status"` y `aria-live="polite"`.
- [ ] T035 Reemplazar el contenido generado de `frontend/src/app/app.html` (la página de ejemplo del CLI) y ajustar `frontend/src/app/app.ts` con la estructura general: cabecera con la marca "Huellitas" (enlace a inicio) y enlace "Mascotas", `<main>` con `<router-outlet />` y el componente de notificación; contenedor centrado mobile-first sin desplazamiento horizontal a 360 px (depende de T034).

### Inicio (US5)

- [ ] T036 [US5] Crear el componente de inicio en `frontend/src/app/inicio/inicio.ts` (+ `inicio.html`): bienvenida breve; al cargar llama a `obtenerResumen()` con una señal `cargando` e indicador visible; muestra "Disponibles: N" y "Adoptadas: N" en tarjetas pastel; accesos directos "Ver mascotas" (`/mascotas`) y "Registrar mascota" (`/mascotas/nueva`); ante error muestra "No se pudo completar la acción. Revisa tu conexión e inténtalo de nuevo." (depende de T032).

### Listado con filtros (US2)

- [ ] T037 [US2] Crear el componente de listado en `frontend/src/app/mascotas/lista/lista.ts` (+ `lista.html`) con señales `mascotas`, `cargando`, `error`, `especie` y `estado`; carga con `listar()` al iniciar y cada vez que cambia un filtro; muestra el indicador de carga mientras consulta y el mensaje de error genérico en español si falla (depende de T032).
- [ ] T038 [US2] Añadir en `frontend/src/app/mascotas/lista/lista.html` los filtros con `label` asociado: especie (Todas, Perro, Gato, Otro) y estado (Todos, Disponible, Adoptado), combinables, con área táctil mínima de 44 × 44 px y foco visible.
- [ ] T039 [US2] Mostrar en `frontend/src/app/mascotas/lista/lista.html` las tarjetas (nombre, especie, edad en años y estado con distintivo de color) como enlaces a `/mascotas/:id`, en `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, con bordes redondeados, sombra suave y hover con leve elevación (transición de 150–250 ms).
- [ ] T040 [US2] Añadir en `frontend/src/app/mascotas/lista/lista.html` y `lista.ts` los dos estados especiales: sin mascotas y sin filtros → "Aún no hay mascotas registradas" con acceso a `/mascotas/nueva`; con filtros sin coincidencias → "No hay mascotas que coincidan con los filtros" con un botón "Quitar filtros" que los reinicia. (Como el filtrado es en el servidor, con la base vacía y un filtro aplicado se ve el segundo mensaje; se acepta porque los filtros se reinician al entrar al listado.)
- [ ] T041 Configurar `frontend/src/app/app.routes.ts` con `''` → inicio, `'mascotas'` → listado y `'**'` → redirección a `''`, dejando `'**'` como última ruta (depende de T036 y T037).

### CI y verificación

- [ ] T042 Añadir a `.github/workflows/ci.yml` (creado en T003) un segundo job independiente `frontend` en `ubuntu-latest`: `actions/checkout`, `actions/setup-node` (Node 24, `cache: npm`, `cache-dependency-path: frontend/package-lock.json`), `defaults.run.working-directory: frontend`, y los pasos `npm ci` → `npm test -- --watch=false` → `npm run build`. Sin modificar el job `backend`.
- [ ] T043 Ejecutar `npm test -- --watch=false` y `npm run build` en `frontend/` y verificar en el navegador, en este orden: (1) **con la base sin mascotas**, el inicio muestra ambos contadores en 0 y el listado muestra "Aún no hay mascotas registradas" con su acceso a registrar; (2) **después**, crear datos de prueba por API con curl (p. ej. 3 perros y 2 gatos, uno de ellos adoptado, con `POST /api/mascotas` según la sección 3 de `specs/001-fichas-mascotas/quickstart.md`), no desde el formulario (aún no existe), y comprobar contadores, tarjetas (la más reciente primero), filtros solos y combinados y el mensaje sin coincidencias con "Quitar filtros"; (3) a 360 px una columna sin desplazamiento horizontal y 2–3 columnas en tablet y escritorio. Abrir el PR, comprobar que los jobs `backend` y `frontend` están en verde y, tras fusionar, añadir `frontend` como check obligatorio en la protección de `main`.

**Punto de control**: inicio y listado funcionando; US2 y US5 verificables por separado; la CI
cubre backend y frontend.

---

## Issue #4 — Frontend: formulario crear/editar y detalle

**Responsable**: Melissa

**Objetivo**: formulario único para registrar (US1) y editar (US4) y pantalla de detalle con
marcar como adoptada y eliminar (US3).

**Prueba independiente**: pasos 2, 4, 5 y 6 de la sección 4 de [quickstart.md](quickstart.md);
jobs de CI en verde.

**Depende de**: Issue #3 (estructura, `MascotasService`, notificaciones, rutas y job `frontend`).

### Validadores del formulario

- [ ] T044 [P] [US1] Crear `frontend/src/app/mascotas/validadores.ts` con: la constante `MENSAJES` con los textos literales de [data-model.md](data-model.md) ("El nombre es obligatorio", "El nombre debe tener entre 2 y 40 caracteres", "La especie debe ser perro, gato u otro", "La edad debe ser un número entero entre 0 y 30", "El estado debe ser disponible o adoptado", "La descripción no puede superar los 200 caracteres"); el validador `nombreValido` que, sobre el valor recortado (`trim`), devuelve `{ obligatorio: true }` si queda vacío y `{ longitud: true }` si tiene menos de 2 o más de 40 caracteres; y el validador `descripcionValida` que, sobre el valor recortado (`trim`), devuelve `{ longitud: true }` si supera los 200 caracteres (vacío o `null` es válido), para coincidir con la regla del backend.
- [ ] T045 [US1] Escribir `frontend/src/app/mascotas/validadores.spec.ts`: `nombreValido` con `''`, `'   '`, `'a'`, `'ab'`, 40 y 41 caracteres y `'  Luna  '`; `descripcionValida` con `''`, `null`, 200 caracteres, 201 caracteres y 200 caracteres con espacios al inicio y al final (válida); y que `MENSAJES` coincide con los textos de la spec (depende de T044).

### Formulario de registro (US1)

- [ ] T046 [US1] Crear el componente de formulario en `frontend/src/app/mascotas/formulario/formulario.ts` (+ `formulario.html`) con un `FormGroup` tipado (Reactive Forms): `nombre` con `nombreValido`; `especie` con `Validators.required`; `edad` con `Validators.required`, `Validators.min(0)`, `Validators.max(30)` y `Validators.pattern(/^\d+$/)`; `estado` con valor inicial `'disponible'`; `descripcion` con `descripcionValida` (no `Validators.maxLength`). Cada campo con `<label for>` asociado; especie y estado como `<select>` solo con las opciones válidas; edad como `<input type="number">` (depende de T044).
- [ ] T047 [US1] Mostrar los mensajes de `MENSAJES` junto a cada campo en `frontend/src/app/mascotas/formulario/formulario.html` solo cuando el control es inválido y está `touched` (FR-018a): ningún error al abrir el formulario ni mientras se escribe por primera vez; si el control tiene el error `servidor`, mostrar su texto en el mismo lugar y con el mismo estilo; enlazar el mensaje con `aria-describedby`.
- [ ] T048 [US1] Implementar el envío en modo alta en `frontend/src/app/mascotas/formulario/formulario.ts`: al pulsar "Guardar", `markAllAsTouched()` y abortar si es inválido; si es válido, señal `guardando` = true (botón deshabilitado + indicador de carga), `crear(datos)` con nombre y descripción recortados; al éxito, `NotificacionService.mostrar('Mascota registrada correctamente')` y navegar a `/mascotas/:id` de la mascota creada; ante `400`, recorrer `errores` de la respuesta y, por cada campo, llamar a `control.setErrors({ servidor: mensaje })` y `markAsTouched()` para que se muestre igual que las validaciones locales (el error desaparece cuando el usuario edita el campo, porque los validadores se vuelven a ejecutar); ante otro error, mostrar "No se pudo completar la acción. Revisa tu conexión e inténtalo de nuevo." sin borrar lo escrito; `guardando` vuelve a false al terminar con error.
- [ ] T049 [US1] Añadir el botón "Cancelar" en `frontend/src/app/mascotas/formulario/formulario.html` que vuelve sin guardar (a `/mascotas` en alta, a `/mascotas/:id` en edición), y la ruta `'mascotas/nueva'` → formulario en `frontend/src/app/app.routes.ts`, declarada antes de `'mascotas/:id'`; mantener la ruta `'**'` como última.

### Detalle, marcar como adoptada y eliminar (US3)

- [ ] T050 [US3] Crear el componente de detalle en `frontend/src/app/mascotas/detalle/detalle.ts` (+ `detalle.html`): lee `:id`, carga con `obtener(id)` mostrando indicador; muestra nombre, especie, edad, estado y la descripción si existe; si la API responde 404 muestra "Esta mascota ya no existe" con enlace "Volver al listado"; otros errores → mensaje genérico en español. Añadir la ruta `'mascotas/:id'` en `frontend/src/app/app.routes.ts`; mantener la ruta `'**'` como última (depende de T032).
- [ ] T051 [US3] Implementar "Marcar como adoptada" en `frontend/src/app/mascotas/detalle/detalle.ts` y `detalle.html`: visible solo si `estado === 'disponible'`; llama a `actualizar(id, { ...datosActuales, estado: 'adoptado' })` con indicador y botón deshabilitado; al éxito actualiza la mascota mostrada y `mostrar('Mascota marcada como adoptada')`; 404 → "Esta mascota ya no existe".
- [ ] T052 [US3] Implementar "Eliminar" en `frontend/src/app/mascotas/detalle/detalle.ts` y `detalle.html`: pedir confirmación con el componente propio `DialogoConfirmacion` (`frontend/src/app/dialogo-confirmacion/`, no `window.confirm`), con el estilo de la app, el título "¿Eliminar a <nombre>?" y los botones "Cancelar" y "Sí, eliminar"; accesible: foco inicial en "Cancelar", foco atrapado, cierre con Escape o clic en el fondo y foco devuelto al botón "Eliminar"; si cancela, no hacer nada; si confirma, deshabilitar botones con indicador, `eliminar(id)`, `mostrar('Mascota eliminada')` y navegar a `/mascotas`; 404 → "Esta mascota ya no existe".
- [ ] T053 [US3] Añadir en `frontend/src/app/mascotas/detalle/detalle.html` el botón "Editar" que navega a `/mascotas/:id/editar`, con todos los botones de acción con área táctil mínima de 44 × 44 px y foco visible.

### Edición (US4)

- [ ] T054 [US4] Añadir el modo edición en `frontend/src/app/mascotas/formulario/formulario.ts`: si la ruta trae `:id`, cargar con `obtener(id)` mostrando indicador y precargar el formulario con `patchValue` (incluido `estado`, editable en ambos sentidos); 404 → "Esta mascota ya no existe" con enlace al listado. Añadir la ruta `'mascotas/:id/editar'` en `frontend/src/app/app.routes.ts`; mantener la ruta `'**'` como última.
- [ ] T055 [US4] Implementar el guardado en modo edición en `frontend/src/app/mascotas/formulario/formulario.ts`: mismas validaciones y manejo de errores que T048 (incluido `setErrors({ servidor: mensaje })` ante 400), pero con `actualizar(id, datos)`, mensaje `mostrar('Cambios guardados')` y navegación a `/mascotas/:id`; 404 → "Esta mascota ya no existe".

### Verificación

- [ ] T056 Revisar accesibilidad y diseño en `frontend/src/app/` (formulario, detalle, listado e inicio): `label` en cada campo, foco visible en todo elemento interactivo, contraste legible, áreas táctiles ≥ 44 × 44 px, sin desplazamiento horizontal a 360 px, textos en español y microinteracciones de los botones (hover con leve elevación o rebote y transiciones de 150–250 ms, como en las tarjetas; sin animación en botones deshabilitados).
- [ ] T057 Ejecutar `npm test -- --watch=false` y `npm run build` en `frontend/` y verificar en el navegador los pasos 2, 4, 5 y 6 de la sección 4 de `specs/001-fichas-mascotas/quickstart.md`; comprobar en el PR que los jobs `backend` y `frontend` están en verde.

**Punto de control**: todas las historias de usuario funcionan en el navegador.

---

## Issue #5 — README y documentación del flujo de trabajo

**Responsable**: Melissa

**Objetivo**: README que explique el proyecto, cómo levantarlo y cómo trabaja el equipo.

**Prueba independiente**: una persona nueva puede levantar backend y frontend solo con el README
y [quickstart.md](quickstart.md).

**Depende de**: Issues #6, #3 y #7 para documentar comandos y CI reales (se puede redactar en
paralelo y ajustar al final).

- [ ] T058 Reescribir `README.md` (raíz) con: descripción de Huellitas y del problema que resuelve; stack (Angular 22 + Tailwind, Node.js 24 + Express + Mongoose, MongoDB Atlas); estructura del monorepo (`frontend/`, `backend/`, `specs/`); requisitos previos; configuración de `backend/.env` a partir de `backend/.env.example` (sin credenciales reales); comandos para instalar, probar y ejecutar cada parte; y enlace a `specs/001-fichas-mascotas/quickstart.md`.
- [ ] T059 Añadir a `README.md` la sección "Flujo de trabajo": pasos SDD (`/speckit-specify`, `/speckit-clarify`, `/speckit-plan`, `/speckit-tasks`, Issues, implementación); Trunk Based simplificado (`main` protegida, una rama corta por Issue); Conventional Commits en español con ejemplo; TDD para la lógica de negocio (commit de pruebas en rojo y luego commit de implementación en verde, como en #8); Pull Request con `Closes #n`, revisión y aprobación del otro integrante y CI en verde (los PR de documentación #1 y #2 fueron previos al pipeline; desde #7 todo cambio de código pasa por CI); y prohibición de subir `.env`.
- [ ] T060 [P] Añadir a `README.md` una tabla de Issues y responsables (#3, #4 y #5 Melissa; #6, #7 y #8 Andy) y la insignia de estado del workflow "CI" de `.github/workflows/ci.yml`.
- [ ] T061 Validar de punta a punta siguiendo `specs/001-fichas-mascotas/quickstart.md` completo desde un clon limpio (backend, frontend, comprobaciones de la API y recorrido en el navegador) y corregir en `README.md` o `quickstart.md` cualquier paso que no coincida.

**Punto de control**: proyecto documentado y validado de punta a punta.

---

## Dependencias y orden de ejecución

### Entre Issues

```text
Issue #7 (CI + package.json + prueba de humo) ──▶ Issue #8 (TDD utils) ──▶ Issue #6 (API) ─────────┐
        │                                                                                      │
        └──▶ Issue #3 (frontend base + job frontend) ──▶ Issue #4 (formulario y detalle) ──────┴──▶ Issue #5 (README, cierre)
```

- **Issue #7** va primero: crea `backend/package.json`, la prueba de humo y el `ci.yml` con el
  job `backend`. A partir de su PR, todo cambio de código pasa por CI.
- **Issue #8** escribe las pruebas (CI en rojo) y luego la implementación (CI en verde).
- **Issue #6** usa los utils de #8.
- **Issue #3** puede empezar en paralelo con #8 y #6 (contra el contrato); su PR necesita el
  `ci.yml` de #7 para añadir el job `frontend` (T042).
- **Issue #4** necesita la estructura y el servicio de #3.
- **Issue #5** se cierra al final, cuando los comandos y la CI son definitivos.

### Por historia de usuario

| Historia | Backend | Frontend |
|----------|---------|----------|
| US1 Registrar (P1) | T005, T009, T022 | T044–T049 |
| US2 Listado (P1) | T007, T011, T019 | T037–T040 |
| US3 Detalle, adoptar, eliminar (P2) | T021, T023, T024 | T050–T053 |
| US4 Editar (P2) | T023 | T054, T055 |
| US5 Inicio (P3) | T006, T010, T020 | T036 |

### Dentro de cada Issue

- Estructura y configuración → pruebas → utilidades → modelo → aplicación → endpoints → verificación.
- En #8 las pruebas (T005–T007) van siempre antes que la implementación (T009–T011).
- Las tareas sobre un mismo archivo (`backend/src/routes/mascotas.js`,
  `.github/workflows/ci.yml`, `formulario.ts`, `detalle.ts`, `app.routes.ts`) se hacen en orden,
  sin [P].

## Oportunidades de paralelismo

- **Entre personas**: Andy (#7 → #8 → #6) y Melissa (#3 → #4 → #5) trabajan en paralelo; Melissa
  abre el PR de #3 cuando #7 ya está fusionado.
- **Issue #7**: T002 y T003 en paralelo tras T001.
- **Issue #8**: T005, T006 y T007 en paralelo; luego T009, T010 y T011 en paralelo.
- **Issue #6**: T014 y T015 en paralelo tras T013.
- **Issue #3**: T028, T029, T031 y T034 en paralelo tras T027.

### Ejemplo: Issue #8 (primer commit)

```text
Tarea: "T005 Escribir backend/src/utils/validarMascota.test.js"
Tarea: "T006 Escribir backend/src/utils/contarPorEstado.test.js"
Tarea: "T007 Escribir backend/src/utils/validarFiltros.test.js"
```

### Ejemplo: Issue #3

```text
Tarea: "T028 Actualizar frontend/src/index.html (lang, título, Nunito)"
Tarea: "T029 Generar frontend/src/environments/environment.ts"
Tarea: "T031 Crear tipos en frontend/src/app/mascotas/mascota.ts"
Tarea: "T034 Crear NotificacionService y su componente"
```

## Estrategia de implementación

### MVP (US1 + US2, ambas P1)

1. Issue #7 (CI con job backend) e Issue #8 (utils en TDD).
2. Issue #6 completo (API) y en paralelo Issue #3 hasta el listado y el job frontend (T026–T043).
3. De Issue #4, solo el formulario de alta (T044–T049).
4. **Parar y validar**: registrar mascotas y verlas en el listado con filtros.

### Entrega incremental

1. MVP (US1 + US2) → demostración.
2. Detalle, adoptar y eliminar (US3, T050–T053) → validar.
3. Edición (US4, T054–T055) → validar.
4. Inicio con contadores (US5) ya listo desde Issue #3 → validar con datos reales.
5. Issue #5 documenta y valida todo de punta a punta.

## Notas

- Cada Issue se trabaja en su propia rama corta y entra por Pull Request con `Closes #n`,
  aprobado por el otro integrante y con la CI en verde.
- Commits en Conventional Commits en español, p. ej. `feat(api): agregar endpoint de resumen`.
- Nunca subir `backend/.env` ni credenciales.
- Ante cualquier duda de comportamiento, manda [spec.md](spec.md) (constitución, principio VII).
