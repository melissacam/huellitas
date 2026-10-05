# Investigación (Fase 0): Fichas de mascotas en adopción

**Feature**: `001-fichas-mascotas` | **Fecha**: 2026-10-04 | **Plan**: [plan.md](plan.md)

El stack viene fijado por la constitución (principio II) y por la entrada del plan, así que no
quedaron puntos marcados como "NEEDS CLARIFICATION". Este documento registra las decisiones de
detalle que la especificación deja abiertas, eligiendo siempre la opción más simple
(principio I).

## 1. Versiones del entorno

- **Decisión**: Node.js 24 LTS (instalado: 24.21.0, npm 11.19.0) y Angular CLI 22.1.8. El
  frontend se crea con la versión de Angular que trae ese CLI.
- **Justificación**: son las versiones ya instaladas en el equipo de desarrollo; usar la misma
  versión mayor de Node en CI evita diferencias entre local y pipeline.
- **Alternativas consideradas**: fijar Node 22 LTS (descartada: no aporta nada y obliga a
  instalar otra versión).

## 2. Runner de pruebas del frontend

- **Decisión**: usar el runner que Angular CLI 22 configura por defecto al crear el proyecto
  (Vitest a través del builder `@angular/build:unit-test`). En CI se ejecuta
  `npm test -- --watch=false`.
- **Justificación**: es lo que pide la entrada del plan y no requiere configuración adicional.
- **Alternativas consideradas**: Karma/Jasmine (descartada: ya no es el valor por defecto del
  CLI y exige un navegador en CI).

## 3. Tailwind CSS

- **Decisión**: Tailwind CSS v4 integrado con PostCSS (`tailwindcss` + `@tailwindcss/postcss`),
  tal como lo configura el CLI de Angular (`ng new --style=tailwind` o `ng add tailwindcss`). La
  paleta pastel (durazno, menta, lavanda, crema) y la fuente Nunito se declaran como variables
  del tema en `src/styles.css` con `@theme`.
- **Justificación**: es la integración oficial y no necesita archivo `tailwind.config.js`.
- **Alternativas consideradas**: CSS propio sin framework (descartada: el stack fija Tailwind);
  librería de componentes (Angular Material, etc.) (descartada: dependencia no pedida y aspecto
  de plantilla genérica, contrario al principio III).

## 4. Formato de módulos del backend

- **Decisión**: CommonJS (`require` / `module.exports`), sin `"type": "module"`.
- **Justificación**: es el valor por defecto de Node; Express, Mongoose y `node --test`
  funcionan sin configuración extra.
- **Alternativas consideradas**: ES Modules (válida, pero no aporta nada a este alcance).

## 5. Dónde vive la validación

- **Decisión**: la validación de negocio se implementa una sola vez en el backend como función
  pura `validarMascota(datos)` en `backend/src/utils/`. Devuelve `{ valido, errores, datos }`
  donde `errores` es un objeto `campo → mensaje en español` y `datos` son los valores
  normalizados (nombre y descripción recortados). Las rutas POST y PUT la llaman antes de tocar
  la base de datos. El esquema de Mongoose repite solo tipos, `enum` y `required` como red de
  seguridad, sin mensajes propios.
  En el frontend, Reactive Forms replica las mismas reglas con `Validators` de Angular más dos
  validadores propios en `validadores.ts`: `nombreValido` (nombre recortado con `trim`,
  obligatorio y entre 2 y 40 caracteres) y `descripcionValida` (descripción recortada con `trim`,
  máximo 200 caracteres, igual que el backend), y muestra los mismos textos.
- **Justificación**: cumple FR-019 y el principio VI (la API valida todo, aunque los datos no
  vengan del formulario) y permite probar la lógica sin base de datos. Duplicar reglas simples
  en el frontend es necesario para FR-018a (mensajes al salir del campo) y es más simple que
  compartir código entre dos paquetes independientes.
- **Alternativas consideradas**: solo validación de Mongoose (descartada: mensajes difíciles de
  controlar y no se prueba sin base de datos); paquete compartido entre front y back
  (descartada: añade una tercera carpeta y configuración de build).

## 6. Normalización de datos

- **Decisión**: `nombre` y `descripcion` se guardan recortados (`trim`). `descripcion` ausente
  o vacía se guarda como cadena vacía `""`. `edad` debe llegar como número JSON entero
  (`Number.isInteger`); cadenas como `"3"` se rechazan.
- **Justificación**: cumple los casos límite (nombre solo con espacios = vacío; 200 caracteres
  exactos aceptados) con la regla más simple de explicar y probar.
- **Alternativas consideradas**: convertir cadenas numéricas a número (descartada: oculta datos
  mal formados; el formulario ya envía números).

## 7. Edición, marcar como adoptada y concurrencia

- **Decisión**: `PUT /api/mascotas/:id` reemplaza la ficha completa y exige todos los campos
  (mismas reglas que el alta). "Marcar como adoptada" se resuelve en el frontend enviando un
  PUT con los datos actuales y `estado: "adoptado"`. No se añade endpoint PATCH ni campo de
  versión.
- **Justificación**: FR-030 acepta "gana el último que guarda"; un PUT completo lo implementa
  de forma natural. Reutilizar PUT evita un endpoint y una validación parcial extra.
- **Alternativas consideradas**: `PATCH /api/mascotas/:id/adoptar` (descartada: endpoint
  adicional no pedido); control optimista con `__v` (descartada: la spec lo excluye).

## 8. Identificadores inválidos

- **Decisión**: si `:id` no es un ObjectId válido (`mongoose.isValidObjectId`), se responde
  404 "Esta mascota ya no existe", igual que si no existe.
- **Justificación**: para el usuario ambos casos significan lo mismo; evita un error de
  conversión (CastError) que acabaría en 500.
- **Alternativas consideradas**: responder 400 (descartada: obliga al frontend a manejar un caso
  más sin beneficio para el usuario).

## 9. Filtros y orden del listado

- **Decisión**: `GET /api/mascotas` acepta `especie` y `estado` opcionales; se construye el
  filtro solo con los parámetros presentes y se ordena por `createdAt` descendente. Un valor
  fuera de las opciones válidas responde 400. Sin paginación.
- **Justificación**: FR-005, FR-008 y el supuesto de volumen pequeño (decenas a cientos).
- **Alternativas consideradas**: filtrar en el frontend (descartada: la entrada del plan pide
  filtros en la API); paginación (descartada: YAGNI).

## 10. Resumen de contadores

- **Decisión**: `GET /api/mascotas/resumen` consulta solo el campo `estado` de todas las
  mascotas y pasa el arreglo a la función pura `contarPorEstado(mascotas)`, que devuelve
  `{ disponibles, adoptados }`. La ruta se declara antes de `/:id`.
- **Justificación**: la lógica de conteo queda probada con `node --test` sin base de datos; el
  costo de traer un campo de pocos cientos de documentos es despreciable.
- **Alternativas consideradas**: `countDocuments` o `aggregate` en MongoDB (descartada: la
  lógica quedaría en la consulta y no se podría probar unitariamente sin base de datos).

## 11. Manejo de errores en la API

- **Decisión**: formato único de error `{ "mensaje": "...", "errores": { campo: mensaje } }`
  (`errores` solo en validaciones). Un middleware final de Express registra el error en consola
  y responde 500 con un mensaje genérico. El JSON mal formado (error de `express.json()`)
  responde 400 "El cuerpo de la solicitud no es un JSON válido.".
- **Justificación**: principio VI (sin stack traces ni mensajes de base de datos al cliente) y
  FR-027.
- **Alternativas consideradas**: librería de errores HTTP (descartada: dependencia no pedida).

## 12. Representación del identificador

- **Decisión**: se expone el `_id` de MongoDB tal cual y se desactiva `__v`
  (`versionKey: false`).
- **Justificación**: no requiere transformaciones; el frontend tipa `_id: string`.
- **Alternativas consideradas**: transformar a `id` con `toJSON` (descartada: código extra sin
  beneficio funcional).

## 13. CORS

- **Decisión**: `app.use(cors())` con la configuración por defecto.
- **Justificación**: no hay autenticación ni cookies; la API solo se usa en desarrollo local
  desde `http://localhost:4200`. Es la opción más simple.
- **Alternativas consideradas**: lista blanca de orígenes por variable de entorno (descartada
  por ahora; se puede añadir si se despliega).

## 14. Confirmaciones, carga y confirmación de borrado en el frontend

- **Decisión**:
  - Confirmación breve (FR-026): un `NotificacionService` con una señal (`signal`) que guarda el
    mensaje actual y lo borra a los ~3 s, y un componente que lo pinta en `app.html` con
    `role="status"`.
  - Confirmación de borrado (FR-024): `window.confirm('¿Eliminar a <nombre>? Esta acción no se
    puede deshacer.')`.
  - Indicador de carga (FR-034): una señal `cargando` / `guardando` en cada componente de página
    que muestra un indicador y deshabilita los botones Guardar/Eliminar.
  - Estado de cada página con señales de Angular; sin librerías de estado.
- **Justificación**: cubre los requisitos con el mínimo de piezas. `window.confirm` es nativo,
  accesible por teclado y lector de pantalla, y suficiente para el alcance académico.
- **Alternativas consideradas**: diálogo modal propio (descartada por ahora: más código y foco
  a gestionar); NgRx u otra librería de estado (descartada: YAGNI).

## 15. Configuración de la URL de la API

- **Decisión**: un único archivo `frontend/src/environments/environment.ts` con
  `apiUrl: 'http://localhost:3000/api'`, generado con `ng generate environments`.
- **Justificación**: lo pide la entrada del plan; no hay despliegue definido, por lo que no se
  necesita aún una variante de producción distinta.
- **Alternativas consideradas**: proxy del dev server (descartada: la entrada pide URL en
  environment).

## 16. CI

- **Decisión**: un workflow `.github/workflows/ci.yml` con dos jobs independientes sobre Node 24,
  cada uno con `working-directory` propio y caché de npm por `package-lock.json`:
  - `backend`: `npm ci` → `npm test`. Nace en el Issue #7, el primer grupo de código, con un
    `backend/package.json` mínimo y una prueba de humo (`backend/test/smoke.test.js`).
  - `frontend`: `npm ci` → `npm test -- --watch=false` → `npm run build`. Se añade en el
    Issue #3, junto con el proyecto Angular.
  Las pruebas del backend no necesitan `MONGODB_URI` porque no tocan la base de datos.
- **Justificación**: principio IV (pruebas en GitHub Actions en cada Pull Request). Crear la CI
  antes que la lógica de negocio hace que todo cambio de código pase por el pipeline, sin
  excepciones; la prueba de humo es lo mínimo para que `npm test` tenga algo que ejecutar. Jobs
  separados muestran claramente qué parte falla.
- **Alternativas consideradas**: un solo job secuencial (descartada: menos claro y más lento);
  crear la CI después de las pruebas del backend (descartada: ese PR entraría sin pipeline,
  contra el principio IV).
