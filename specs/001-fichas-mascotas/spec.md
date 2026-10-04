# Especificación de funcionalidad: Fichas de mascotas en adopción

**Rama de la funcionalidad**: `001-fichas-mascotas` (trabajada en `docs/spec`)

**Creada**: 2026-10-04

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Huellitas: gestión de fichas de mascotas en adopción para un refugio pequeño. El personal del refugio lleva el registro de las mascotas en papel o en chats, pierde información y no sabe rápidamente cuántas mascotas siguen disponibles. Inicio con contadores, listado en tarjetas con filtros, registro y edición mediante formulario, y detalle con acciones de editar, eliminar y marcar como adoptada."

## Escenarios de usuario y pruebas *(obligatorio)*

**Usuario**: personal o voluntario del refugio. Existe un único rol y no hay inicio de sesión; cualquier persona que use la aplicación puede realizar todas las acciones.

### Historia de usuario 1 - Registrar una mascota (Prioridad: P1)

Un voluntario recibe una mascota nueva en el refugio y quiere dejar su ficha registrada de inmediato, en lugar de anotarla en papel o en un chat. Abre el formulario de registro, completa nombre, especie, edad y, si quiere, una descripción, y guarda. La mascota queda registrada como "disponible".

**Por qué esta prioridad**: sin poder registrar mascotas no existe ningún dato que listar, contar ni consultar. Es la base que resuelve directamente la pérdida de información.

**Prueba independiente**: se puede probar completamente abriendo el formulario, registrando una mascota válida y comprobando que aparece la confirmación y que la ficha existe con estado "disponible".

**Escenarios de aceptación**:

1. **Dado** que el voluntario está en el formulario de registro, **cuando** ingresa nombre "Luna", especie "gato", edad 2 y guarda, **entonces** la mascota queda registrada con estado "disponible" y se muestra una confirmación breve (p. ej. "Mascota registrada correctamente").
2. **Dado** que el voluntario está en el formulario de registro, **cuando** deja el nombre vacío e intenta guardar, **entonces** no se registra nada y se muestra junto al campo el mensaje "El nombre es obligatorio".
3. **Dado** que el voluntario está en el formulario de registro, **cuando** ingresa una edad de -1 o de 31 e intenta guardar, **entonces** no se registra nada y se muestra el mensaje "La edad debe ser un número entero entre 0 y 30".
4. **Dado** que el voluntario está en el formulario de registro, **cuando** escribe una descripción de más de 200 caracteres, **entonces** se le indica "La descripción no puede superar los 200 caracteres" y no puede guardar hasta corregirla.
5. **Dado** que el voluntario está en el formulario de registro, **cuando** no ha elegido nada en el campo estado, **entonces** el estado aparece preseleccionado como "disponible".

---

### Historia de usuario 2 - Consultar el listado de mascotas con filtros (Prioridad: P1)

El personal necesita ver de un vistazo todas las mascotas del refugio en tarjetas que muestran nombre, especie, edad y estado, y poder filtrarlas por especie y por estado para responder preguntas como "¿qué perros siguen disponibles?".

**Por qué esta prioridad**: junto con el registro, es el núcleo del valor: reemplaza la búsqueda en papel o chats por una vista ordenada y filtrable.

**Prueba independiente**: con varias mascotas registradas, abrir el listado, comprobar que cada tarjeta muestra los cuatro datos y que los filtros reducen el listado correctamente. Con cero mascotas, comprobar el estado vacío.

**Escenarios de aceptación**:

1. **Dado** que existen 3 perros y 2 gatos registrados, **cuando** el voluntario abre el listado, **entonces** ve 5 tarjetas, cada una con nombre, especie, edad y estado.
2. **Dado** que existen perros y gatos, **cuando** filtra por especie "perro", **entonces** solo ve las tarjetas de perros.
3. **Dado** que existen mascotas disponibles y adoptadas, **cuando** filtra por estado "disponible", **entonces** solo ve las mascotas disponibles.
4. **Dado** que hay filtros de especie "gato" y estado "adoptado" aplicados, **cuando** el voluntario observa el listado, **entonces** solo ve gatos adoptados (los filtros se combinan).
5. **Dado** que no hay ninguna mascota registrada, **cuando** el voluntario abre el listado, **entonces** ve un mensaje amigable (p. ej. "Aún no hay mascotas registradas") con un acceso directo para registrar la primera mascota.
6. **Dado** que existen mascotas pero ninguna coincide con los filtros aplicados, **cuando** el voluntario observa el listado, **entonces** ve un mensaje indicando que no hay mascotas que coincidan y una forma de quitar los filtros.
7. **Dado** que el voluntario está en el listado, **cuando** selecciona una tarjeta, **entonces** se abre el detalle de esa mascota.

---

### Historia de usuario 3 - Ver detalle, marcar como adoptada y eliminar (Prioridad: P2)

Cuando una mascota es adoptada, el voluntario abre su detalle y la marca como adoptada. Si una ficha se registró por error, el voluntario la elimina, confirmando antes la acción para no perder información por accidente.

**Por qué esta prioridad**: mantiene los datos al día (estado real de cada mascota) y permite corregir errores; depende de que existan mascotas registradas.

**Prueba independiente**: con una mascota disponible registrada, abrir su detalle, marcarla como adoptada y comprobar el cambio de estado; luego eliminarla confirmando y comprobar que desaparece del listado.

**Escenarios de aceptación**:

1. **Dado** que existe la mascota "Luna", **cuando** el voluntario abre su detalle, **entonces** ve nombre, especie, edad, estado y descripción (si tiene), junto con las acciones editar, eliminar y marcar como adoptada.
2. **Dado** que "Luna" está disponible, **cuando** el voluntario pulsa "Marcar como adoptada", **entonces** su estado cambia a "adoptado", se muestra una confirmación breve y los contadores del inicio lo reflejan.
3. **Dado** que "Luna" ya está adoptada, **cuando** el voluntario ve su detalle, **entonces** la acción "Marcar como adoptada" no está disponible.
4. **Dado** que el voluntario está en el detalle de "Luna", **cuando** pulsa "Eliminar", **entonces** se le pide confirmar la eliminación antes de realizarla.
5. **Dado** que se muestra la confirmación de eliminación, **cuando** el voluntario confirma, **entonces** la mascota se elimina, se muestra una confirmación breve (p. ej. "Mascota eliminada") y vuelve al listado, donde ya no aparece.
6. **Dado** que se muestra la confirmación de eliminación, **cuando** el voluntario cancela, **entonces** la mascota no se elimina y permanece en el detalle.

---

### Historia de usuario 4 - Editar una mascota (Prioridad: P2)

El voluntario detecta un dato incorrecto o desactualizado (por ejemplo, la edad o la descripción) y lo corrige desde el detalle de la mascota usando el mismo formulario del registro, precargado con los datos actuales.

**Por qué esta prioridad**: mantiene la información fiable, pero el sistema ya aporta valor sin ella.

**Prueba independiente**: con una mascota registrada, abrir editar, cambiar un dato, guardar y comprobar el cambio en el detalle y el listado.

**Escenarios de aceptación**:

1. **Dado** que existe "Luna" con edad 2, **cuando** el voluntario abre editar, **entonces** el formulario muestra todos sus datos actuales precargados.
2. **Dado** que el voluntario está editando "Luna", **cuando** cambia la edad a 3 y guarda, **entonces** el cambio queda guardado, se muestra una confirmación breve (p. ej. "Cambios guardados") y el detalle muestra la edad 3.
3. **Dado** que el voluntario está editando, **cuando** borra el nombre e intenta guardar, **entonces** se aplican las mismas validaciones y mensajes que en el registro y no se guarda nada.
4. **Dado** que el voluntario está editando, **cuando** cancela, **entonces** no se guarda ningún cambio.

---

### Historia de usuario 5 - Inicio con contadores (Prioridad: P3)

Al abrir la aplicación, el personal ve una bienvenida breve y dos contadores: cuántas mascotas están disponibles y cuántas han sido adoptadas, para saber al instante la situación del refugio.

**Por qué esta prioridad**: resuelve el problema de "no saber rápidamente cuántas siguen disponibles", pero requiere que el registro y el cambio de estado ya funcionen.

**Prueba independiente**: con 4 mascotas disponibles y 2 adoptadas, abrir el inicio y comprobar que los contadores muestran 4 y 2.

**Escenarios de aceptación**:

1. **Dado** que hay 4 mascotas disponibles y 2 adoptadas, **cuando** el voluntario abre el inicio, **entonces** ve una bienvenida breve y los contadores "Disponibles: 4" y "Adoptadas: 2".
2. **Dado** que no hay mascotas registradas, **cuando** abre el inicio, **entonces** ambos contadores muestran 0.
3. **Dado** que el voluntario acaba de registrar, eliminar o marcar como adoptada una mascota, **cuando** vuelve al inicio, **entonces** los contadores reflejan el cambio.
4. **Dado** que el voluntario está en el inicio, **cuando** quiere ir al listado o registrar una mascota, **entonces** dispone de accesos directos a ambas acciones.

---

### Casos límite

- **Nombre solo con espacios**: se trata como vacío; se muestra "El nombre es obligatorio". Los espacios al inicio y al final se ignoran al contar caracteres.
- **Nombre de 1 carácter o de más de 40**: se muestra "El nombre debe tener entre 2 y 40 caracteres".
- **Edad con decimales, texto o vacía**: se rechaza con "La edad debe ser un número entero entre 0 y 30".
- **Edad en los límites (0 y 30)**: se acepta.
- **Descripción de exactamente 200 caracteres**: se acepta; vacía también se acepta.
- **Especie o estado fuera de las opciones**: no es posible elegirlos; solo se ofrecen las opciones válidas.
- **Nombres repetidos**: se permiten (dos mascotas pueden llamarse igual); se distinguen por sus demás datos.
- **Mascota que ya no existe** (por ejemplo, eliminada por otro voluntario mientras se veía su detalle): al intentar verla, editarla o eliminarla se muestra un mensaje claro ("Esta mascota ya no existe") y se ofrece volver al listado.
- **Fallo al guardar** (por ejemplo, sin conexión): se muestra un mensaje claro en español indicando que no se pudo completar la acción, sin perder los datos escritos en el formulario y sin mostrar detalles técnicos.
- **Doble envío**: pulsar "Guardar" varias veces seguidas no debe crear mascotas duplicadas.

## Requisitos *(obligatorio)*

### Requisitos funcionales

**Inicio**

- **FR-001**: El sistema DEBE mostrar en la pantalla de inicio un mensaje de bienvenida breve.
- **FR-002**: El sistema DEBE mostrar en el inicio el número total de mascotas con estado "disponible" y el número total con estado "adoptado", actualizados según los datos vigentes.
- **FR-003**: El inicio DEBE ofrecer accesos directos al listado y al registro de una mascota.

**Listado**

- **FR-004**: El sistema DEBE mostrar todas las mascotas registradas en tarjetas, cada una con nombre, especie, edad (en años) y estado.
- **FR-005**: El sistema DEBE permitir filtrar el listado por especie (todas, perro, gato, otro) y por estado (todos, disponible, adoptado); ambos filtros DEBEN poder combinarse.
- **FR-006**: Cuando no exista ninguna mascota registrada, el sistema DEBE mostrar un estado vacío amigable con un acceso directo para registrar una mascota.
- **FR-007**: Cuando existan mascotas pero ninguna coincida con los filtros, el sistema DEBE indicarlo y ofrecer una forma de quitar los filtros.
- **FR-008**: El listado DEBE mostrar primero las mascotas registradas más recientemente.
- **FR-009**: Seleccionar una tarjeta DEBE llevar al detalle de esa mascota.

**Registro y edición**

- **FR-010**: El sistema DEBE permitir registrar una mascota mediante un formulario con los campos nombre, especie, edad, estado y descripción.
- **FR-011**: Al registrar, el estado DEBE venir preseleccionado como "disponible".
- **FR-012**: El sistema DEBE permitir editar todos los datos de una mascota existente usando el mismo formulario, precargado con los datos actuales.
- **FR-013**: El sistema DEBE validar que el nombre sea obligatorio y tenga entre 2 y 40 caracteres, sin contar espacios al inicio o al final.
- **FR-014**: El sistema DEBE validar que la especie sea una de: perro, gato u otro.
- **FR-015**: El sistema DEBE validar que la edad sea un número entero entre 0 y 30 años, ambos incluidos; DEBE rechazar edades negativas, decimales o no numéricas.
- **FR-016**: El sistema DEBE validar que el estado sea "disponible" o "adoptado".
- **FR-017**: El sistema DEBE aceptar la descripción como opcional con un máximo de 200 caracteres.
- **FR-018**: Cuando un dato no sea válido, el sistema NO DEBE guardar la mascota y DEBE mostrar un mensaje claro en español junto al campo afectado, indicando cómo corregirlo.
- **FR-019**: Las mismas reglas de validación DEBEN aplicarse tanto al registrar como al editar, y el sistema DEBE verificarlas antes de guardar, aunque la información se haya enviado sin pasar por el formulario.
- **FR-020**: El formulario DEBE permitir cancelar sin guardar cambios.

**Detalle y acciones**

- **FR-021**: El sistema DEBE mostrar el detalle de una mascota con todos sus datos, incluida la descripción si existe.
- **FR-022**: El detalle DEBE ofrecer las acciones editar, eliminar y marcar como adoptada.
- **FR-023**: La acción "marcar como adoptada" DEBE cambiar el estado de la mascota a "adoptado" y solo DEBE estar disponible cuando la mascota esté "disponible".
- **FR-024**: Antes de eliminar una mascota, el sistema DEBE pedir confirmación explícita; si el usuario cancela, la mascota NO DEBE eliminarse.
- **FR-025**: La eliminación DEBE ser definitiva: la mascota deja de aparecer en el listado y en los contadores.

**Confirmaciones y mensajes**

- **FR-026**: Tras registrar, editar, eliminar o marcar como adoptada una mascota con éxito, el sistema DEBE mostrar una confirmación breve en español que desaparezca por sí sola.
- **FR-027**: Ante un error al guardar o consultar datos, el sistema DEBE mostrar un mensaje claro en español, sin detalles técnicos internos.
- **FR-028**: Todos los textos de la interfaz DEBEN estar en español.

**Persistencia**

- **FR-029**: Los datos de las mascotas DEBEN conservarse de forma permanente y ser los mismos para todo el personal que use la aplicación, independientemente del dispositivo.

### Entidades clave

- **Mascota**: animal del refugio que está o estuvo en adopción. Atributos:
  - **nombre**: texto obligatorio, de 2 a 40 caracteres.
  - **especie**: una de perro, gato u otro.
  - **edad**: número entero de años, de 0 a 30.
  - **estado**: disponible o adoptado; "disponible" al registrar.
  - **descripción**: texto opcional, máximo 200 caracteres.
  - **fecha de registro**: asignada automáticamente al registrar; se usa para ordenar el listado.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Un voluntario puede registrar una mascota nueva en menos de 1 minuto desde la pantalla de inicio.
- **SC-002**: Un voluntario puede saber cuántas mascotas están disponibles en menos de 5 segundos tras abrir la aplicación, sin navegar a otra pantalla.
- **SC-003**: Un voluntario puede encontrar las mascotas de una especie y estado concretos en menos de 10 segundos usando los filtros.
- **SC-004**: El 100 % de los intentos de guardar datos inválidos (nombre vacío, edad negativa o fuera de rango, descripción demasiado larga) se rechaza con un mensaje en español que indica cómo corregirlo.
- **SC-005**: El 100 % de las eliminaciones requiere una confirmación previa; ninguna mascota se elimina con un solo toque accidental.
- **SC-006**: Los contadores del inicio coinciden siempre con el número de mascotas disponibles y adoptadas que muestra el listado filtrado por cada estado.
- **SC-007**: Al menos 9 de cada 10 voluntarios que usan la aplicación por primera vez completan sin ayuda el registro de una mascota y su marcado como adoptada.
- **SC-008**: Ninguna ficha registrada se pierde: tras cerrar y volver a abrir la aplicación, o al abrirla desde otro dispositivo, aparecen las mismas mascotas.

## Supuestos

- Todo el personal y los voluntarios comparten un único rol con permisos completos; cualquiera puede registrar, editar, eliminar y marcar como adoptada.
- El volumen de datos es el de un refugio pequeño (del orden de decenas a pocos cientos de mascotas), por lo que no se requiere paginación ni búsqueda por texto.
- El estado también puede cambiarse desde el formulario de edición; esto permite revertir un "adoptado" marcado por error a "disponible". La acción rápida del detalle solo va de "disponible" a "adoptado".
- Se permiten nombres de mascota repetidos.
- La edad se registra en años completos; a una cría de menos de un año se le asigna 0.
- La eliminación es definitiva (no hay papelera ni opción de deshacer); la confirmación previa es la protección contra errores.
- Marcar como adoptada no requiere confirmación previa, por ser una acción reversible desde la edición; sí muestra confirmación posterior.
- Los filtros se reinician al salir del listado; no es necesario recordarlos entre visitas.
- Se usa la aplicación con conexión a internet; no se requiere funcionamiento sin conexión.

### Fuera de alcance

- Inicio de sesión, cuentas de usuario y roles o permisos diferenciados.
- Subida o visualización de fotos de las mascotas.
- Registro de datos de adoptantes o del proceso de adopción.
- Pagos o donaciones.
- Notificaciones de cualquier tipo.
