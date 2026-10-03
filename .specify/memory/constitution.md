# Constitución de Huellitas

## Core Principles

### I. Propósito y simplicidad

Huellitas es una aplicación web para que un refugio pequeño gestione fichas de mascotas en
adopción. Es un proyecto académico: la prioridad es demostrar el flujo SDD + GitHub (ramas,
Pull Requests, CI), no la complejidad técnica.

- Ante dos soluciones válidas, se DEBE elegir la más simple.
- No se agregan funcionalidades, dependencias ni capas que la especificación no pida (YAGNI).

### II. Stack fijo

- Monorepo con dos carpetas: `frontend/` y `backend/`.
- `frontend/`: Angular con componentes standalone, TypeScript en modo estricto y Tailwind CSS.
- `backend/`: Node.js + Express + Mongoose.
- Base de datos: MongoDB con una única colección `mascotas`.
- La conexión DEBE configurarse con la variable de entorno `MONGODB_URI`; nunca en el código.

Cambiar el stack requiere enmendar esta constitución.

### III. Diseño con personalidad y accesible

- Paleta pastel suave: durazno, menta, lavanda y crema.
- Tipografía redondeada: Nunito o Fredoka.
- Tarjetas con bordes redondeados y sombras suaves.
- Microinteracciones discretas: hover con leve elevación o rebote; transiciones de 150–250 ms.
- La interfaz DEBE tener identidad propia y NO parecer una plantilla genérica.
- Accesibilidad mínima obligatoria: contraste legible, `label` asociado a cada campo de
  formulario y foco visible en todo elemento interactivo.

### IV. Calidad verificada en CI (NO NEGOCIABLE)

- Toda lógica de negocio DEBE tener prueba unitaria.
- Pruebas y build se ejecutan en GitHub Actions en cada Pull Request.
- Ningún cambio entra a `main` con el pipeline en rojo.

### V. Colaboración Trunk Based simplificada

- `main` está protegida; se trabaja en ramas cortas, una por Issue.
- Todo cambio entra por Pull Request revisado y aprobado por el otro integrante.
- Cada Pull Request DEBE vincular su Issue (`Closes #n`).
- Commits en formato Conventional Commits, redactados en español
  (p. ej. `feat(mascotas): agregar formulario de alta`).

### VI. Seguridad

- Nunca se suben credenciales ni archivos `.env` al repositorio (se versiona solo `.env.example`).
- La API DEBE validar todas las entradas antes de procesarlas o persistirlas.
- La API NO expone errores internos (stack traces, mensajes de base de datos) al cliente;
  responde con mensajes genéricos y códigos HTTP adecuados.

### VII. Especificación como fuente de verdad

Cualquier cambio de requisitos se refleja primero en la especificación (`specs/`) y después en
el código. Código que contradiga la especificación vigente se considera un defecto.

## Flujo de trabajo SDD

1. Especificar (`/speckit-specify`) y aclarar (`/speckit-clarify`) los requisitos.
2. Planificar (`/speckit-plan`) y desglosar en tareas (`/speckit-tasks`).
3. Convertir tareas en Issues; implementar cada una en su rama corta.
4. Abrir Pull Request vinculado al Issue, pasar CI y obtener revisión antes de fusionar.

## Puertas de calidad del Pull Request

Un Pull Request solo se fusiona si: el pipeline está en verde; tiene aprobación del otro
integrante; enlaza su Issue; la especificación está actualizada si cambió algún requisito; y no
incluye secretos ni archivos `.env`.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Toda revisión de Pull
Request DEBE verificar su cumplimiento, y cualquier complejidad adicional debe justificarse
explícitamente en el plan.

Las enmiendas se proponen mediante Pull Request que modifique este archivo, con aprobación de
ambos integrantes. Versionado semántico: MAJOR para eliminar o redefinir principios, MINOR para
añadir principios o secciones, PATCH para aclaraciones de redacción.

**Version**: 1.0.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-03
