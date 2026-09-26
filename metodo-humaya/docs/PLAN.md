# Plan de construcción — Humaya MVP en Claude Code

Versión: 24 sep 2026 · Sebas
(Copia del documento "Plan de construcción — Humaya MVP en Claude Code". Si cambia el documento, actualizar este archivo.)

Los prompts de cada fase sirven para cualquier agente; no dependen de Claude Code. El contrato de
trabajo del repositorio está en `AGENTS.md`.

## Resumen y alcance

Vamos a construir el frontend del MVP de Humaya: una app web para huéspedes y un dashboard para recepción, con datos de ejemplo y sin backend. Tomamos como referencia el prototipo en `docs/prototype/`. El hotel abre en noviembre de 2026, así que la meta es tener una versión navegable desplegada en unas 3 semanas.

**Entra en el MVP (8 pantallas):**

| Área        | Pantalla           | Qué hace                                                                                                           | Prototipo                |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| App huésped | Inicio             | Saludo, fechas de la estadía, avance de la entrevista, tips previos a la llegada                                   | `Main.dc.html`           |
| App huésped | Entrevista         | Preguntas por pilar (Move, Nourish, Connect, Create, Believe), modo light o profundo, aviso de IA y consentimiento | `App-Entrevista.dc.html` |
| App huésped | Concierge          | Chat con respuestas simuladas y sugerencias rápidas                                                                | `App-Concierge.dc.html`  |
| App huésped | Mi villa           | Wi‑Fi e instructivos desplegables (aire, agua caliente, luces, cocina)                                             | `App-Villa.dc.html`      |
| App huésped | Reservas           | Sauna y cold plunge: día, horario y confirmación                                                                   | `App-Reservas.dc.html`   |
| Recepción   | Llegadas           | Filtros hoy, mañana y semana; alertas; estado de las 10 villas; pendientes del día                                 | `Staff-Llegadas.dc.html` |
| Recepción   | Perfil del huésped | Perfil por pilar, trato preferido, línea de tiempo y experiencias WOW con estados                                  | `Staff-Huesped.dc.html`  |
| Recepción   | Spa y bienestar    | Agenda del día por instalación                                                                                     | `Staff-Spa.dc.html`      |

**No entra todavía:** backend, base de datos, login real, WhatsApp, IA real, integración con el CRM o con el sistema de reservas. Todo eso se simula con una capa de servicios mock, diseñada para reemplazarse después sin tocar las pantallas.

## Stack y decisiones

Un solo proyecto con React, TypeScript y Vite, con dos áreas separadas por ruta: `/app` para el huésped y `/staff` para recepción.

| Pieza             | Elección                                           | Por qué                                                                    |
| ----------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| Base              | React 19 + TypeScript + Vite                       | Rápido de levantar; los tipos evitan errores al conectar la API real       |
| Rutas             | React Router                                       | `/app/*` y `/staff/*` con layouts propios (barra inferior o sidebar)       |
| Estilos           | Tailwind CSS con tokens de marca                   | Replica rápido el estilo de la landing; los colores viven en un solo lugar |
| Componentes staff | shadcn/ui (solo lo necesario)                      | Tablas, diálogos y tabs accesibles                                         |
| Datos             | TanStack Query sobre servicios mock                | Carga, caché y errores resueltos; al llegar la API solo cambia el servicio |
| Estado local      | `useState` y Context; Zustand solo si hace falta   | Evitar complejidad prematura                                               |
| Idiomas           | react-i18next (ES y EN primero, DE y FR después)   | La landing atiende 4 idiomas                                               |
| PWA               | vite-plugin-pwa                                    | La app del huésped se instala en el celular sin tiendas                    |
| Tests             | Vitest + Testing Library; Playwright para 3 flujos | Cubre entrevista y reservas                                                |
| Calidad           | ESLint + Prettier + `tsc --noEmit` en CI           | Evita que el código se degrade entre sesiones                              |
| Entrega           | Repositorio de Anthony                             | El hosting y el dominio se configuran en el repositorio definitivo         |

Decisión clave: las pantallas nunca importan datos directo. Siempre piden a un hook (`useGuest`, `useArrivals`), que llama a un servicio. Hoy el servicio devuelve mocks; mañana llamará a la API.

## Estructura del repositorio

```
humaya-mvp/
├── CLAUDE.md
├── ARCHITECTURE.md
├── docs/
│   ├── PLAN.md
│   ├── ESTADO.md            # qué se hizo en cada fase y estado actual
│   └── prototype/            # los 8 .dc.html de referencia
├── public/                   # íconos PWA, logo, fotos
└── src/
    ├── main.tsx
    ├── router.tsx            # /app/* y /staff/*
    ├── styles/               # tokens.css, fuentes
    ├── i18n/                 # es.json, en.json
    ├── types/                # modelo de dominio
    ├── mocks/                # datos de ejemplo (10 villas, huéspedes)
    ├── services/             # guests.ts, stays.ts, interview.ts, wow.ts, spa.ts, concierge.ts
    ├── hooks/                # useGuest, useArrivals, useSpaSlots…
    ├── components/ui/        # Button, Chip, Card, Badge, Tag, Tabs…
    ├── features/
    │   ├── guest-app/  (layout, home, interview, concierge, villa, bookings)
    │   ├── staff/      (layout, arrivals, guest-profile, spa)
    │   └── dev/        (catálogo del sistema visual en /dev/ui)
    └── test/
```

Regla de dependencias: `features` usa `components`, `hooks` y `types`. `hooks` usa `services`, y solo `services` toca `mocks`. Nada importa de otra feature.

## Modelo de datos y servicios mock

```typescript
export type Pillar = 'move' | 'nourish' | 'connect' | 'create' | 'believe';
export type Locale = 'es' | 'en' | 'de' | 'fr';

export interface Guest {
  id: string;
  fullName: string;
  companions: { name: string; relation?: string; age?: number }[];
  locale: Locale;
  source: 'waitlist' | 'direct' | 'ota';
  consent: { privacyAcceptedAt?: string; whatsappOptIn: boolean };
}

export interface Stay {
  id: string;
  guestId: string;
  villa: number; // 1 a 10
  checkIn: string; // ISO
  checkOut: string;
  partySize: number;
  status: 'upcoming' | 'in_house' | 'checked_out';
  prepDay?: number; // día del protocolo de 7 días
}

export interface InterviewQuestion {
  id: string;
  pillar: Pillar;
  depth: 'light' | 'deep';
  prompt: Record<Locale, string>;
  options?: { id: string; label: Record<Locale, string> }[];
  sensitive?: boolean; // alergias, salud: se muestra con aviso
}

export interface InterviewAnswer {
  questionId: string;
  value: string;
  answeredAt: string;
}
export interface GuestAlert {
  kind: 'allergy' | 'celebration' | 'info';
  label: string;
}

export interface WowExperience {
  id: string;
  stayId: string;
  pillar: Pillar;
  title: string;
  reason: string; // "Por qué", basado en la entrevista
  status: 'suggested' | 'planned' | 'done';
  dueBy?: string;
}

export interface SpaSlot {
  facility: 'sauna' | 'cold_plunge';
  start: string;
  durationMin: 45 | 20;
  stayId?: string; // vacío = libre
}

export interface ChatMessage {
  id: string;
  from: 'guest' | 'concierge';
  text: string;
  at: string;
}
```

Servicios (`src/services/`, todos `async`, con retraso simulado de 200–400 ms y estado en memoria):

| Servicio       | Funciones                                                                           |
| -------------- | ----------------------------------------------------------------------------------- |
| `stays.ts`     | `getArrivals(range)`, `getStay(id)`, `getVillaStatus(date)`                         |
| `guests.ts`    | `getGuestProfile(stayId)`, `getAlerts(stayId)`                                      |
| `interview.ts` | `getQuestions(depth)`, `saveAnswer(stayId, answer)`, `getProgress(stayId)`          |
| `wow.ts`       | `getWowSuggestions(stayId)`, `updateWowStatus(id, status)`                          |
| `spa.ts`       | `getSlots(facility, date)`, `bookSlot(...)`, `getDaySchedule(date)`                 |
| `concierge.ts` | `sendMessage(text)`: respuestas por palabras clave (luego IA real)                  |
| `villa.ts`     | `getVillaInfo(stayId)`: wifi e instructivos (agregado en la Fase 2)                 |
| `protocol.ts`  | `getProtocolTips(stayId)`: consejos del protocolo de 7 días (agregado en la Fase 3) |

Los mocks usan los huéspedes del prototipo (Valeria y Andrés en Villa 04, familia Keller, Camille Durand, Tom y Rachel Whitfield…) para que la demo sea coherente. Una reserva hecha en la app debe aparecer en la agenda de Spa del dashboard.

## Sistema visual

| Token         | App (oscuro)      | Staff (claro)                | Uso                         |
| ------------- | ----------------- | ---------------------------- | --------------------------- |
| `bg`          | #0A0A0A           | #F4F0E8                      | Fondo                       |
| `surface`     | #151412           | #FFFFFF                      | Tarjetas                    |
| `line`        | #26231F           | #E2DBCD                      | Bordes                      |
| `text`        | #F2EDE4           | #1A1814                      | Texto principal             |
| `muted`       | #A39B8E           | #6B6358                      | Texto secundario            |
| `gold`        | #C8A565           | #8A6A2F (texto)              | Acento, botones principales |
| `alert`       | —                 | fondo #FBE2D8, texto #9A3412 | Alergias                    |
| `celebration` | #2A2418 / #E3C58A | fondo #EFE3C8, texto #6E5321 | Aniversarios, cumpleaños    |

Tipografía actual del MVP: Cormorant Garamond (títulos) y Jost (texto), vía `@fontsource`. La landing
oficial usa Jost (display) e Inter (texto); Anthony debe decidir cuál dirección aplica a la app. La
marca y el wordmark oficiales se recibieron en PNG.

Componentes base (`src/components/ui/`): Button, Chip, Card, Badge, Tag, SegmentedControl, ProgressSegments, ChatBubble, Accordion, SlotGrid, StatTile, EmptyState, Skeleton.

Reglas: áreas táctiles ≥ 44 px, contraste AA, nada de emojis como íconos (lucide-react, trazo 1.6).

## Fases de trabajo

No se pasa a la siguiente fase sin cumplir los criterios de la anterior.

### Fase 0 — Setup

Prompt: "En modo plan: creá un proyecto Vite + React + TypeScript en esta carpeta con Tailwind, React Router, TanStack Query, ESLint, Prettier y Vitest. Configurá los scripts dev, build, lint, typecheck y test. Creá la estructura de carpetas de docs/PLAN.md, vacía. No escribas pantallas todavía."

- [x] dev, lint, typecheck y test pasan
- [x] `/app` y `/staff` muestran un placeholder
- [ ] GitHub Actions corre lint, typecheck y test en cada push — el workflow ya está escrito en
      `.github/workflows/ci.yml`, falta el repo donde corra
- [ ] Primer commit y repo en GitHub — pendiente por decisión: todavía no se versiona

Estado detallado en `docs/ESTADO.md`.

### Fase 1 — Base visual

Prompt: "Leé docs/prototype/ y la sección Sistema visual de PLAN.md. Creá los tokens en CSS y Tailwind para los temas guest (oscuro) y staff (claro), cargá las fuentes con @fontsource y construí los componentes de src/components/ui/. Hacé una página /dev/ui que los muestre todos en sus variantes."

- [x] Todos los componentes en `/dev/ui` en ambos temas
- [x] Foco visible y 44 px mínimo en botones y chips
- [x] Ningún color escrito a mano fuera de los tokens

Se sumaron `Input`, `Textarea` e `IconButton` a los 13 componentes de la lista. Tres tokens se
apartan del prototipo para llegar a contraste AA; el detalle está en `docs/ESTADO.md`.

### Fase 2 — Modelo de datos y servicios mock

Prompt: "Creá los tipos de src/types/ según PLAN.md. Armá los mocks con los huéspedes del prototipo, las 10 villas y el 14 de noviembre de 2026 como 'hoy'. Implementá los servicios con retraso simulado, estado en memoria y los hooks de TanStack Query. Escribí tests de los servicios."

- [x] Datos coherentes entre servicios (misma villa, mismas alertas)
- [x] Reservar un horario lo marca ocupado en `getDaySchedule`
- [x] Tests de servicios pasan
- [x] "Hoy" se configura en un solo lugar (`src/mocks/today.ts`)

Se sumó el servicio `villa.ts` (`getVillaInfo`), que la pantalla Mi villa necesita y esta tabla no
tenía. Tres contradicciones del prototipo quedaron resueltas; el detalle está en `docs/ESTADO.md`.

### Fase 3 — App del huésped

Orden, una pantalla por sesión: layout + barra inferior, Entrevista, Inicio, Reservas, Mi villa, Concierge.
Prompt ejemplo: "Construí la pantalla Entrevista en src/features/guest-app/interview/ replicando docs/prototype/App-Entrevista.dc.html. Las preguntas salen de interview.getQuestions(depth). Incluí el aviso de IA y el consentimiento antes de la primera pregunta sensible. Agregá un test del flujo completo."

- [x] Las 5 pantallas navegan con la barra inferior y la URL cambia
- [x] La entrevista guarda progreso y se refleja en Inicio
- [x] Una reserva confirmada aparece en el Spa del dashboard (verificado contra `getDaySchedule`,
      mientras la pantalla de Spa no exista)
- [~] Se ve bien de 360 a 430 px — el ancho está resuelto, falta la revisión a ojo en un navegador
- [x] Estados de carga, vacío y error en cada pantalla

Se agregaron el servicio `protocol.ts` (consejos del protocolo de 7 días) y el consentimiento de
privacidad. El detalle está en `docs/ESTADO.md`.

### Fase 4 — Dashboard de recepción

Orden: layout + sidebar, Llegadas, Perfil del huésped, Spa.
Prompt ejemplo: "Construí la pantalla Llegadas en src/features/staff/arrivals/ siguiendo docs/prototype/Staff-Llegadas.dc.html. Usá useArrivals(range) con filtros hoy, mañana y semana. Cada fila enlaza a /staff/guests/:stayId. Las alertas de alergia deben distinguirse por algo más que el color."

- [x] Desde Llegadas se abre el perfil correcto
- [x] Las experiencias WOW cambian de estado y persisten al navegar
- [x] Las respuestas de la entrevista se ven en el perfil
- [x] Funciona en tablet horizontal (1024 px) y escritorio
- [x] **Criterio ampliado el 25 sep**: responsive completo, también en celular y tablet vertical.
      Un solo punto de quiebre en 1024 px: debajo, menú deslizable y tarjetas; desde ahí, sidebar y tabla.
      Falta la revisión a ojo de los tres anchos en un navegador.

No se instaló shadcn/ui: `Table` y `Drawer` se construyeron a mano, con el mismo patrón accesible que
el resto del kit. El porqué está en `docs/ESTADO.md`.

### Fase 5 — Idiomas y PWA

Prompt: "Migrá todos los textos a react-i18next con es.json y en.json. Agregá el selector de idioma en la app. Configurá vite-plugin-pwa con íconos y manifest de Humaya para que la app del huésped se pueda instalar."

- [x] Sin textos escritos a mano en componentes de la app del huésped
- [x] Cambiar a inglés traduce toda la app del huésped
- [x] Manifest, service worker e íconos instalables pasan el build; la validación física sobre HTTPS
      se ejecutará después del traslado, como parte de la Fase 6

### Fase 6 — Entrega y demo

Prompt: "Prepará el proyecto para trasladarlo al repositorio de Anthony. Agregá una página / con dos accesos: App del huésped y Recepción. Escribí 3 tests de Playwright: entrevista completa, reserva de sauna y abrir un perfil desde Llegadas."

Runbook de ejecución: [`docs/FASE-6.md`](FASE-6.md). El repositorio oficial ya fue auditado; el
diagnóstico está en [`docs/REPO-OFICIAL.md`](REPO-OFICIAL.md). El código ya vive aislado en la rama
`metodo-humaya`; no se despliega hasta que Anthony apruebe la topología.

- [~] Proyecto copiado sin reemplazar la landing; faltan revisión, merge y hosting del MVP en
  SiteGround
- [ ] Playwright pasa en CI
- [ ] PWA instalada, standalone y offline validada en Android y iPhone sobre la URL HTTPS real
- [ ] Guion de demo de 5 minutos para Anthony

## Calidad, privacidad y entrega

- Pruebas: Vitest (servicios, lógica de entrevista, disponibilidad), Testing Library (Chip, SegmentedControl, SlotGrid con teclado), Playwright (3 flujos).
- Accesibilidad: elementos nativos, `aria-current`, `aria-expanded`, `aria-live` en el chat, alertas con texto, revisión con axe al cerrar cada fase.
- Privacidad (Ley 8968): consentimiento antes de preguntas sensibles con enlace a la política (texto lo provee Anthony); preguntas `sensitive` explican su uso y se pueden saltar; mocks solo con personas inventadas.
- Entrega: este workspace no configura hosting todavía. El deploy del MVP se hará en SiteGround con
  la topología que apruebe Anthony; mantener `VITE_USE_MOCKS=true` en la demo.

## Cronograma estimado (4–6 h diarias)

| Fase             | Días | Fechas aprox.  | Entregable                                        |
| ---------------- | ---- | -------------- | ------------------------------------------------- |
| 0 Setup          | 1    | 25 sep         | Repo, CI y rutas vacías                           |
| 1 Base visual    | 2    | 28–29 sep      | Tokens y componentes en `/dev/ui`                 |
| 2 Datos mock     | 2    | 30 sep – 1 oct | Tipos, mocks, servicios y hooks con tests         |
| 3 App huésped    | 5    | 2–8 oct        | 5 pantallas navegables en el celular              |
| 4 Dashboard      | 4    | 9–14 oct       | 3 pantallas conectadas a los mismos datos         |
| 5 Idiomas y PWA  | 2    | 15–16 oct      | ES/EN e instalable                                |
| 6 Entrega y demo | 1–2  | 19–20 oct      | Traslado al repo real, Playwright y guion de demo |

Mostrarle avances a Anthony al terminar la Fase 3.

## Pendientes con Anthony

- [ ] ¿Alcance = solo pantallas con datos de ejemplo?
- [ ] Presupuesto, forma de pago y fecha de entrega
- [x] Marca y wordmark oficiales en PNG, foto de las villas
- [x] Fuentes de la landing identificadas: Jost para display e Inter para cuerpo
- [ ] ¿La app adopta Jost + Inter y el dorado oficial, o conserva la dirección visual del prototipo?
- [ ] Preguntas reales de la entrevista (light y profunda) por pilar
- [ ] Instructivos reales de la villa
- [ ] Horarios y capacidad de sauna y cold plunge
- [ ] Texto de la política de privacidad
- [x] Repo `tonyalvarado042/humaya-web`, dominio `stayhumaya.com`, hosting SiteGround
- [ ] ¿MVP en origen/document root separado —recomendado— o bajo el mismo origen de la landing?
- [x] Rama `metodo-humaya` creada y autorizada para integrar el código
- [ ] URL del MVP, revisión/merge y flujo de despliegue

Para la etapa de backend: ¿dónde reservan los huéspedes (PMS/motor con API)?, ¿qué CRM usan y tiene API?, ¿tienen WhatsApp Business (API oficial y plantillas de Meta)?
