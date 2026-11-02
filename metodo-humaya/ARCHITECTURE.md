# Arquitectura y convenciones — Humaya MVP

## Capas y dependencias

```
features/*  →  hooks/  →  services/  →  mocks/   (hoy)  |  API (mañana)
     ↓            ↓
components/ui   types/
```

- `features/<area>/<pantalla>/` puede importar de `components/`, `hooks/`, `types/`, `i18n/`.
- Una feature NO importa de otra feature. Lo compartido sube a `components/` o `hooks/`.
- Solo `services/` conoce de dónde vienen los datos. Cada función de servicio es `async` y tipada.
- `types/` es el contrato con el backend futuro: cambiarlo es una decisión, no un detalle.

## Estructura de una pantalla

```
features/staff/arrivals/
  ArrivalsPage.tsx        # compone la pantalla, maneja estados carga/vacío/error
  ArrivalsTable.tsx       # piezas propias de la pantalla
  ArrivalsPage.test.tsx
  index.ts
```

## Convenciones de código

- TypeScript estricto (`strict: true`). Prohibido `any`; usar `unknown` y estrechar.
- Componentes: funciones con nombre en PascalCase, props tipadas con `interface`, un componente por archivo.
- Hooks: `useX`, envuelven TanStack Query. Query keys centralizadas en `hooks/queryKeys.ts`.
- Nombres de código en inglés; textos visibles en español (luego i18n).
- Estilos: clases de Tailwind usando tokens (`bg-surface`, `text-muted`, `text-gold`). Nada de hex sueltos.
- Sin lógica de negocio en JSX: calcular antes del `return` o en un helper puro testeable.
- Estado: local con `useState`; compartido entre pantallas vía caché de TanStack Query.
  Context solo para tema, idioma y sesión (hoy `StayProvider`, que hace de "quién inició sesión"
  mientras no haya login).
- Fechas: guardar ISO 8601, formatear con `Intl.DateTimeFormat` según el idioma.

## Anchos

Un solo punto de quiebre en el proyecto: **1024 px** (`lg` de Tailwind).

- `/app` es mobile-first y se queda en una columna de 430 px como máximo.
- `/staff` cambia de forma en 1024 px: debajo, barra superior con menú deslizable y tarjetas;
  desde ahí, sidebar fijo y tablas.
- Las dos presentaciones se renderizan siempre y Tailwind decide cuál se ve. No se mide el ancho
  en JavaScript.

## Textos

Cada pantalla tiene su `copy.ts` con todos sus textos visibles. Desde la Fase 5 se mudan a
`src/i18n/*.json`. Ningún texto visible escrito suelto en el JSX.

## Estados obligatorios en cada pantalla

Carga (skeleton), vacío (mensaje útil), error (mensaje + reintentar), éxito.

## Accesibilidad

Elementos nativos, `aria-current` en navegación, `aria-expanded` en acordeones, `aria-live="polite"` en el chat,
foco visible, targets ≥ 44 px, contraste ≥ 4.5:1, estado nunca comunicado solo por color.

## Seguridad y privacidad

- Nada de secretos en el repo; variables en `.env.local` (y `.env.example` versionado).
- `VITE_USE_MOCKS` controla si los servicios usan mocks.
- Datos sensibles del huésped (alergias, preferencias) solo se muestran donde hacen falta; nunca en logs ni URLs.
- No usar `dangerouslySetInnerHTML`. Mensajes del chat se renderizan como texto.

## Tests

- Servicios y helpers: unitarios con Vitest.
- Componentes interactivos: Testing Library, consultando por rol y nombre accesible.
- Flujos clave: Playwright (entrevista, reserva de sauna, abrir perfil desde Llegadas).

## Commits

Formato: `feat(guest-app): pantalla de reservas` · `fix(staff): ...` · `chore: ...` · `test: ...`.
