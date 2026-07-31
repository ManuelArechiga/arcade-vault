# Spec 03 — About Page y envío de correo (Resend)

**Estado:** Approved
**Dependencias:** Spec 02 — Home y reorganización de rutas (implementado)
**Fecha:** 2026-07-31

**Objetivo:** Implementar la página About (`app/about/page.tsx`) como puerto fiel de `references/templates/home-about/about.jsx`, con un formulario de contacto funcional que envía correos reales mediante la API de Resend a través de un Route Handler (`app/api/contact/route.ts`).

## Alcance

### Incluye

- **Página About** (`app/about/page.tsx`): puerto fiel de `references/templates/home-about/about.jsx` (hero "Acerca de", mission statement, fila de 3 highlights, divider decorativo, sección de contacto con formulario).
- **Componente `HighlightIcon`** en `components/about/highlight-icon.tsx` (uno por archivo, siguiendo la convención de `components/home/feature-icon.tsx`).
- **Formulario de contacto** (dentro de `app/about/page.tsx`, `"use client"`):
  - Campos: nombre, correo, mensaje.
  - Validación en cliente: campos no vacíos (shake si falta alguno, como el template) **+ validación de formato de email** (regex simple) antes de enviar.
  - Al enviar: llamada `fetch` a `POST /api/contact`, con estado de carga mientras se espera la respuesta.
  - Éxito: mismo `terminal-success` visual del template (con el nombre del usuario).
  - Error: nuevo estado de error (estética pixel/neón coherente) con mensaje claro y botón para reintentar, sin perder lo escrito en el formulario.
- **Route Handler** (`app/api/contact/route.ts`): `POST` que recibe `{ name, email, msg }`, valida en servidor (campos no vacíos + formato de email), envía el correo vía SDK de `resend` usando `RESEND_API_KEY` y `CONTACT_TO_EMAIL` (variables de entorno), y responde `200`/`4xx`/`5xx` según corresponda.
- **Dependencia nueva**: paquete `resend` (SDK oficial) agregado a `package.json`.
- **Variables de entorno** en `.env.local` (ya creado): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`. Remitente fijo en código: `onboarding@resend.dev`.
- **`components/nav.tsx`**: se agrega el link "Acerca de" (desktop y menú móvil) apuntando a `/about`, con `isActive` resaltando en `/about`.
- **`app/globals.css`**: se portan las clases CSS necesarias del About (`about-hero`, `about-title`, `highlight-row`, `about-divider`, `contact-grid`, `contact-form`, `terminal-success`, etc.) desde `references/templates/home-about/styles.css`, integradas sin duplicar selectores/variables ya existentes, más los estilos nuevos del estado de error.

### No incluye (fuera de alcance)

- Persistencia del mensaje de contacto en una base de datos — el mensaje solo se envía por correo, no se guarda en ningún lado.
- Protección anti-spam/bot (honeypot, CAPTCHA, rate limiting) — decisión explícita del usuario.
- Dominio propio verificado en Resend — se usa `onboarding@resend.dev` como remitente de pruebas.
- Envío de un correo de confirmación automático al usuario que llena el formulario (solo se notifica al equipo vía `CONTACT_TO_EMAIL`).
- Autenticación OAuth real, cambios a `context/auth-context`, o cambios a otras páginas fuera de lo listado arriba.
- Tests automatizados.

## Modelo de datos

No hay persistencia (no hay base de datos ni storage), pero se define el contrato entre cliente y servidor:

**Request** (`POST /api/contact`, JSON body):
```ts
type ContactRequest = {
  name: string;
  email: string;
  msg: string;
};
```

**Response — éxito** (`200`):
```ts
type ContactResponseOk = { ok: true };
```

**Response — error de validación** (`400`, campo vacío o email con formato inválido):
```ts
type ContactResponseError = { ok: false; error: string };
```

**Response — error de envío** (`502`, Resend falla o `RESEND_API_KEY` inválida/ausente):
```ts
type ContactResponseError = { ok: false; error: string };
```

El mensaje enviado por Resend usa `name`/`email`/`msg` para armar el `subject` (ej. `Nuevo mensaje de contacto — {name}`) y el cuerpo del correo (texto plano, incluyendo el email del remitente para poder responder).

## Plan de implementación

1. **Agregar dependencia `resend`**: `npm install resend`.
2. **Crear el Route Handler `app/api/contact/route.ts`**: `POST` que parsea el body, valida `name`/`email`/`msg` no vacíos y formato de email (regex simple), y si falla algo responde `400` con `{ ok: false, error }`. Si pasa validación, instancia `Resend` con `process.env.RESEND_API_KEY` y llama `resend.emails.send({ from: "onboarding@resend.dev", to: process.env.CONTACT_TO_EMAIL, subject, text })`. Si Resend lanza error, responde `502` con `{ ok: false, error }`. Si todo va bien, responde `200` con `{ ok: true }`.
3. **Portar estilos del About**: copiar a `app/globals.css` las clases necesarias (`about-hero`, `about-title`, `highlight-row`, `about-divider`, `contact-grid`, `contact-form`, `terminal-success`, etc.) desde `references/templates/home-about/styles.css`, evitando duplicar selectores/variables ya presentes. Agregar también un bloque de estilos nuevo para el estado de error del formulario (coherente con `terminal-success`, ej. `terminal-error` con línea roja/ámbar).
4. **Crear `components/about/highlight-icon.tsx`**: puerto de `HighlightIcon` de `about.jsx` (casos `HEART`, `BROWSER`, `PLANT`).
5. **Crear `app/about/page.tsx`**: puerto de `About` de `about.jsx` como client component. Reemplaza el `useEffect` de `IntersectionObserver` tal cual (mismo patrón `.reveal`/`.in` ya usado en el sitio, si existe; si no, portarlo). El formulario mantiene el estado `form`/`shake`, agrega estados `status: "idle" | "loading" | "sent" | "error"` y `errorMsg`. Al enviar: valida en cliente (vacíos + formato email) → si falla, shake; si pasa, `status = "loading"` y `fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })` → éxito: `status = "sent"` (muestra `terminal-success` existente); error: `status = "error"` con mensaje y botón "REINTENTAR" que vuelve a `status = "idle"` sin perder los valores del formulario.
6. **Actualizar `components/nav.tsx`**: agregar `Link href="/about"` con texto "Acerca de" en `.links` (desktop) y en el panel móvil, con `isActive("about")` resaltando en `/about`.
7. **Verificación manual**: visitar `/about`, revisar hero/highlights/divider, enviar el formulario con datos válidos y confirmar que llega el correo a `CONTACT_TO_EMAIL` real, probar validación (campos vacíos, email inválido) y el estado de error (ej. renombrando temporalmente `RESEND_API_KEY` para forzar fallo), confirmar que el link "Acerca de" del Nav resalta solo en `/about`.

## Criterios de aceptación

- [ ] Visitar `/about` muestra el hero "Acerca de Arcade Vault", el mission statement, la fila de 3 highlights y el divider decorativo, con la estética pixel/neón del sitio.
- [ ] El link "Acerca de" aparece en el Nav (desktop y menú móvil) y navega a `/about`.
- [ ] Desde `/about`, el link "Acerca de" del Nav aparece activo (resaltado); desde otras rutas, no.
- [ ] Enviar el formulario con nombre, email y mensaje válidos muestra el estado `terminal-success` con el nombre del usuario, y el correo llega efectivamente a `CONTACT_TO_EMAIL`.
- [ ] Enviar el formulario con algún campo vacío dispara el shake, sin llamar a `/api/contact`.
- [ ] Enviar el formulario con un email de formato inválido (ej. `abc123`) dispara el shake (o mensaje equivalente), sin llamar a `/api/contact`.
- [ ] Si `POST /api/contact` fallara (ej. `RESEND_API_KEY` inválida), el formulario muestra un estado de error visual con mensaje claro y botón para reintentar, sin perder los datos escritos.
- [ ] Mientras la petición está en curso, el botón de envío refleja un estado de carga (deshabilitado o con indicador visual) para evitar doble envío.
- [ ] `POST /api/contact` con body inválido (campo vacío o email mal formado) responde `400` con `{ ok: false, error }`.
- [ ] `POST /api/contact` con body válido responde `200` con `{ ok: true }` y el correo llega con `name`/`email`/`msg` correctos en el contenido.
- [ ] `.env.local` contiene `RESEND_API_KEY` y `CONTACT_TO_EMAIL`, y no está trackeado por git (`git status` no lo muestra).

## Decisiones tomadas y descartadas

- **Route Handler (`app/api/contact/route.ts`) en vez de enviar desde el cliente** — se descarta llamar al SDK de Resend directamente desde el componente porque expondría `RESEND_API_KEY` en el bundle del cliente; el envío debe pasar por el servidor.
- **`onboarding@resend.dev` como remitente** — se descarta configurar un dominio propio verificado en este spec porque agregaría alcance (DNS, verificación) no pedido; se usa el dominio de pruebas de Resend, con la limitación conocida de que solo entrega al dueño de la cuenta.
- **`CONTACT_TO_EMAIL` como variable de entorno en vez de hardcodeado** — permite cambiar el destinatario sin tocar código, consistente con cómo se maneja `RESEND_API_KEY`.
- **Validación de formato de email agregada (regex simple)** — se descarta quedarse fiel al template (solo campos no vacíos) porque un email mal formado haría fallar el envío en Resend de todos modos; validar antes da mejor feedback al usuario.
- **Estado de error dedicado en el formulario** — se descarta el enfoque "solo log en servidor" porque el template original no contempla una llamada real asíncrona que pueda fallar; el usuario necesita saber si su mensaje no llegó.
- **Sin protección anti-spam (honeypot/CAPTCHA)** — decisión explícita del usuario, fuera de alcance de este spec.
- **Sin persistencia del mensaje** — el proyecto no tiene base de datos; consistente con el resto del sitio (datos mock estáticos), el mensaje de contacto solo se envía por correo y no se guarda.
- **Renombrado de `.env-local` a `.env.local`** — corrección de un typo de archivo (no una decisión de diseño): Next.js solo carga automáticamente `.env.local`; con el nombre original, `RESEND_API_KEY`/`CONTACT_TO_EMAIL` no se habrían leído en runtime. Se hizo con confirmación del usuario, fuera del flujo normal de implementación del spec.
- **Link "Acerca de" agregado al Nav** — revierte la decisión del spec 02 de mantenerlo fuera; ahora es parte explícita del alcance de este spec.

## Riesgos identificados

- **Límite del remitente de pruebas de Resend**: `onboarding@resend.dev` solo entrega correos a la dirección asociada a la cuenta de Resend (el dueño de la API key). Si `CONTACT_TO_EMAIL` no coincide con esa cuenta, el envío puede fallar o no llegar aunque la API responda `200`; hay que verificarlo en la prueba manual real.
- **Colisión de selectores CSS al portar `home-about/styles.css`**: igual que en el spec 02 con el Home, el bloque `ABOUT PAGE` de `styles.css` puede compartir nombres de clase con `globals.css` actual; hay que confirmar que no se dupliquen definiciones ni se pisen estilos existentes.
- **Exposición accidental de `RESEND_API_KEY`**: debe usarse solo dentro del Route Handler (server-side); cualquier importación del SDK `resend` en un componente `"use client"` filtraría la key al bundle del navegador.
- **Rate limits de Resend**: sin protección anti-spam (decisión explícita fuera de alcance), un uso abusivo del formulario podría agotar la cuota del plan gratuito de Resend; riesgo aceptado por ahora.
