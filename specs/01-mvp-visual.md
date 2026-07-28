# Spec 01 — MVP Visual de Arcade Vault

**Estado:** Implementado
**Dependencias:** Ninguna (primer spec del proyecto)
**Fecha:** 2026-07-28

**Objetivo:** Implementar como páginas reales de Next.js App Router las 5 pantallas visuales de Arcade Vault (Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama), replicando fielmente el diseño, datos mock y comportamiento visual de los templates de referencia en `references/templates/`, sin implementar lógica de juego real.

## Alcance

### Incluye

- **Layout raíz** (`app/layout.tsx`): fuentes vía `next/font/google` (Press Start 2P, Courier Prime, JetBrains Mono), `AuthProvider` (Context + localStorage), `Nav` y footer persistentes envolviendo todas las rutas, fondo `av-bg`/`av-noise`.
- **Página Biblioteca** (`app/page.tsx`): hero, buscador, chips de categoría, grid de `GameCard` — puerto de `biblioteca.jsx`.
- **Página Detalle** (`app/detalle/[id]/page.tsx`): portada, tags, descripción, stats, leaderboard, botón "Jugar ahora" — puerto de `detalle.jsx`.
- **Página Reproductor** (`app/jugador/[id]/page.tsx`): HUD, "arena" CRT, simulación visual de puntuación con `setInterval`, pausa, fin de juego con modal y guardado de puntuación en localStorage — puerto de `reproductor.jsx`.
- **Página Auth** (`app/auth/page.tsx`): tabs de iniciar sesión / crear cuenta, modo invitado, botones sociales decorativos (sin OAuth real) — puerto de `auth.jsx`.
- **Página Salón de la Fama** (`app/salon/page.tsx`): tabs por juego, podio top 3, tabla de puntuaciones, fila "tu mejor marca" si hay usuario — puerto de `salon.jsx`.
- **Componente `Nav`** compartido (biblioteca activa, salón, botón login/logout, menú móvil) — puerto de `nav.jsx`.
- **Datos mock estáticos** (`lib/data.ts`): `GAMES`, `CATS`, `PLAYERS`, `seededScores` — puerto de `data.jsx`.
- **Estilos** (`app/globals.css`): puerto directo de `styles.css` (variables, clases `.card`, `.av-nav`, `.chip`, `.crt`, etc.), integrado con el bloque `@theme inline` existente de Tailwind v4.
- **Persistencia**: usuario logueado y puntuaciones guardadas en `localStorage`, sin backend.

### No incluye (fuera de alcance)

- Lógica real de ningún juego (Bloque Buster, Caída, Serpentina, etc.) — la "arena" del reproductor es decorativa/simulada.
- Autenticación real (OAuth Google/GitHub, backend, base de datos, validación de contraseña) — los botones sociales y el formulario son solo visuales.
- Persistencia en servidor o sincronización entre dispositivos.
- Sistema de créditos/monedas funcional (el contador "CRÉDITOS · 03" del Nav queda como valor fijo, igual que en el template).
- Responsive/accesibilidad más allá de lo ya presente en el template original.
- Tests automatizados.

Cualquiera de estos puntos, si se necesita más adelante, se define en un spec separado.

## Modelo de datos

Todo vive en `lib/data.ts` como datos estáticos hardcodeados (sin API ni base de datos), migrados tal cual desde `data.jsx`:

```ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export interface Game {
  id: string;          // slug, ej. "bloque-buster"
  title: string;
  short: string;        // descripción corta (tarjeta)
  long: string;         // descripción larga (detalle)
  cat: GameCategory;
  cover: string;        // clase CSS de portada, ej. "cover-bricks"
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;        // ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;         // dd/mm/aaaa
}

export const GAMES: Game[];                 // 8 juegos, igual que el template
export const CATS: string[];                 // ["TODOS","ARCADE","PUZZLE","SHOOTER","VERSUS"]
export const PLAYERS: string[];              // 18 nombres seed
export function seededScores(seed: number, count?: number): ScoreRow[]; // generador determinístico
```

Estado de sesión y puntuaciones guardadas (no son "datos" del catálogo, sino estado runtime persistido):

```ts
// localStorage key "av_user"
interface AuthUser {
  name: string; // ej. "PLAYER1", máx 10 chars, uppercase
}

// localStorage key "av_scores"
interface SavedScoreEntry {
  game: string;   // Game.id
  score: number;
  name: string;
  at: number;     // Date.now()
}
```

`AuthProvider` (Context de React, client component) expone `{ user, login(user), signOut() }` leyendo/escribiendo `av_user` en localStorage — puerto directo de la lógica en `app.jsx`.

## Plan de implementación

1. **Datos y utilidades** — Crear `lib/data.ts` con `GAMES`, `CATS`, `PLAYERS`, `seededScores`, tipado en TypeScript. El proyecto queda funcional (build pasa) aunque nada lo consuma todavía.

2. **Fuentes y estilos base** — Configurar `next/font/google` para Press Start 2P, Courier Prime y JetBrains Mono en `app/layout.tsx`. Portar `styles.css` a `app/globals.css`, integrando las variables de color/tema con el bloque `@theme inline` existente. Verificar que `av-bg` y `av-noise` se rendericen en el layout raíz.

3. **AuthProvider** — Crear `context/auth-context.tsx` (client component) con `AuthUser`, lectura/escritura de `av_user` en localStorage, y funciones `login`/`signOut`. Envolver el layout raíz con el provider.

4. **Componente Nav** — Crear `components/nav.tsx`, puerto de `nav.jsx`, usando `usePathname` de Next.js para resaltar la ruta activa en vez de comparar `route.name`. Incluye menú móvil. Se monta en `app/layout.tsx` junto al footer.

5. **Página Biblioteca (`app/page.tsx`)** — Puerto de `biblioteca.jsx` y `GameCard`: hero, buscador, chips de categoría, grid filtrable. Navega a `/detalle/[id]` al seleccionar un juego. Sistema queda navegable desde Nav → Biblioteca.

6. **Página Detalle (`app/detalle/[id]/page.tsx`)** — Puerto de `detalle.jsx`. Usa `GAMES.find` por `id` (params), `notFound()` si no existe. Leaderboard con `seededScores`. Navega a `/jugador/[id]` o de vuelta a `/`.

7. **Página Reproductor (`app/jugador/[id]/page.tsx`)** — Puerto de `reproductor.jsx` como client component: HUD, simulación de score con `setInterval`, pausa, fin de juego, modal con guardado de puntuación en `localStorage` (`av_scores`), usando el nombre del `AuthUser` si existe.

8. **Página Auth (`app/auth/page.tsx`)** — Puerto de `auth.jsx`: tabs iniciar sesión/crear cuenta, modo invitado, botones sociales decorativos (sin funcionalidad real). Al enviar, llama a `login()` del `AuthProvider` y redirige a `/`.

9. **Página Salón de la Fama (`app/salon/page.tsx`)** — Puerto de `salon.jsx`: tabs por juego (estado local, no en URL), podio top 3, tabla completa, fila "tu mejor marca" si hay `user` del `AuthProvider`.

10. **Verificación visual final** — Recorrer las 5 pantallas en el navegador (`npm run dev`), comparando contra los templates: filtrado de biblioteca, detalle→jugador→fin de partida→guardado, login/logout persistente tras recargar, salón con y sin sesión iniciada.

## Criterios de aceptación

- [ ] `npm run build` completa sin errores.
- [ ] `npm run lint` pasa sin errores.
- [ ] La ruta `/` muestra la Biblioteca: hero, buscador funcional (filtra por título), chips de categoría funcionales (filtran por `cat`), grid con los 8 juegos de `GAMES`.
- [ ] Buscar un término sin resultados muestra el estado "NO HAY RESULTADOS".
- [ ] Click en una tarjeta o su botón "JUGAR" navega a `/detalle/[id]` con el `id` correcto.
- [ ] `/detalle/[id]` muestra portada, tags, descripción larga, stats (partidas, mejor global, dificultad) y leaderboard de 10 filas generado por `seededScores`.
- [ ] `/detalle/[id]` con un `id` inexistente responde 404 (`notFound()`).
- [ ] Botón "JUGAR AHORA" en Detalle navega a `/jugador/[id]`.
- [ ] `/jugador/[id]` muestra el HUD (jugador, puntuación, vidas, nivel) y la puntuación sube automáticamente cada ~220ms mientras no está en pausa ni terminado.
- [ ] Botón "PAUSA" detiene el incremento de puntuación y muestra el overlay "EN PAUSA"; "REANUDAR" lo retoma.
- [ ] Botón "FIN" abre el modal de fin de juego con la puntuación final y un campo para iniciales.
- [ ] Guardar la puntuación en el modal la persiste en `localStorage` (`av_scores`) y muestra el toast "PUNTUACIÓN GUARDADA".
- [ ] "JUGAR DE NUEVO" reinicia score/vidas/nivel; "VOLVER AL VAULT" navega a `/`.
- [ ] `/auth` permite alternar entre tabs "INICIAR SESIÓN" y "CREAR CUENTA" (el segundo agrega el campo de correo).
- [ ] Enviar el formulario de Auth guarda el usuario en `localStorage` (`av_user`), actualiza el `AuthProvider` y redirige a `/`.
- [ ] "JUGAR COMO INVITADO" navega a `/` sin usuario logueado.
- [ ] Tras loguearse, el Nav muestra el nombre del usuario en vez de "Iniciar Sesión"; recargar la página mantiene la sesión (persistida en localStorage).
- [ ] Botón de cerrar sesión en el Nav limpia `av_user` y vuelve a mostrar "Iniciar Sesión".
- [ ] `/salon` muestra tabs por cada juego de `GAMES`, podio top 3 y tabla de 12 filas para el juego seleccionado.
- [ ] Con sesión iniciada, `/salon` muestra la fila adicional "TU MEJOR MARCA"; sin sesión, no aparece.
- [ ] El Nav resalta como activa la sección correspondiente a la ruta actual (Biblioteca activa también en `/detalle/*` y `/jugador/*`).
- [ ] En viewport móvil, el botón hamburguesa abre el panel lateral de navegación y se puede cerrar tocando el backdrop.
- [ ] Las 3 fuentes (Press Start 2P, Courier Prime, JetBrains Mono) se cargan vía `next/font/google` y se ven aplicadas igual que en el template de referencia.

## Decisiones tomadas y descartadas

- **Rutas reales en español vs. inglés vs. hash-routing** → Se eligieron rutas reales de App Router en español (`/detalle/[id]`, `/jugador/[id]`, `/auth`, `/salon`), coincidiendo con los nombres del template. Se descartó mantener el ruteo por hash porque no aprovecha las capacidades nativas de Next.js (SSR, params, notFound, etc.) y se descartó traducir los slugs al inglés para mantener consistencia 1:1 con los nombres ya usados en el equipo/templates.

- **Simulación visual en el Reproductor** → Se decidió replicar el `setInterval` que sube la puntuación falsa, en vez de dejar el HUD estático, porque es decoración visual (no lógica de juego real) y permite validar el flujo completo HUD → pausa → fin → guardado, que es parte del criterio de aceptación del MVP visual.

- **Persistencia con localStorage** → Se mantiene igual que el template (sin backend), porque el alcance de este spec es puramente visual/frontend. Se descartó "sin persistencia" porque perder la sesión al recargar contradice la experiencia esperada (usuario logueado persistente) que sí forma parte de lo visual.

- **Estilos: portar CSS custom vs. reescribir en Tailwind** → Se decidió portar `styles.css` casi tal cual (integrado al bloque `@theme inline`) en vez de reescribir todo con utilidades Tailwind, porque el diseño pixel/retro ya está validado por el usuario en los templates y reescribirlo agrega riesgo de perder detalles visuales sin aportar valor al MVP.

- **Portadas de juego 100% CSS, sin imágenes** → Se confirma que las clases `cover-bricks`, `cover-tetro`, etc. siguen siendo fondos generados por CSS, sin agregar assets de imagen reales, consistente con el template original y sin necesidad adicional planteada por el usuario.

- **Datos mock sin cambios** → `GAMES`, `CATS`, `PLAYERS` y `seededScores` se migran tal cual desde `data.jsx`, sin ajustes de contenido, ya que el usuario confirmó que no quiere modificarlos en este spec.

- **Estado de usuario: Context + localStorage vs. lectura directa por página** → Se eligió un `AuthProvider` compartido (Context) en vez de que cada página lea `localStorage` directamente, para evitar duplicar esa lógica en Nav, Auth, Jugador y Salón, y para que futuras páginas puedan consumir el mismo estado sin repetir código.

- **Sin sección de riesgos** → No se identificaron riesgos relevantes más allá de los ya cubiertos por "fuera de alcance" (no hay backend, no hay lógica de juego real, no hay datos sensibles), por lo que se omite esa sección del template.
