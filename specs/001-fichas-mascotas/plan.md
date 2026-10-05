# Plan de implementación: Fichas de mascotas en adopción

**Rama**: `001-fichas-mascotas` (trabajada en `docs/plan`) | **Fecha**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Entrada**: especificación funcional en `specs/001-fichas-mascotas/spec.md`

## Resumen

Huellitas permite al personal de un refugio pequeño registrar, listar con filtros, consultar,
editar, marcar como adoptadas y eliminar fichas de mascotas, y ver en el inicio cuántas están
disponibles y adoptadas. Se implementa como un monorepo con dos paquetes independientes: una
SPA Angular 22 (componentes standalone, Reactive Forms, Tailwind CSS) y una API REST en
Node.js + Express + Mongoose sobre una única colección `mascotas` en MongoDB Atlas. La lógica
de negocio (validación de una mascota y conteo por estado) vive en funciones puras del backend
probadas con `node --test`, sin base de datos. En todas las decisiones se elige la opción más
simple (ver [research.md](research.md)).

## Contexto técnico

**Lenguaje/Versión**: JavaScript (CommonJS) sobre Node.js 24 LTS en el backend; TypeScript
en modo estricto con Angular 22 (CLI 22.1.8) en el frontend.

**Dependencias principales**:
- Backend: `express`, `mongoose`, `cors`, `dotenv`. Sin dependencias de desarrollo.
- Frontend: Angular 22 (`@angular/core`, `@angular/router`, `@angular/forms`,
  `@angular/common/http`), `tailwindcss` v4 + `@tailwindcss/postcss`. Fuente Nunito desde
  Google Fonts.

**Almacenamiento**: MongoDB Atlas (plan gratuito), colección única `mascotas`, conexión por
`MONGODB_URI`.

**Pruebas**:
- Backend: test runner nativo `node --test` para `validarMascota` y `contarPorEstado`.
- Frontend: runner por defecto de Angular CLI 22 (Vitest vía `ng test`), ejecutado con
  `--watch=false` en CI; cubre los validadores del formulario y `MascotasService`
  (con `HttpTestingController`).

**Plataforma objetivo**: navegadores modernos de celular, tablet y escritorio (desde 360 px);
API en Node.js local (puerto 3000).

**Tipo de proyecto**: aplicación web (frontend SPA + API REST).

**Objetivos de rendimiento**: los propios de la spec (SC-001 a SC-003): respuestas percibidas
como inmediatas para decenas a pocos cientos de mascotas. Sin metas de throughput.

**Restricciones**: textos en español; sin desplazamiento horizontal a 360 px; áreas táctiles
≥ 44 × 44 px; sin errores internos expuestos al cliente; sin credenciales en el repositorio.

**Escala/Alcance**: un refugio, pocos usuarios simultáneos, cientos de registros como máximo,
5 rutas de frontend y 6 endpoints.

## Verificación de la constitución

*PUERTA: debe pasar antes de la Fase 0. Se vuelve a comprobar tras la Fase 1.*

| Principio | Cómo lo cumple el plan | Estado |
|-----------|------------------------|--------|
| I. Propósito y simplicidad | Sin capas de servicio/repositorio en el backend (rutas → modelo + utils); sin librerías de estado, de UI ni de validación; `window.confirm` para borrar; PUT reutilizado para "marcar como adoptada". Nada fuera de la spec. | ✅ |
| II. Stack fijo | `frontend/` Angular standalone + TS estricto + Tailwind; `backend/` Node + Express + Mongoose; una colección `mascotas`; `MONGODB_URI` por variable de entorno (`dotenv`). | ✅ |
| III. Diseño con personalidad y accesible | Tema Tailwind con paleta durazno/menta/lavanda/crema y Nunito; tarjetas redondeadas con sombra suave; hover con leve elevación y transiciones de 150–250 ms; `label` asociado a cada campo, foco visible (`focus-visible:ring`) y contraste legible. | ✅ |
| IV. Calidad verificada en CI | Pruebas unitarias para toda la lógica de negocio (`validarMascota`, `contarPorEstado`, validadores del formulario); workflow con jobs `backend` y `frontend` (pruebas + build) planificado. | ✅ |
| V. Colaboración Trunk Based | El plan no altera el flujo; las tareas se convertirán en Issues y ramas cortas. | ✅ |
| VI. Seguridad | `.env` ignorado y `.env.example` versionado; `validarMascota` antes de persistir y solo campos permitidos; middleware de errores con mensaje genérico 500; ids inválidos → 404 sin CastError. | ✅ |
| VII. Spec como fuente de verdad | Mensajes, reglas y comportamientos tomados literalmente de la spec; decisiones no cubiertas registradas en `research.md`. | ✅ |

**Resultado**: pasa sin violaciones. No hay complejidad que justificar.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/001-fichas-mascotas/
├── spec.md              # Especificación (ya existente)
├── plan.md              # Este archivo
├── research.md          # Fase 0: decisiones técnicas
├── data-model.md        # Fase 1: entidad Mascota, validaciones, estados
├── quickstart.md        # Fase 1: arranque y validación de punta a punta
├── contracts/
│   └── api-mascotas.md  # Fase 1: contrato REST y rutas del frontend
├── checklists/          # Ya existente
└── tasks.md             # Fase 2 (/speckit-tasks; no lo crea este comando)
```

### Código fuente (raíz del repositorio)

```text
backend/
├── package.json            # scripts: start (node src/server.js), dev (node --watch src/server.js), test (node --test)
├── .env.example            # MONGODB_URI=..., PORT=3000
└── src/
    ├── app.js              # crea la app Express: cors(), express.json(), rutas /api/mascotas,
    │                       # 404 genérico y middleware de errores (400 JSON inválido / 500 genérico).
    │                       # Exporta la app sin escuchar.
    ├── server.js           # require('dotenv').config(); valida MONGODB_URI; mongoose.connect; app.listen(PORT || 3000)
    ├── models/
    │   └── mascota.js      # esquema Mongoose (timestamps, versionKey: false)
    ├── routes/
    │   └── mascotas.js     # Router: GET /, GET /resumen, GET /:id, POST /, PUT /:id, DELETE /:id
    └── utils/
        ├── validarMascota.js
        ├── validarMascota.test.js
        ├── contarPorEstado.js
        └── contarPorEstado.test.js

frontend/                   # creado con `ng new frontend` (standalone, strict, Tailwind, sin SSR)
├── package.json
└── src/
    ├── styles.css          # @import "tailwindcss"; @theme con paleta pastel y fuente Nunito
    ├── environments/
    │   └── environment.ts  # apiUrl: 'http://localhost:3000/api'
    └── app/
        ├── app.ts / app.html / app.config.ts   # cabecera, <router-outlet>, notificación; provideRouter + provideHttpClient
        ├── app.routes.ts                        # '', 'mascotas', 'mascotas/nueva', 'mascotas/:id', 'mascotas/:id/editar', '**'
        ├── inicio/                              # bienvenida, contadores, accesos directos
        ├── notificacion/                        # NotificacionService (signal, autocierre ~3 s) + componente role="status"
        └── mascotas/
            ├── mascota.ts                       # tipos Mascota, MascotaDatos, Resumen, Especie, Estado
            ├── mascotas.service.ts (+ .spec.ts) # MascotasService: listar, obtenerResumen, obtener, crear, actualizar, eliminar
            ├── validadores.ts (+ .spec.ts)      # validador de nombre recortado 2–40 y mensajes compartidos del formulario
            ├── lista/                           # tarjetas + filtros (especie, estado), estados vacío y sin coincidencias
            ├── detalle/                         # datos, editar, eliminar (window.confirm), marcar como adoptada
            └── formulario/                      # alta y edición (Reactive Forms), un solo componente

.github/workflows/ci.yml    # (se implementará después) jobs backend y frontend
```

**Decisión de estructura**: aplicación web en monorepo con `frontend/` y `backend/`
independientes, cada uno con su `package.json` y `package-lock.json`, sin `package.json` en
la raíz. El backend no tiene capa de servicios: la ruta llama a `validarMascota` y luego al
modelo; la única lógica de negocio está en `src/utils/` y se prueba de forma aislada. Las
pruebas del backend se colocan junto a cada función (`*.test.js`), que `node --test` detecta
por defecto. En el frontend se usa la convención de nombres del CLI 22 (`lista.ts`,
`detalle.ts`, …) y un único componente de formulario para crear y editar.

## Diseño por capas

### Backend

- **Flujo de una petición de escritura**: `express.json()` → ruta → `validarMascota(req.body)`
  → si no es válida, `400 { mensaje, errores }` → `Mascota.create(datos)` o
  `findByIdAndUpdate(id, datos, { new: true, runValidators: true })` → respuesta.
- **Lectura por id / borrado**: `mongoose.isValidObjectId(id)` falso o documento no encontrado →
  `404 { mensaje: 'Esta mascota ya no existe' }`.
- **Listado**: valida `especie`/`estado` si vienen; `Mascota.find(filtro).sort({ createdAt: -1 })`.
- **Resumen**: `Mascota.find({}, 'estado')` → `contarPorEstado` → `{ disponibles, adoptados }`.
- **Errores asíncronos**: Express 5 propaga a `next(err)` los rechazos de handlers `async`,
  por lo que no se necesitan `try/catch` ni librerías auxiliares; el middleware final responde
  500 genérico y registra el error con `console.error`.
- **Arranque**: si falta `MONGODB_URI`, `server.js` muestra un mensaje claro y termina con
  código 1.

### Frontend

- **Estado**: señales de Angular en cada componente de página (`mascotas`, `cargando`,
  `guardando`, `error`, `noExiste`); sin librerías de estado. Los filtros viven en el
  componente de listado y se reinician al salir (supuesto de la spec).
- **Formulario** (FR-010 a FR-020): `FormGroup` tipado con `nombre` (validador propio de
  longitud recortada), `especie` (`required`), `edad` (`required`, `min(0)`, `max(30)`,
  `pattern` de entero), `estado` (valor inicial `disponible`), `descripcion` (`maxLength(200)`).
  Los errores se muestran solo cuando el control es inválido y está `touched` (Angular lo marca
  al salir del campo); al enviar se llama a `markAllAsTouched()` y se aborta si el formulario es
  inválido (FR-018a). En modo edición se precarga con `GET /:id`.
  Errores 400 del servidor se muestran junto a los campos correspondientes.
- **Carga y doble envío** (FR-034): `guardando` deshabilita Guardar/Eliminar y muestra un
  indicador; las páginas muestran un indicador mientras consultan.
- **Errores** (FR-027 y casos límite): 404 → "Esta mascota ya no existe" con enlace al listado;
  cualquier otro error → "No se pudo completar la acción. Revisa tu conexión e inténtalo de
  nuevo." sin perder los datos del formulario.
- **Confirmaciones** (FR-026): `NotificacionService.mostrar(texto)` con autocierre ~3 s.
- **Diseño** (FR-031 a FR-033, principio III): mobile-first con Tailwind; listado
  `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; controles con `min-h-11 min-w-11`
  (44 px); `focus-visible` en todo elemento interactivo; transiciones `duration-200`.

## Trazabilidad de requisitos

| Requisitos | Dónde se resuelven |
|------------|--------------------|
| FR-001–003 | `inicio/` + `GET /api/mascotas/resumen` + `contarPorEstado` |
| FR-004–009 | `mascotas/lista/` + `GET /api/mascotas?especie=&estado=` (orden por `createdAt` desc) |
| FR-010–020 | `mascotas/formulario/` + `validadores.ts` + `validarMascota` en POST/PUT |
| FR-021–025 | `mascotas/detalle/` + `GET/PUT/DELETE /api/mascotas/:id` |
| FR-026–028 | `notificacion/`, middleware de errores, textos en español |
| FR-029–030 | MongoDB Atlas; PUT de reemplazo completo, sin control de versiones |
| FR-031–034 | Clases Tailwind mobile-first, áreas táctiles, señales `cargando`/`guardando` |

## Pruebas planificadas

| Unidad | Runner | Casos clave |
|--------|--------|-------------|
| `validarMascota` | `node --test` | datos válidos; nombre vacío / solo espacios / 1 y 41 caracteres / 2 y 40 aceptados; especie inválida; edad -1, 31, 2.5, `"3"`, ausente; 0 y 30 aceptados; descripción 200 aceptada y 201 rechazada; estado por defecto `disponible`; varios errores a la vez; campos extra ignorados; entrada `null`. |
| `contarPorEstado` | `node --test` | arreglo vacío → 0/0; mezcla 4/2; estados desconocidos ignorados. |
| `validadores.ts` | `ng test` | nombre recortado en límites; mensajes iguales a la spec. |
| `MascotasService` | `ng test` | URL y método correctos de cada llamada; parámetros de filtro solo cuando tienen valor. |

## CI (para implementar después)

`.github/workflows/ci.yml`, disparado en `pull_request` y `push` a `main`, Node 24 con caché
de npm:

- **backend** (`working-directory: backend`): `npm ci` → `npm test`.
- **frontend** (`working-directory: frontend`): `npm ci` → `npm test -- --watch=false` →
  `npm run build`.

## Verificación de la constitución tras el diseño

Revisados `data-model.md`, `contracts/api-mascotas.md` y `quickstart.md`: se mantiene una sola
colección, no se añadieron dependencias fuera del stack (Tailwind/PostCSS son parte del stack
fijado), toda la lógica de negocio tiene prueba unitaria planificada y la API valida y oculta
errores internos. **Resultado: pasa.**

## Seguimiento de complejidad

Sin violaciones de la constitución; no aplica.
