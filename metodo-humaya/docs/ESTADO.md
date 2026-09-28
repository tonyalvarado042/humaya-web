# Estado del proyecto — Humaya MVP

Documento vivo. Se actualiza al cerrar cada fase de `docs/PLAN.md`.

Decisiones tomadas sin confirmar con Anthony y espacio para su feedback una vez que vea la demo:
`docs/FEEDBACK.md`.

Última actualización: **28 sep 2026** · Fase 6 completa en código; cierre operativo pendiente.

## Estado actual

Las 8 pantallas del MVP están construidas. La app del huésped ya funciona en español e inglés y el
build genera una PWA. La Fase 5 está cerrada. En la rama `metodo-humaya`, la aplicación ya vive en
esta carpeta dentro del repo oficial, mientras la landing productiva permanece intacta en la raíz.
La rama `metodo-humaya` prepara el MVP para `metodo.stayhumaya.com`, con origen y document root
separados de la landing. El PR #1 está abierto y su CI pasa. La Fase 6 sigue abierta por la creación
del subdominio y SSL, el despliegue, la validación física y el ensayo de la demo.

Qué se puede hacer hoy:

```bash
npm install
npm run dev        # http://localhost:5173
```

- `/app` — Inicio, Entrevista, Concierge, Mi villa, Reservas (con el selector de huésped de la demo)
- `/staff` — Llegadas · `/staff/guests/:stayId` — Perfil del huésped · `/staff/spa` — Spa y bienestar
- `/dev/ui` — catálogo del sistema visual, disponible únicamente en desarrollo

Los chequeos pasan en limpio: `npm run lint`, `npm run typecheck`, `npm run test` (191 tests),
`npm run build` y `npm run e2e` (3 recorridos).

## Fase 6 — Entrega del Método Humaya · código preparado el 28 sep 2026

La fase está **completa en código, pero no cerrada operativamente**. No se desplegó ni se modificó la
landing productiva.

### Aplicación y hosting

- `/` muestra una portada responsive con la marca oficial, “Become More Human”, aviso de datos
  ficticios y accesos a `/app` y `/staff`.
- La definición de rutas es una fábrica comprobable. `/dev/ui` existe en desarrollo y cae en la
  pantalla de ruta inexistente en producción.
- Vite conserva `base: /`; el manifest conserva `start_url` y `scope` en `/app`. El aislamiento del
  service worker se resuelve con `metodo.stayhumaya.com`, no con prefijos adicionales.
- El build incluye un `.htaccess` propio con fallback SPA, HTTPS, caché inmutable para assets con hash
  y revalidación para HTML, manifest y service worker.
- El workflow publica `metodo-humaya-dist` incluyendo archivos ocultos. Ese artefacto debe extraerse
  solo en el document root independiente del subdominio.

### Automatización

- `@playwright/test` corre en Chromium, con un worker y contextos limpios. Capturas, video y trazas se
  conservan únicamente al fallar.
- Los tres E2E completan la entrevista light de Hannah con consentimiento, reservan el primer horario
  disponible de Sauna para Valeria y abren su perfil desde Llegadas.
- El CI separa chequeos base de E2E. Primero ejecuta Prettier, lint, typecheck, 191 tests y build;
  después instala Chromium y ejecuta Playwright.
- El PR #1 pasó ambos trabajos remotos y publicó el artefacto `metodo-humaya-dist` con retención de
  14 días.
- Dos pruebas de servicio adicionales fijan el contrato del consentimiento de privacidad como `null`
  antes de aceptarlo y como fecha ISO después de aceptarlo.

### Entrega pendiente

- Crear DNS/subdominio, document root y SSL para `metodo.stayhumaya.com`.
- Aprobar y fusionar el PR; descargar y cargar el artefacto sin tocar `public_html` de la landing.
- Verificar rutas HTTPS, responsive final y PWA standalone/offline en Android y iPhone.
- Ensayar sobre HTTPS el recorrido de cinco minutos escrito en [`docs/DEMO.md`](DEMO.md).

Estos puntos son bloqueantes para marcar la Fase 6 como cerrada.

## Revisión del repositorio oficial · 26 sep 2026

- La rama base auditada fue `main`, conectada a `tonyalvarado042/humaya-web`.
- La raíz es una landing estática real, versión documentada 1.2.2, desplegada manualmente en
  SiteGround. Sus formularios de lista de espera y reserva llaman Edge Functions de Supabase.
- No hay Node, CI, tests ni PWA en el repo oficial. Sí hay cuatro idiomas, `.htaccess`, assets de
  marca y registro de despliegues.
- Marca, wordmark y `villa-02.jpg` coinciden exactamente con los tres archivos usados por el MVP.
- La landing usa Jost + Inter y el dorado `#C8AD85`; el MVP usa Cormorant + Jost y un dorado cercano.
- El service worker se aislará de la landing mediante `metodo.stayhumaya.com`; el manifest conserva
  alcance y arranque en `/app`.
- La topología aprobada mantiene el código del MVP en su carpeta y lo publica en un document root
  separado en SiteGround.

### Integración ejecutada

- Código, tests, assets, configuraciones y documentación copiados a `metodo-humaya/`.
- Landing, confirmación, `.htaccess` y assets productivos conservados sin cambios.
- Contrato raíz agregado para proteger ambos productos.
- CI agregado con Node 22 y comandos ejecutados dentro de `metodo-humaya/`.
- Primera corrida remota del CI completada en verde: Prettier, lint, typecheck, 188 tests y build.
- No se desplegó nada ni se registró un service worker en `stayhumaya.com`.

La consulta automatizada a `stayhumaya.com` recibió HTTP 403; no se toma como caída del sitio. Falta
confirmar en un navegador que producción corresponde al commit revisado.

## Fase 5 — Idiomas y PWA · implementación hecha el 25 sep 2026

La fase queda **cerrada a nivel de implementación**. La validación física pasa al runbook de la Fase
6 para probar exactamente el código, hosting y dominio que se entregarán.

### Idiomas

- `react-i18next` carga `src/i18n/es.json` y `en.json`. Los cinco `copy.ts` de la app del huésped se
  eliminaron; recepción y `/dev/ui` siguen en español.
- El idioma inicial sale de la preferencia del huésped. Hoy Valeria entra en español y Hannah en
  inglés; alemán y francés usan español hasta que existan esos recursos.
- La elección manual se guarda por estadía en `localStorage`, sin cambiar las rutas. El botón ES/EN
  del prototipo convive con el selector de huésped en Inicio y actualiza también `<html lang>`.
- Preguntas, protocolo, alertas, características e instructivos de villa y respuestas mock del
  concierge son bilingües. Los mensajes escritos por el huésped nunca se traducen.
- Los contratos `ProtocolTip`, `VillaGuide`, `VillaInfo`, `GuestAlert` y `ChatMessage` admiten ahora
  contenido localizado. Recepción resuelve esos campos explícitamente en español.

### PWA

- `vite-plugin-pwa` genera el manifest, el registro automático y un service worker con el shell,
  fuentes e íconos precacheados. La app instalada abre en `/app`, en modo standalone y orientación
  vertical.
- `public/mark-gold.png` es la marca oficial y alimenta `npm run pwa:assets`, que reproduce los PNG
  de 192, 512, maskable 512 y Apple Touch 180, además del favicon. El ícono maskable usa fondo opaco
  y conserva la marca dentro de la zona segura.
- El build genera `manifest.webmanifest`, `registerSW.js`, `sw.js` y Workbox. No hay configuración de
  Vercel. El destino es `metodo.stayhumaya.com`; crear y cargar su document root sigue pendiente.

### Marca y fotografía oficiales

- `wordmark-white.png` reemplaza el rótulo tipográfico provisional en Inicio y en el sidebar de
  recepción. La barra móvil de recepción usa `mark-gold.png` sobre su fondo claro.
- `villa-02.jpg` reemplaza el marcador gris de Mi villa. Como las diez villas son iguales, la misma
  imagen se presenta para todas las estadías demo, con texto alternativo en español o inglés.

### Verificación hecha

`lint`, `typecheck`, `test` (188 de 188) y `build` pasan. Cinco pruebas nuevas recorren el cambio de
idioma, las cinco pantallas, contenido dinámico, persistencia por huésped, fallback de DE/FR y el
retorno de recepción a español. Tres pruebas adicionales verifican el wordmark en ambas áreas y la
foto oficial de la villa. El build precachea HTML, JavaScript, CSS, fuentes e íconos.

La instalación desde Chrome/Android y Safari/iPhone, la reapertura standalone y sin conexión y la
revisión final sobre dispositivos quedan registradas en `docs/FASE-6.md`.

## Fase 4 — Dashboard de recepción · hecha el 25 sep 2026

El pedido amplió el criterio original de `docs/PLAN.md` ("funciona en tablet horizontal y
escritorio"): el dashboard tiene que funcionar **completo** en celular, tablet y escritorio. El
prototipo estaba dibujado fijo a 1440×900, así que los anchos angostos son diseño nuevo, no ajuste.

### Estrategia responsive

**Un solo punto de quiebre: 1024 px** (`lg` de Tailwind), que es el mismo del criterio ya aprobado.

|                         | Debajo de 1024 px                                                   | Desde 1024 px                      |
| ----------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| Navegación              | Barra superior con hamburguesa y menú deslizable                    | Sidebar fijo de 248 px             |
| Llegadas                | Tarjetas apiladas, una por huésped                                  | Tabla de 7 columnas                |
| Villas y "Preparar hoy" | Secciones debajo de la lista                                        | Columna al costado (desde 1280 px) |
| Perfil                  | Una columna; las WOW suben al primer lugar                          | Dos columnas, WOW a la derecha     |
| Spa                     | Tarjeta por horario con reserva; los libres, resumidos en una línea | Tabla de hora × instalación        |
| Indicadores             | 1 columna en celular, 2 en tablet                                   | 4 columnas                         |

Las dos presentaciones (tabla y tarjetas) están siempre en el DOM; Tailwind decide cuál se ve. Eso
tiene un costo en peso, pero evita depender de medir el ancho en JavaScript y hace que los tests
puedan comprobar que las dos muestran lo mismo.

### Dos piezas nuevas en el kit

- **`Table`** — envoltorios finos sobre `<table>` (`TableHead`, `TableRow`, `TableCell`,
  `TableHeaderCell`). Sin ordenamiento ni virtualización: la tabla del prototipo no los tiene.
- **`Drawer`** — diálogo modal deslizable, con foco atrapado, cierre con Escape y con clic afuera, y
  devolución del foco al botón que lo abrió.

Las dos están en `/dev/ui` con el resto del kit.

### Las tres pantallas

- **Llegadas** (`/staff`) — filtro Hoy / Mañana / Esta semana, cuatro indicadores, la lista de
  llegadas, el tablero de las 10 villas y las tareas del día.
- **Perfil del huésped** (`/staff/guests/:stayId`) — alertas, cómo atenderlo, los 5 pilares, la línea
  de tiempo del Método Humaya, las notas del equipo y el panel de experiencias WOW con su avance de
  estado.
- **Spa y bienestar** (`/staff/spa`) — tres indicadores y la agenda del día por instalación.

Los estados de carga, vacío y error usan las piezas de `features/staff/layout/ScreenState.tsx`,
hermanas de las de `guest-app` pero con el espaciado del escritorio.

### Decisiones y por qué

- **No se instaló shadcn/ui**, pese a que `CLAUDE.md` lo nombra para el staff. El proyecto usa
  Tailwind v4 sin `tailwind.config.js` y sería la primera integración de esa CLI: riesgo real de
  chocar con el setup, a cambio de dos componentes. Se construyeron a mano, con el mismo patrón
  accesible que el resto del kit. Pesa también que **esto se muda al repositorio de Anthony**: cuantas
  menos dependencias haya que trasplantar, mejor.
- **El `Drawer` no usa `<dialog>` nativo.** Era el plan, pero jsdom no implementa `showModal()` (ni
  como no-op: el método no existe), así que los tests se caían. Se atrapa el foco a mano, que es lo
  que hacen por debajo Radix y la mayoría de los "sheet" accesibles.
- **`getWowsDueBy` ahora devuelve la villa y el huésped resueltos** (tipo `WowTask`). La primera
  versión de la pantalla resolvía la villa con un mapa escrito a mano, que duplicaba datos del
  servicio y rompía la regla de que solo `services/` sabe de dónde salen.
- **"Villas" del sidebar queda deshabilitado.** El prototipo lo deja como enlace muerto y no es una de
  las 8 pantallas del MVP.
- **El perfil de un huésped sin entrevista repetía la misma frase dos veces** (en "cómo atenderlo" y
  en el lugar de los pilares). Lo destapó un test; ahora el segundo dice otra cosa.
- **Se subió el timeout de Testing Library a 3 segundos** (`src/test/setup.ts`). Los servicios mock
  simulan 200–400 ms y varias pantallas encadenan cuatro consultas: con el segundo por defecto había
  fallos intermitentes. Dos tests de la Entrevista fallaban una de cada tres corridas por esto.

### Verificación hecha

`lint`, `typecheck`, `test` (180 de 180, corridos dos veces seguidas para descartar intermitencias) y
`build` pasan. De los 180, 40 son del dashboard y 9 de las dos piezas nuevas del kit.

Los tests cubren: los tres destinos en el sidebar y en el menú deslizable, que Escape lo cierre y
devuelva el foco; el filtro de períodos; que cada llegada enlace a su propio perfil; que avanzar una
experiencia WOW persista al ir a Llegadas y volver; que las notas se guarden al salir del campo; y que
una reserva hecha desde la app del huésped aparezca en la agenda de recepción.

Dos `grep`: ninguna pantalla de staff importa de `@/mocks`, y no hay colores escritos a mano.

**No se hizo revisión visual en un navegador**: no hay herramienta de browser en esta sesión. Las
cuatro rutas responden y las pantallas se montan y operan en jsdom, pero jsdom no calcula CSS, así que
**los tres anchos hay que mirarlos a ojo** con `npm run dev` antes de mostrarle esto a Anthony.

## Fase 3 — App del huésped · hecha el 25 sep 2026

### Navegación

`src/features/guest-app/layout/GuestLayout.tsx` es el marco: tema `guest`, ancho máximo de 430 px y
barra inferior con los cinco `NavLink`, que ponen `aria-current="page"` solos. El padding inferior usa
`env(safe-area-inset-bottom)`.

Rutas en inglés, como la estructura de `docs/PLAN.md`: `/app`, `/app/interview`, `/app/concierge`,
`/app/villa`, `/app/bookings`.

**Qué estadía se mira**: un Context (`StayProvider` + `useCurrentStay`) montado en el layout. No hay
login, así que esto hace de sesión. `ARCHITECTURE.md` reserva Context para tema e idioma; esta es la
tercera excepción y queda anotada. La estadía no va en la URL a propósito: el estado de los mocks vive
en memoria, así que recargar reinicia todo igual.

### Las cinco pantallas

Cada una en su carpeta, con su `copy.ts` (los textos centralizados hasta que la Fase 5 los mude a
`src/i18n/`), sus piezas propias y su test.

- **Inicio** — saludo, días hasta la llegada, fechas con `Intl.DateTimeFormat`, etiquetas de villa,
  personas y celebración, avance de la entrevista con su botón, y los consejos del día del protocolo.
  En el encabezado, el selector entre Valeria y Hannah.
- **Entrevista** — Light o Profunda, avance por segmentos, historial en burbujas, opciones como chips
  y campo de texto para las preguntas abiertas. Aviso de IA siempre visible y consentimiento antes de
  la primera pregunta sensible.
- **Reservas** — sauna o cold plunge, los días de la estadía desde hoy, grilla de horarios, y la
  tarjeta de reserva confirmada.
- **Mi villa** — nombre y características, marcador de foto, Wi-Fi y los cuatro instructivos en
  acordeón.
- **Concierge** — hilo con `role="log"` y `aria-live="polite"`, sugerencias rápidas y campo de envío.

Los cuatro estados que pide `ARCHITECTURE.md` se resuelven con las piezas compartidas de
`layout/ScreenState.tsx`: `ScreenLoading` (skeletons más un aviso para lectores de pantalla),
`ScreenError` (mensaje y reintentar), `EmptyState` del kit, y la pantalla en sí.

### Lo que se agregó a las capas de abajo

Tres cosas que la Fase 2 no había dejado y las pantallas necesitaban:

1. **Protocolo de 7 días** — `src/mocks/protocol.ts` (7 días × 2 consejos, provisionales), el tipo
   `ProtocolTip`, el servicio `protocol.ts` y el hook `useProtocolTips`. Alimenta la sección
   "Preparate" de Inicio.
2. **`getProgress` con profundidad** — `progressOf(stayId, depth?)` y `useInterviewProgress(stayId,
depth?)`. Antes siempre calculaba sobre la entrevista light, y la pantalla deja elegir. El valor
   por defecto no cambió, así que la tabla de Llegadas sigue igual.
3. **Consentimiento** — `acceptPrivacy(stayId)` y `getPrivacyConsent(stayId)` en el servicio de
   huéspedes, con sus hooks. El consentimiento dado durante la sesión se guarda en el estado en
   memoria.

También se sumó `ButtonLink` al kit y se extrajo `buttonClasses` a `src/components/ui/buttonStyles.ts`:
navegar es trabajo de un `a`, no de un `button`, y así los estilos no se repiten. Y
`src/services/session.ts`, para que las pantallas pidan la estadía por defecto sin tocar `mocks/`.

### Decisiones y por qué

- **Dos cambios en los mocks de Hannah.** Se le quitó el `privacyAcceptedAt`, y sus dos respuestas
  pasaron de connect y nourish a connect y move. Las dos por la misma razón: se frenó justo en la
  pregunta de alergias, que es por lo que todavía no aceptó la política. Sin eso el consentimiento
  nunca se podía ver.
- **El "Volver a empezar" de la Entrevista no se replicó.** En el prototipo era inofensivo; acá
  borraría respuestas de verdad. En su lugar, el cierre lleva a Inicio.
- **Reservas ofrece 4 días para Valeria, no los 3 del prototipo.** Llega a las 3 p.m. y el spa cierra
  a las 21:00: el día de llegada es reservable. Los días se derivan de la estadía.
- **El hilo del Concierge es `role="log"`.** Un `aria-live` suelto no le da rol a la transcripción; con
  `log` los mensajes nuevos se anuncian sin robarle el foco a quien escribe.
- **El botón de idioma del prototipo no está.** Llega con la Fase 5. En su lugar quedó el selector de
  huésped de la demo.

### Verificación hecha

`lint`, `typecheck`, `test` (131 de 131) y `build` pasan. De los 131, 44 son de la app del huésped.

Sobre los criterios de la fase: hay tests que comprueban que los cinco enlaces navegan y marcan la
pantalla actual; que responder una pregunta sube el avance que muestra Inicio; y que una reserva
confirmada aparece en `getDaySchedule` con el nombre y la villa del huésped, que es el criterio de que
llega al dashboard, verificado a nivel de datos mientras la pantalla de Spa no exista.

Dos `grep`: ninguna pantalla importa de `@/mocks`, y no hay colores escritos a mano fuera de los
tokens.

No se hizo una revisión visual en un navegador: no hay herramienta de browser en esta sesión. Las
cinco rutas responden y las pantallas se montan y operan en jsdom, pero **el ajuste fino de 360 a
430 px conviene mirarlo a ojo** antes de mostrárselo a Anthony.

## Fase 2 — Modelo de datos y servicios mock · hecha el 25 sep 2026

### La regla que ordena todo

`pantalla → hook → servicio → mock`. Solo `src/services/` importa de `src/mocks/`; los hooks y las
pantallas no saben de dónde sale el dato. El día que exista la API se cambia el servicio y nada más.

### Tipos — `src/types/`

Un archivo por agregado (`common`, `guest`, `stay`, `interview`, `wow`, `spa`, `chat`, `villa`) más un
barril. El contrato de `docs/PLAN.md` se respeta, con dos salvedades:

- `InterviewQuestion.prompt` usa `LocalizedText` = `{ es: string } & Partial<Record<Locale, string>>`.
  El español es obligatorio y los demás idiomas entran cuando existan, sin tocar el tipo.
- Se sumaron los tipos que las pantallas necesitan y el documento no listaba: `GuestProfile`,
  `PillarSummary`, `TimelineEvent`, `Arrival`, `VillaStatus`, `VillaInfo`, `VillaGuide`,
  `InterviewProgress`, `SpaBooking`, `SpaSchedule` y `SpaScheduleRow`.

### Mocks — `src/mocks/`

`today.ts` es el único lugar donde vive "hoy" (`TODAY = '2026-11-14'`, sábado) con los helpers
`daysFromToday`, `daysUntil` e `isToday`. Todo lo demás lo deriva.

14 huéspedes, 14 estadías, las 10 villas, 23 preguntas de entrevista, 6 experiencias WOW, 16 reservas
de spa y los instructivos de la villa. `state.ts` guarda lo mutable (respuestas, estados WOW,
reservas, mensajes y notas del equipo) y expone `resetMockState()`, que usan los tests.

`demo.ts` define qué estadía mira la app del huésped: Valeria por defecto y Hannah como alternativa.
El selector lo pone la Fase 3.

### Servicios — `src/services/`

`stays` · `guests` · `interview` · `wow` · `spa` · `concierge` · `villa`, más `delay.ts` (retraso de
200–400 ms), `config.ts` (lee `VITE_USE_MOCKS`) y `clock.ts` (expone "hoy" sin que nadie fuera de la
capa toque `mocks/`).

`villa.ts` no estaba en la tabla de `docs/PLAN.md`: lo pide la pantalla Mi villa.

`bookSlot` escribe en el mismo arreglo que lee `getDaySchedule`. Ahí se cumple el criterio de que una
reserva hecha en `/app` aparezca en la agenda de recepción.

### Hooks — `src/hooks/`

`queryKeys.ts` centraliza las claves. Diez hooks de lectura y cuatro mutaciones. Cada mutación
invalida lo que tocó: reservar invalida los horarios, la agenda del día y las reservas de la estadía;
guardar una respuesta invalida el avance, las respuestas, el perfil y la lista de llegadas.

### Tres choques del prototipo, resueltos

1. **Faltaban 4 huéspedes.** `Staff-Llegadas` decía "8 de 10 ocupadas esta noche" y marcaba las villas
   03, 05, 08 y 10 como ocupadas, pero esas personas no estaban en ninguna lista. Se inventaron, más
   los Beltrán, que son los que salen hoy de la Villa 01. El estado de las villas ahora se **deriva**
   de las estadías, así que el tablero no puede desalinearse con las llegadas.
2. **Dos turnos de spa imposibles.** La agenda del 15 ponía a Luca Bianchi en el sauna de las 6:00
   (llega ese día a las 3:30 p.m.) y a Hannah Weber en el cold plunge (llega el 19). Pasaron a los
   huéspedes que ya estaban en casa. Los totales del prototipo se mantienen: 5 reservas de sauna y 4
   de cold plunge.
3. **Horarios ocupados en `/app`.** Los arreglos `TAKEN` de `App-Reservas` no coincidían con la agenda
   de recepción. Gana la agenda, que es la única fuente. La grilla del huésped va a mostrar otros
   horarios tomados que el prototipo, a propósito.

### Decisiones y por qué

- **Dos huéspedes en la app.** La app del huésped del prototipo está parada 5 días antes de la llegada
  con la entrevista a medias, y el dashboard el 14 de noviembre con Valeria llegando y la entrevista
  completa. Con un solo "hoy" no pueden ser ciertas las dos. Valeria queda como la de por defecto y
  Hannah Weber (llega el 19, entrevista 2 de 5) cuenta la historia previa.
- **18 preguntas profundas provisionales.** El prototipo solo trae las 5 light y las reales siguen
  pendientes con Anthony. Están escritas en voseo y marcadas como provisionales en el archivo.
- **El indicador de experiencias WOW es del día, no del hotel.** `getPendingWowCount(date)` cuenta las
  pendientes de las llegadas de esa fecha. Un test lo descubrió: con el conteo global daban 6 y el
  prototipo dice 5, porque la experiencia de Sofía Arias es para mañana.
- **`updateWowStatus` no deja retroceder** de `done` a `planned`: en el prototipo el botón desaparece,
  acá el servicio lo hace explícito.
- **La línea de tiempo del Método Humaya se deriva** de la estadía y de la entrevista, en vez de ser
  texto escrito a mano, para que no se desincronice al responder una pregunta.

### Verificación hecha

`lint`, `typecheck`, `test` (87 de 87) y `build` pasan. Los 87 tests son 11 archivos: 5 de componentes
y el router, y 6 de servicios.

Sobre los criterios de la fase: hay tests que comprueban que la villa, el idioma, el nombre y las
alertas de una estadía son idénticos en `getArrivals` y en `getGuestProfile`; que reservar marca el
horario ocupado y lo muestra con nombre y villa en `getDaySchedule`; y que los arribos de hoy salen de
`TODAY` y no de una fecha escrita a mano.

Dos `grep` de arquitectura: `2026-11-14` solo aparece en `src/mocks/`, y ningún archivo fuera de
`src/services/` importa de `@/mocks`.

## Fase 1 — Base visual · hecha el 25 sep 2026

### Tokens — `src/styles/tokens.css`

Dos temas con los **mismos nombres semánticos**: `guest` (oscuro, para `/app`) y `staff` (claro, para
`/staff`). Se activan con `data-theme` en el contenedor del área, no en `<html>`, para poder mostrar
los dos en paralelo en `/dev/ui`.

La técnica es `@theme inline` de Tailwind v4: las variables se declaran por tema en `@layer base` y
`@theme inline` las expone como utilidades. Así `bg-surface` emite `var(--surface)` y se resuelve
según el tema del contenedor: una misma clase sirve en los dos.

Hay 21 tokens de color por tema (`bg`, `surface`, `surface-sunken`, `surface-raised`, `line`,
`line-soft`, `line-strong`, `text`, `muted`, `muted-soft`, `disabled`, `gold`, `gold-bright`,
`gold-dim`, `gold-track`, `on-gold`, `gold-on-ink`, `nav`, `ink`, `on-ink`, `ink-muted`), 6 pares de
estado (`alert`, `celebration`, `info`, `success`, `warning`, `neutral`), las dos familias
tipográficas, cuatro radios y la utilidad `text-eyebrow` para el rótulo en versalitas.

El foco visible se define una sola vez, con `:focus-visible` en `@layer base`.

### Fuentes

`@fontsource-variable/jost` para el texto y `@fontsource/cormorant-garamond` (500, 600 y 500 italic)
para los títulos, importadas desde `tokens.css`. Sin CDN: se empaquetan con el build.

Sigue pendiente confirmar con Anthony si son las mismas de la landing. Si cambian, se cambia en un
solo lugar.

### Componentes — `src/components/ui/`

Los 13 de `docs/PLAN.md` más `Input`, `Textarea` y `IconButton`, que aparecen en los prototipos:

`Accordion` · `Badge` · `Button` · `Card` · `ChatBubble` · `Chip` · `EmptyState` · `IconButton` ·
`Input` · `ProgressSegments` · `SegmentedControl` · `Skeleton` · `SlotGrid` · `StatTile` · `Tag` ·
`Textarea`

Se exportan desde `src/components/ui/index.ts`. El helper `cn()` (une clases descartando las vacías)
vive en `src/components/ui/cn.ts` y no se exporta en el barril.

### Página `/dev/ui`

`src/features/dev/UiKitPage.tsx` (selector de tema) y `UiKitCatalog.tsx` (las secciones). Vive en
`features/dev/` y no dentro de `guest-app` ni `staff`, para no romper la regla de `ARCHITECTURE.md`
de que una feature no importa de otra.

### Tests

23 en total. Los 5 del router, más cuatro archivos de componentes interactivos que consultan por rol
y nombre accesible: `Chip`, `SegmentedControl` (incluye las flechas del teclado), `SlotGrid`
(el horario ocupado) y `Accordion` (Enter, Espacio y `aria-controls`).

### Decisiones y por qué

- **Tres tokens se apartan del prototipo por contraste.** Los valores originales no llegaban a AA
  sobre su propio fondo: el dorado de staff `#8A6A2F` daba 4.42:1 (ahora `#87672E`, 4.61:1),
  `muted-soft` de staff `#8A806F` daba 3.89:1 sobre blanco (ahora `#736A5C`, 5.32:1) y los dos
  `disabled` quedaban por debajo de 3:1 (ahora `#6A635A` en guest y `#8C8478` en staff). Son cambios
  mínimos de luminosidad: el tono se mantiene. Los 29 pares de color del sistema pasan AA.
- **El horario ocupado y la alergia no dependen del color.** En `SlotGrid` el horario tomado va
  `disabled` y su nombre accesible dice "ocupado"; en `Tag`, las variantes `alert` y `celebration`
  llevan ícono de lucide además del fondo. El prototipo los comunicaba solo con color y tachado.
- **`SegmentedControl` es un `radiogroup`, no tres botones sueltos.** Una sola parada de tabulador y
  las flechas mueven la selección, que es lo que espera un lector de pantalla.
- **`Accordion` usa un chevron de lucide** en vez del `+` / `−` del prototipo, por consistencia con
  el resto de los íconos.
- **Fuera de alcance, a propósito**: la barra de progreso continua de Inicio y el selector de día de
  Reservas los construye la Fase 3 dentro de su pantalla.

### Verificación hecha

`lint`, `typecheck`, `test` (23 de 23) y `build` pasan. El catálogo completo se monta en jsdom desde
el test del router. `grep` de hex sueltos en `src/**/*.tsx` no devuelve nada. El CSS compilado
contiene los dos bloques de tema. Las alturas táctiles salen de las clases: 44 px en `Button` md,
`Chip`, `IconButton`, `SegmentedControl` y `SlotGrid`; 48 px en `Input`; 52 px en `Button` lg y en el
disparador del `Accordion`.

No se hizo una revisión visual en un navegador: no hay herramienta de browser en esta sesión.

## Fase 0 — Setup · hecha el 24 sep 2026

### Qué se creó

| Archivo                           | Para qué                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `package.json`                    | Nombre `humaya-mvp`, scripts y dependencias                                                        |
| `vite.config.ts`                  | Plugins `react` y `tailwindcss`, `resolve.tsconfigPaths`, config de Vitest (jsdom, globals, setup) |
| `tsconfig.app.json`               | `strict: true`, `noUnusedLocals`/`noUnusedParameters`, alias `@/* → ./src/*`                       |
| `eslint.config.js`                | Flat config con typescript-eslint, react-hooks, react-refresh y `eslint-config-prettier` al final  |
| `.prettierrc` / `.prettierignore` | Comillas simples, punto y coma, 100 columnas                                                       |
| `.env.example`                    | `VITE_USE_MOCKS=true`                                                                              |
| `.github/workflows/ci.yml`        | `lint`, `typecheck`, `test` y `build` en push y PR (todavía no corre: no hay repo)                 |
| `index.html`                      | `lang="es"`, título Humaya, sin la marca de Vite                                                   |
| `src/main.tsx`                    | `StrictMode` → `QueryClientProvider` → `RouterProvider`                                            |
| `src/router.tsx`                  | Exporta `routes` (para los tests) y `router`                                                       |
| `src/components/Placeholder.tsx`  | Pantalla provisional, la reemplazan las fases 3 y 4                                                |
| `src/router.test.tsx`             | 4 tests: `/app`, `/staff`, el redirect de `/` y el 404                                             |
| `src/styles/tokens.css`           | `@import 'tailwindcss'` y un `@theme` vacío que llena la Fase 1                                    |
| `src/test/setup.ts`               | Matchers de `@testing-library/jest-dom`                                                            |

Carpetas creadas vacías, con `.gitkeep`, según la estructura de `docs/PLAN.md`: `src/i18n/`,
`src/types/`, `src/mocks/`, `src/services/`, `src/hooks/`, `src/components/ui/`,
`src/features/guest-app/`, `src/features/staff/`.

### Scripts

| Script               | Qué hace                                           |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo en el puerto 5173           |
| `npm run build`      | `tsc -b` y luego el build de producción en `dist/` |
| `npm run preview`    | Sirve el build de producción                       |
| `npm run lint`       | ESLint sobre todo el proyecto                      |
| `npm run format`     | Prettier en modo escritura                         |
| `npm run typecheck`  | `tsc --noEmit` sobre `src/`                        |
| `npm run test`       | Vitest, una corrida                                |
| `npm run test:watch` | Vitest en modo watch                               |

### Versiones instaladas

Runtime: React 19.2, React DOM 19.2, React Router 7.18, TanStack Query 5.103, lucide-react 1.48.

Desarrollo: Vite 8.3, TypeScript 6.0, Tailwind CSS 4.3 (`@tailwindcss/vite`), Vitest 5.0, jsdom 30.1,
Testing Library (react 16.3, jest-dom 7.0, user-event 14.6), ESLint 10.11 con typescript-eslint 8.70,
Prettier 3.9.

Node 24.19 y npm 11.17 en la máquina de desarrollo. El CI usa Node 22 LTS.

### Decisiones y por qué

- **React 19 en vez de React 18.** `CLAUDE.md` y `docs/PLAN.md` decían 18, pero el scaffolding actual
  de Vite instala 19 y todo el stack (Router 7, Query 5, shadcn/ui) lo soporta. Se actualizó la línea
  del stack en ambos documentos para que no mientan.
- **Tailwind v4, config CSS-first.** Los tokens viven en `src/styles/tokens.css` con `@theme`, sin
  `tailwind.config.js`. Es lo que pide `CLAUDE.md` ("tokens en `src/styles/tokens.css`") y evita tener
  los colores repartidos entre JS y CSS.
- **ESLint en vez de oxlint.** El template de Vite ahora trae oxlint; se reemplazó por ESLint +
  Prettier porque es lo que fija `docs/PLAN.md`. Se agregó `@typescript-eslint/no-explicit-any: error`
  porque `ARCHITECTURE.md` prohíbe `any`.
- **Sin `vite-tsconfig-paths`.** Vite 8 resuelve los paths del tsconfig de forma nativa con
  `resolve.tsconfigPaths: true`.
- **Sin `baseUrl` en el tsconfig.** Está deprecado en TypeScript 6; `paths` resuelve relativo al
  archivo de configuración.
- **`tokens.css` vacío a propósito.** Los valores de marca y las fuentes son trabajo de la Fase 1; la
  Fase 0 no adelanta fases.
- **Sin git.** Por decisión del usuario no se inicializó el repositorio. `.gitignore` y el workflow de
  CI quedan escritos para el día que se versione.
- **Postergados a su fase**: `@fontsource` y shadcn/ui (fases 1 y 4), `react-i18next` y
  `vite-plugin-pwa` (fase 5), Playwright (fase 6). No se instaló nada que no se use todavía, y por eso
  no hay script `e2e`: no dejar comandos rotos.

### Pendiente de la Fase 0

- `git init`, `.gitignore` ya está listo, primer commit y repositorio en GitHub.
- El workflow `.github/workflows/ci.yml` existe pero nunca corrió: no hay repo remoto.

### Verificación hecha

`lint`, `typecheck`, `test` (4 de 4) y `build` pasan. El servidor de desarrollo levanta y las cuatro
rutas responden 200. El render de las pantallas está verificado por los tests, que montan las rutas
reales de `src/router.tsx` en jsdom; no se hizo una revisión visual en un navegador.

## Próximo paso

Revisar el pull request #1, cuyos trabajos de CI están verdes. Después, crear el subdominio, SSL y
document root, cargar el artefacto de CI y completar la validación física de la PWA y el ensayo de la
demo. No fusionar ni desplegar como parte de esta ejecución.
