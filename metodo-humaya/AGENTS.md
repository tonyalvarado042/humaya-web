# Método Humaya — contrato de la aplicación

Este archivo es el punto de entrada para cualquier agente que trabaje en el repositorio (Codex,
Claude Code, u otro). Leelo entero antes de tocar código. Es la fuente de verdad: `CLAUDE.md` solo
apunta acá.

## En 60 segundos

Humaya es un hotel de 10 villas al pie del Volcán Arenal (La Fortuna, Costa Rica), apertura noviembre 2026. Landing: https://stayhumaya.com. Marca: "Become More Human". Cinco pilares: Move, Nourish,
Connect, Create, Believe.

El "Método Humaya" acompaña al huésped **antes** (entrevista + protocolo de 7 días), **durante** (app

- experiencias WOW) y **después** (seguimiento) de su estadía.

Estamos construyendo **solo el frontend, con datos de ejemplo**. Sin backend, sin login real, sin
WhatsApp, sin IA real. Todo eso se simula con una capa de servicios diseñada para reemplazarse después
sin tocar las pantallas.

Las 8 pantallas del MVP ya están construidas:

- `/app` — app del huésped (PWA, mobile-first): Inicio, Entrevista, Concierge, Mi villa, Reservas.
- `/staff` — dashboard de recepción (responsive completo): Llegadas, Perfil del huésped, Spa.
- `/dev/ui` — catálogo del sistema visual, útil para ver todos los componentes.

**Dónde estamos**: fases 0 a 5 cerradas. La aplicación ya está integrada en la rama
`metodo-humaya` del repositorio oficial, dentro de esta carpeta y sin reemplazar la landing. La
**Fase 6** sigue abierta por Playwright, URL/document root, despliegue, validación PWA y demo.
Diagnóstico en `docs/REPO-OFICIAL.md`, runbook en `docs/FASE-6.md`.

## Cómo se corre y cómo se verifica

```bash
npm install
npm run dev         # http://localhost:5173
```

Antes de dar cualquier tarea por terminada, los cuatro tienen que pasar:

```bash
npx prettier --write "src/**/*.{ts,tsx,css}"   # correr ANTES de lint: si no, lint falla por formato
npm run lint
npm run typecheck
npm run test        # 188 tests
npm run build
```

`npm run e2e` **no existe todavía**: Playwright entra en la Fase 6.

## Stack

React 19 · TypeScript estricto · Vite 8 · React Router 7 · Tailwind v4 · TanStack Query 5 ·
Vitest + Testing Library · lucide-react · @fontsource.

Instalados en Fase 5: `react-i18next`, `i18next`, `vite-plugin-pwa` y el generador de assets PWA.
Pendiente de instalar: `@playwright/test` (Fase 6).

**shadcn/ui no está instalado y es a propósito.** `Table` y `Drawer` se construyeron a mano en
`src/components/ui/`. El porqué está en `docs/ESTADO.md`, Fase 4. No lo instales sin hablarlo.

## La regla que ordena todo

```
features/*  →  hooks/  →  services/  →  mocks/   (hoy)  |  API (mañana)
     ↓            ↓
components/ui   types/
```

- Una pantalla **nunca** importa de `src/mocks/`. Siempre pantalla → hook → servicio → mock.
- Solo `src/services/` sabe de dónde salen los datos. El día que exista la API, se cambia el servicio
  y nada más.
- Una feature no importa de otra feature. Lo compartido sube a `components/` o `hooks/`.
- `src/types/` es el contrato con el backend futuro: cambiarlo es una decisión, no un detalle.

Se verifica con: `grep -rn "from '@/mocks" src/features src/hooks src/components` → no debe devolver
nada fuera de tests.

Las convenciones completas (nombres, estados obligatorios por pantalla, accesibilidad, anchos, tests,
commits) están en `ARCHITECTURE.md`. Es corto, leelo.

## Trampas conocidas

Cosas que ya costaron tiempo descubrir. No las vuelvas a pagar.

| Trampa                                                                                                      | Qué hacer                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **jsdom no implementa `<dialog>.showModal()`** — el método no existe, ni como no-op.                        | No uses `<dialog>` nativo para modales. `Drawer` atrapa el foco a mano; copiá ese patrón.                                                                                                                          |
| **Tailwind v4 sin `tailwind.config.js`.** Los tokens viven en `src/styles/tokens.css` con `@theme inline`.  | Colores nuevos van ahí, nunca hex sueltos en JSX. Verificá con `grep -rniE "#[0-9a-f]{3,8}" src --include=*.tsx`.                                                                                                  |
| **Los servicios mock simulan 200–400 ms** y varias pantallas encadenan 4 consultas.                         | El timeout de Testing Library está subido a 3 s en `src/test/setup.ts`. En los tests, usá `findBy*` y esperá anclas inequívocas, no textos que ya existían antes de la acción.                                     |
| **El estado de los mocks es mutable y en memoria** (`src/mocks/state.ts`).                                  | Todo test que toque servicios necesita `resetMockState()` en un `beforeEach`. Recargar el navegador reinicia reservas, respuestas y notas: es esperado.                                                            |
| **Hay dos helpers de render**, no uno.                                                                      | `renderWithProviders(ui, { stayId })` para una pantalla suelta; `renderRoutes(routes, { route })` para el árbol real, cuando querés comprobar la URL. Los dos en `src/test/renderWithProviders.tsx`.               |
| **Prettier y ESLint discuten.**                                                                             | Corré `npx prettier --write` antes de `npm run lint`, o lint falla por formato.                                                                                                                                    |
| **Las dos presentaciones responsive conviven en el DOM.** Tailwind decide cuál se ve; jsdom no calcula CSS. | En los tests, un mismo texto puede aparecer 2 veces (tabla y tarjeta). Usá `getAllByText` o acotá con `within(...)`.                                                                                               |
| **Dos huéspedes de demo cuentan historias distintas.**                                                      | Valeria (`s-mendez-rojas`) llega hoy con la entrevista completa. Hannah (`s-weber`) llega en 5 días, va por 2 de 5 y **no aceptó la política de privacidad**: es la única forma de ver el flujo de consentimiento. |

## Reglas de trabajo

- **Seguí la fase actual de `docs/PLAN.md`.** No adelantes fases sin que te lo pidan.
- **No hagás commit ni push sin una instrucción explícita del usuario.** Terminá y verificá los
  cambios, pero dejalos en el working tree hasta que el usuario autorice cada operación de Git.
- **Proponé un plan antes de cambios grandes.** Cambios chicos: un commit por pantalla o componente.
- **Tono de la copy**: español costarricense con voseo, cálido y breve ("Contanos", "Preparate"), como
  la landing. Cada pantalla tiene su `copy.ts`; ningún texto visible suelto en el JSX.
- **Accesibilidad**: elementos nativos (`button`, `a`, `input` + `label`), foco visible, áreas táctiles
  ≥ 44 px, contraste AA, y el estado nunca comunicado solo por color. Nada de emojis como íconos.
- **Datos sensibles** (alergias, salud): la entrevista pide consentimiento y avisa que el concierge es
  una IA. Es requisito legal (Ley 8968), no una preferencia.
- **Datos de ejemplo**: solo personas inventadas. "Hoy" = sábado 14 de noviembre de 2026, definido en
  un único lugar: `src/mocks/today.ts`.
- **Si el prototipo no está claro o choca con el plan, preguntá en vez de inventar.** Ya aparecieron
  varias contradicciones reales; están resueltas y documentadas en `docs/ESTADO.md`.
- **Toda decisión tomada sin Anthony se anota en `docs/FEEDBACK.md`** para confirmársela después. Hoy
  hay 20.
- **Al cerrar una fase**: marcá sus criterios en `docs/PLAN.md` y anotá lo hecho en `docs/ESTADO.md`
  (qué se construyó, qué se decidió y por qué, qué se verificó y qué no).

## Ubicación dentro del repositorio oficial

Esta carpeta es un workspace independiente dentro de `humaya-web`. La landing productiva vive un
nivel arriba y no debe importarse, reemplazarse ni copiarse dentro del build. Nada de rutas absolutas
o específicas de una máquina, y cero dependencias nuevas que no sean imprescindibles.

El despliegue de esta aplicación continúa bloqueado hasta definir URL y document root en SiteGround.
Generar `dist/` localmente está permitido; copiarlo sobre `public_html`, no.

## Mapa de la documentación

| Archivo                    | Para qué                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                | Este. El contrato: cómo se trabaja acá.                                                          |
| `ARCHITECTURE.md`          | Convenciones de código: capas, nombres, estados, accesibilidad, anchos, tests.                   |
| `docs/PLAN.md`             | El plan por fases, con los criterios de cada una y el cronograma.                                |
| `docs/FASE-6.md`           | Runbook que se ejecutará al aprobar la integración en el repositorio oficial.                    |
| `docs/REPO-OFICIAL.md`     | Auditoría de la landing productiva y estrategia de convivencia con el MVP.                       |
| `docs/ESTADO.md`           | Qué se construyó en cada fase, qué se decidió y por qué. **Empezá por acá** para ponerte al día. |
| `docs/FEEDBACK.md`         | Decisiones a confirmar con Anthony y espacio para su feedback.                                   |
| `docs/prototype/*.dc.html` | El prototipo aprobado. Referencia visual obligatoria.                                            |
| `CLAUDE.md`                | Puntero a este archivo, para Claude Code.                                                        |
