# Spec 02 — Home y reorganización de rutas

**Estado:** Implementado
**Dependencias:** Spec 01 — MVP Visual (implementado)
**Fecha:** 2026-07-30

**Objetivo:** Reestructurar el ruteo de Arcade Vault para introducir una página de Inicio (Home) real en `/`, mover la Biblioteca y el Detalle de juego a `/juegos` y `/juegos/[id]`, y corregir el 404 personalizado que actualmente no existe.

## Alcance

### Incluye

- **Página Home** (`app/page.tsx`): nueva página de inicio — puerto fiel de `references/templates/home-about/home.jsx` (hero, sección "¿Por qué Arcade Vault?", preview de juegos, stats, actividad en vivo con datos mock hardcodeados del template, precios/FAQ, CTA final).
- **Componentes del Home** en `components/home/`: `FloatingSilhouettes`, `MiniCard`, `FeatureIcon` (uno por archivo, siguiendo la convención de `components/game-card.tsx`).
- **Página Biblioteca** movida a `app/juegos/page.tsx`: contenido actual de `app/page.tsx` (hero, buscador, chips, grid de `GameCard`) sin cambios de comportamiento, solo de ubicación.
- **Página Detalle** movida a `app/juegos/[id]/page.tsx`: contenido actual de `app/detalle/[id]/page.tsx` sin cambios de comportamiento, solo de ubicación.
- **Redirect** en `next.config.ts`: `/detalle/:id` → `/juegos/:id` (308).
- **Actualización de enlaces internos** que apuntaban a `/detalle/[id]` o que quedaron desalineados por el cambio de significado de `/` (que antes era la Biblioteca y ahora es el Home):
  - `app/jugador/[id]/page.tsx`: botón "SALIR" → `/juegos/[id]`; botón "VOLVER AL VAULT" (modal de fin de partida) → `/juegos`.
  - `app/juegos/[id]/page.tsx`: link "VOLVER AL VAULT" → `/juegos`.
  - `components/home/mini-card.tsx` (nuevo, apunta a `/juegos/[id]`).
  - `components/nav.tsx`: links "Biblioteca" (desktop y menú móvil) → `/juegos`; el logo se mantiene apuntando a `/` (Home).
  - `app/salon/page.tsx`: link "VOLVER A LA BIBLIOTECA" → `/juegos`.
  - `app/auth/page.tsx`: tras iniciar sesión o entrar como invitado → `/juegos`.
  - Cualquier otro `router.push`/`Link` remanente hacia `/detalle`.
- **`components/nav.tsx`**: el link "Biblioteca" apunta a `/juegos`; el logo sigue apuntando a `/` (ya cubre el acceso a Inicio, sin agregar un link nuevo). Lógica `isActive("biblioteca")` ajustada para resaltar solo en `/juegos`, `/juegos/[id]` y `/jugador/[id]` (ya no en `/`).
- **`app/not-found.tsx`**: página 404 personalizada con el mismo lenguaje visual pixel/neón del resto del sitio (fuente pixel, colores neón, mensaje de error, botón "VOLVER AL VAULT" hacia `/juegos`).
- **`app/globals.css`**: se portan las clases CSS necesarias del Home (`home-hero`, `home-title`, `feature-grid`, `mini-card`, `mini-rail`, `home-stats`, `activity-grid`, `pricing-grid`, `home-final`, etc.) desde `references/templates/home-about/styles.css`, integradas sin duplicar variables/selectores ya existentes en `globals.css`. Se agregan también los estilos del 404.

### No incluye (fuera de alcance)

- Página **About** (`references/templates/home-about/about.jsx`) — explícitamente diferida, no se crea ruta ni link a ella.
- Conectar la sección "Actividad en vivo" del Home a datos reales (`PLAYERS`/`seededScores` de `lib/data.ts`) — se deja el mock hardcodeado del template, igual que el resto del sitio.
- Cambios al modelo de datos (`lib/data.ts`), a `Nav` más allá del ajuste de `isActive`, o a las páginas `auth`, `salon`, `jugador` fuera de actualizar el link roto.
- SEO avanzado (sitemap, `robots.txt`, metadata por ruta) más allá de lo que ya provee `layout.tsx`.
- Tests automatizados.

## Modelo de datos

No aplica — este spec no introduce ni modifica estructuras de datos. Reutiliza `GAMES`, `CATS` y `seededScores` de `lib/data.ts` tal cual existen hoy.

## Plan de implementación

1. **Mover Detalle a `/juegos/[id]`**: crear `app/juegos/[id]/page.tsx` con el contenido actual de `app/detalle/[id]/page.tsx`, eliminar el archivo/carpeta original (`app/detalle/`).
2. **Mover Biblioteca a `/juegos`**: crear `app/juegos/page.tsx` con el contenido actual de `app/page.tsx` (el que se usará para el Home en el paso siguiente sobrescribe este archivo).
3. **Agregar redirect** en `next.config.ts`: `/detalle/:id*` → `/juegos/:id*` (308).
4. **Actualizar enlaces internos** rotos hacia `/detalle` o desalineados por el nuevo significado de `/`: `app/jugador/[id]/page.tsx` (botón "SALIR" → `/juegos/[id]`, botón "VOLVER AL VAULT" → `/juegos`), `app/juegos/[id]/page.tsx` ("VOLVER AL VAULT" → `/juegos`), `components/nav.tsx` (links "Biblioteca" → `/juegos`), `app/salon/page.tsx` ("VOLVER A LA BIBLIOTECA" → `/juegos`), `app/auth/page.tsx` (redirect post-login/invitado → `/juegos`).
5. **Ajustar `components/nav.tsx`**: cambiar `isActive("biblioteca")` para que solo resalte en `/juegos`, `/juegos/[id]` y `/jugador/[id]` (quitar el `pathname === "/"`).
6. **Portar estilos del Home**: copiar a `app/globals.css` las clases necesarias (`home-hero`, `home-title`, `feature-grid`, `mini-card`, `mini-rail`, `home-stats`, `activity-grid`, `pricing-grid`, `home-final`, etc.) desde `references/templates/home-about/styles.css`, evitando duplicar selectores/variables ya presentes.
7. **Crear componentes del Home** en `components/home/`: `floating-silhouettes.tsx`, `mini-card.tsx` (con link a `/juegos/[id]`), `feature-icon.tsx` — puerto de las funciones equivalentes en `home.jsx`.
8. **Crear el nuevo `app/page.tsx`** (Home): puerto de la función `Home` de `home.jsx`, usando los componentes del paso 7, `GAMES` de `lib/data.ts`, y `next/navigation`/`next/link` en vez de la prop `navigate` del template (botones y `MiniCard` navegan con `router.push`/`Link` a `/juegos`, `/auth`, `/juegos/[id]`, `/salon`).
9. **Crear `app/not-found.tsx`**: página 404 con estética pixel/neón (reutilizando clases y componentes existentes de `globals.css` como `.pixel`, `.neon-*`, `.btn`), mensaje de error claro, y botón "VOLVER AL VAULT" (`Link` a `/juegos`). Agregar cualquier estilo faltante específico del 404 a `globals.css`.
10. **Verificación manual**: recorrer `/`, `/juegos`, `/juegos/bloque-buster`, `/detalle/bloque-buster` (debe redirigir), `/jugador/bloque-buster`, `/salon`, `/auth`, y una ruta inexistente como `/no-existe` (debe mostrar el 404 estilizado).

## Criterios de aceptación

- [x] Visitar `/` muestra el nuevo Home (hero, features, preview de juegos, stats, actividad en vivo, precios, CTA final) con la estética pixel/neón del sitio.
- [x] El botón "EXPLORAR JUEGOS" del Home navega a `/juegos`.
- [x] El botón "CREAR CUENTA" del Home navega a `/auth`.
- [x] Las `MiniCard` del Home navegan a `/juegos/[id]` del juego correspondiente.
- [x] El botón "VER TODOS LOS JUEGOS" y el CTA final del Home navegan a `/juegos`.
- [x] El botón "VER SALÓN" de la sección de actividad navega a `/salon`.
- [x] Visitar `/juegos` muestra la Biblioteca (hero, buscador, chips, grid) con el mismo comportamiento que tenía en `/` antes de este cambio.
- [x] Visitar `/juegos/bloque-buster` (o cualquier id válido de `GAMES`) muestra el Detalle del juego con el mismo comportamiento que tenía en `/detalle/bloque-buster`.
- [x] Visitar `/detalle/bloque-buster` redirige (308) a `/juegos/bloque-buster`.
- [x] Visitar `/juegos/no-existe` dispara `notFound()` y muestra el 404 personalizado (no el genérico de Next.js).
- [x] Visitar cualquier ruta inexistente (ej. `/no-existe`) muestra el 404 personalizado con estética pixel/neón, mensaje claro y botón "VOLVER AL VAULT" que lleva a `/juegos`.
- [x] Desde `/juegos`, `/juegos/[id]` o `/jugador/[id]`, el link "Biblioteca" del Nav aparece activo (resaltado).
- [x] Desde `/`, ningún link del Nav aparece activo.
- [x] El botón "SALIR" en `/jugador/[id]` navega correctamente a `/juegos/[id]` (ya no a `/detalle/[id]`).
- [x] Los botones/links "VOLVER AL VAULT" en `/jugador/[id]` (modal de fin de partida) y en `/juegos/[id]` navegan a `/juegos`.
- [x] El link "VOLVER A LA BIBLIOTECA" en `/salon` navega a `/juegos`.
- [x] Iniciar sesión o entrar como invitado desde `/auth` navega a `/juegos`.
- [x] El logo del Nav sigue navegando a `/` (Home).
- [x] No quedan referencias a `/detalle` en el código fuente (`app/`, `components/`) salvo la entrada de redirect en `next.config.ts`.
- [x] La página `/about` (o cualquier ruta relacionada) no existe ni tiene entrada en el Nav.

## Decisiones tomadas y descartadas

- **Redirect vía `next.config.ts` en vez de `redirect()` en la página vieja** — se descarta dejar `app/detalle/[id]/page.tsx` como wrapper con `redirect()` porque el redirect a nivel de config es más explícito, no requiere mantener un archivo de página "fantasma", y responde en la capa de ruteo antes de renderizar nada.
- **Sin link "Inicio" nuevo en el Nav** — se descarta agregar una entrada explícita porque el logo ya navega a `/`; agregar un link redundante sería ruido visual no pedido.
- **Datos de "Actividad en vivo" se dejan como mock hardcodeado del template** — se descarta conectarlos a `PLAYERS`/`seededScores` porque el resto del sitio (spec 01) ya sigue el mismo patrón de datos mock estáticos por página; conectar esta sección específicamente sería inconsistente con el resto y agregaría alcance no pedido.
- **Componentes del Home extraídos a `components/home/`** — se descarta dejarlos inline en `app/page.tsx` porque el proyecto ya usa el patrón de un componente por archivo (`components/game-card.tsx`, `components/nav.tsx`).
- **About queda fuera de alcance** — decisión explícita del usuario, no se crea ruta, componente ni entrada de Nav para `/about` en este spec.
- **"VOLVER AL VAULT" navega a `/juegos`, no a `/`** — durante la implementación (Pasos 8-9) surgió la ambigüedad de si "el vault" era el sitio completo (Home) o la Biblioteca. La primera decisión fue dejarlo en `/` (recomendado inicialmente porque el Home es la nueva puerta de entrada), pero el usuario decidió después que los botones "VOLVER AL VAULT" (en `/jugador/[id]`, `/juegos/[id]` y `app/not-found.tsx`) lleven a `/juegos`, reinterpretando la frase como "volver a elegir otro juego". El logo del Nav es la única navegación que conserva el destino `/`.
- **Bugs adicionales de enlaces a `/` detectados durante la implementación** — al mover la Biblioteca de `/` a `/juegos`, varios enlaces que antes apuntaban correctamente a `/` (cuando esa ruta era la Biblioteca) quedaron apuntando al nuevo Home sin querer: los links "Biblioteca" del Nav, "VOLVER A LA BIBLIOTECA" en `/salon`, y el redirect post-login/invitado en `/auth`. Se corrigieron a `/juegos` porque su intención original (ir a la Biblioteca) seguía siendo válida; no estaban listados explícitamente en el plan original porque ese plan solo rastreó referencias a `/detalle`, no a `/`.

## Riesgos identificados

- **Colisión de selectores CSS al portar `home-about/styles.css`**: ese archivo comparte ~70 selectores con el `globals.css` actual (variables base, `.btn`, `.pixel`, etc.). Al portar solo las clases nuevas del Home (paso 6 del plan) hay que verificar que no se dupliquen definiciones ni se pisen estilos existentes usados por Biblioteca/Detalle/Salón/Auth.
- **`isActive` del Nav con lógica de prefijo**: al cambiar el resaltado de Biblioteca para excluir `/`, hay que confirmar que no rompe el resaltado en subrutas como `/juegos/[id]` que dependen del mismo prefijo `startsWith("/juegos")`.
