# Fase 6 — Traslado, pruebas E2E y entrega

La fase está **completa en código, pero abierta operativamente** en la rama `metodo-humaya`. La
topología aprobada usa `metodo.stayhumaya.com` con un document root independiente. La portada, el
paquete para Apache, Playwright y el CI están implementados; el despliegue, los dispositivos físicos
y el ensayo de la demo continúan pendientes.

## Resultado esperado

Al terminar esta fase, el MVP debe vivir en el repositorio oficial, pasar sus verificaciones en CI,
tener una entrada clara según la topología aprobada, contar con tres flujos críticos automatizados y
estar validado como PWA en Android y iPhone desde una URL HTTPS real.

La fase no incorpora backend, autenticación, WhatsApp, IA real ni datos de producción. La demo sigue
usando exclusivamente los servicios mock con `VITE_USE_MOCKS=true`.

## Estado previo confirmado el 26 sep 2026

El repositorio oficial ya fue clonado y auditado. La revisión completa está en
[`docs/REPO-OFICIAL.md`](REPO-OFICIAL.md).

- Remoto: `tonyalvarado042/humaya-web`, rama `main` limpia y alineada con `origin/main`.
- La raíz contiene la landing productiva de `stayhumaya.com`; no puede reemplazarse con el build.
- El hosting es SiteGround y el despliegue actual es manual mediante ZIP.
- La landing usa HTML/CSS/JS sin build, cuatro idiomas y formularios reales conectados a Supabase.
- No existen Node, CI, tests, manifest ni service worker en el repo oficial.
- El manifest mantiene `start_url` y `scope` en `/app`; el service worker se aislará mediante el
  subdominio independiente.
- La topología aprobada es una carpeta de código propia y un origen/document root separado en
  SiteGround: `metodo.stayhumaya.com`.

### Avance en la rama `metodo-humaya`

- [x] MVP copiado a `metodo-humaya/` sin reemplazar archivos de la landing.
- [x] Contratos raíz y de la aplicación adaptados al repositorio mixto.
- [x] Workflow de CI agregado con ejecución aislada en el workspace.
- [x] Rama verificada, commiteada y publicada como `origin/metodo-humaya`.
- [x] CI remoto inicial pasa instalación, Prettier, lint, typecheck, 188 tests y build.
- [x] Topología y URL de despliegue aprobadas: `metodo.stayhumaya.com`, document root separado.
- [x] Portada, rutas de producción, `.htaccess`, Playwright y artefacto de CI implementados.
- [x] 191 tests unitarios, build PWA y los 3 E2E pasan localmente.
- [x] Pull request #1 abierto; `checks` y `e2e` confirmados en verde.

## Condiciones para empezar

La integración de código ya cuenta con estas decisiones y permisos:

- [x] URL y clon del repositorio oficial disponibles.
- [x] README, registro de despliegues, `.htaccess`, estructura e historial revisados. No existe un
      `AGENTS.md` oficial previo.
- [x] Hosting identificado: SiteGround sobre Apache, actualmente con despliegue manual.
- [x] Estructura identificada: landing estática productiva que debe conservarse.
- [x] Anthony aprueba el origen separado.
- [x] URL definida: `metodo.stayhumaya.com`.
- [ ] Subdominio, SSL y document root creados en SiteGround.
- [x] Permiso confirmado para trabajar en la rama `metodo-humaya`.
- [ ] Un Android con Chrome y un iPhone con Safari disponibles para la validación física.
- [ ] Revisión y fusión del pull request por Anthony.

Este plan no añade ni propone Vercel: se adapta a SiteGround y a la topología que apruebe Anthony.

## Alcance

1. Trasladar el frontend sin perder la arquitectura ni las verificaciones actuales.
2. Agregar una portada en `/` de `metodo.stayhumaya.com` con accesos a la app del huésped y a
   recepción.
3. Instalar y configurar Playwright.
4. Automatizar tres recorridos: entrevista, reserva de sauna y perfil desde Llegadas.
5. Integrar los E2E al CI del repositorio oficial.
6. Desplegar el artefacto en el document root separado de `metodo.stayhumaya.com`.
7. Validar la PWA instalada, standalone y sin conexión en Android y iPhone.
8. Preparar y ensayar un guion de demo de cinco minutos.
9. Actualizar la documentación y cerrar la entrega con evidencia.

## 1. Auditoría antes del traslado

En el workspace del MVP:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Registrar en el pull request:

- versión de Node y npm;
- cantidad de tests que pasan;
- estado del build PWA;
- archivos que se trasladarán;
- cualquier diferencia conocida respecto al repositorio oficial.

Comprobar antes de copiar:

```bash
rg "from '@/mocks" src/features src/hooks src/components
rg -n "VITE_|password|secret|token" .env* src docs
```

El primer comando no debe encontrar importaciones directas de mocks fuera de tests. El segundo se
revisa manualmente: no debe haber secretos; las claves Wi-Fi y las personas actuales son datos
ficticios de la demo.

## 2. Integración en el repositorio oficial

1. Actualizar el clon oficial y confirmar que la rama parte del último `origin/main`.
2. Releer cualquier instrucción agregada al repositorio desde esta auditoría.
3. Crear una rama desde la rama base acordada, por ejemplo `feat/humaya-mvp`.
4. Elegir la estrategia según lo encontrado:
   - recomendada: crear una carpeta propia, por ejemplo `mvp/`, sin tocar la landing;
   - alternativa: integración bajo el mismo origen, solo si Anthony acepta la complejidad descrita en
     `docs/REPO-OFICIAL.md`;
   - ante cualquier cambio inesperado de stack, detenerse antes de reemplazar configuración.
5. Trasladar como mínimo:
   - `src/` dentro de la carpeta del MVP;
   - `public/`, evitando duplicar assets que se vuelvan compartidos;
   - `docs/` y los contratos `AGENTS.md` y `ARCHITECTURE.md` dentro del área acordada;
   - configuraciones de TypeScript, Vite, Tailwind, ESLint, Prettier y tests;
   - dependencias y scripts necesarios de `package.json`;
   - `.env.example` y el workflow de CI, adaptándolos en vez de sobrescribirlos a ciegas.
6. No trasladar `node_modules/`, `dist/`, `coverage/`, `.env.local` ni archivos específicos de esta
   máquina.
7. Ejecutar `npm install` o el gestor fijado por el repositorio y versionar el lockfile resultante.

Antes de seguir, repetir lint, typecheck, tests y build dentro del repositorio oficial.

## 3. Portada en `/` del origen del MVP

El redirect anterior fue reemplazado por una portada breve y responsive con:

- marca oficial de Humaya;
- frase `Become More Human`;
- acceso principal a `/app`, rotulado “App del huésped”;
- acceso secundario a `/staff`, rotulado “Recepción”;
- una aclaración discreta de que se trata de una demo con datos ficticios.

La portada debe usar los tokens y componentes existentes, funcionar con teclado y tener objetivos
táctiles de al menos 44 px. `/dev/ui` no se muestra como acceso principal.

La raíz de `stayhumaya.com` sigue siendo la landing y no se modifica para cumplir este punto. La
fábrica de rutas excluye `/dev/ui` del build de producción y conserva esa ruta únicamente durante el
desarrollo.

Agregar pruebas de Testing Library que comprueben ambos enlaces, sus destinos y el idioma español de
la portada cuando corresponda. Al entrar en `/app` se mantiene la lógica bilingüe existente; al
entrar en `/staff`, `<html lang>` vuelve a `es`.

## 4. Playwright

Instalar `@playwright/test` como dependencia de desarrollo y agregar:

- `playwright.config.ts`;
- carpeta `e2e/`;
- script `npm run e2e`;
- opcionalmente `npm run e2e:ui` para depuración local;
- reporte HTML y capturas, video y trazas únicamente cuando falle un test.

La configuración debe:

- levantar la app automáticamente con `webServer`;
- usar una `baseURL` local, no un dominio escrito a mano;
- correr inicialmente en Chromium en CI;
- ejecutar cada prueba en un contexto limpio;
- evitar paralelismo si vuelve inestable el estado mock en memoria;
- consultar por rol, nombre accesible y texto visible, no por clases CSS.

### Flujo 1: completar la entrevista

1. Abrir `/app` con Hannah, cuya entrevista inicia incompleta.
2. Confirmar el aviso de IA y el avance inicial.
3. Responder las preguntas restantes de la entrevista light.
4. Aceptar el consentimiento cuando aparezca la pregunta sensible, o verificar explícitamente el
   camino de omisión si ese es el escenario elegido por el test.
5. Confirmar la pantalla final.
6. Volver a Inicio y comprobar que la entrevista aparece completa.

### Flujo 2: reservar sauna

1. Abrir `/app` con Valeria.
2. Entrar a Reservas y elegir Sauna.
3. Elegir un día y un horario disponibles derivados de los mocks; no fijar una posición visual en la
   grilla.
4. Confirmar la reserva.
5. Comprobar instalación, fecha, hora y estado en la tarjeta de confirmación.
6. Verificar que el horario reservado queda deshabilitado durante la misma sesión.

### Flujo 3: abrir un perfil desde Llegadas

1. Abrir `/staff`.
2. Localizar a Valeria Méndez en Llegadas.
3. Abrir su perfil usando el enlace visible de la fila o tarjeta.
4. Comprobar la URL con el `stayId` esperado.
5. Verificar nombre, villa, alerta y al menos una experiencia WOW.

Los tests no deben usar esperas fijas. Deben esperar estados visibles y tolerar las demoras simuladas
de los servicios.

## 5. CI

Adaptar el workflow existente del repositorio oficial. Como mínimo debe ejecutar:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install --with-deps chromium
npm run e2e
```

Recomendaciones:

- mantener los chequeos unitarios separados del trabajo E2E para identificar fallas rápido;
- usar Node 22 LTS, salvo que el repo oficial ya fije otra versión compatible;
- configurar `working-directory` para la carpeta del MVP; la landing no requiere Node;
- subir el reporte y las trazas de Playwright como artefactos cuando falle;
- no guardar credenciales ni variables sensibles en el workflow;
- exigir el CI verde antes de fusionar.

El trabajo `checks` publica `metodo-humaya-dist` durante 14 días e incluye archivos ocultos para no
perder `.htaccess`. El trabajo `e2e` instala Chromium y publica reporte, capturas, video y trazas solo
cuando hay una falla.

## 6. Despliegue en SiteGround y rutas

El workflow crea un paquete reproducible para el document root independiente de
`metodo.stayhumaya.com`. No mezclar el contenido de `dist/` con `public_html` ni reemplazar la landing.
El build mantiene `base: /`, el manifest limita instalación y arranque a `/app`, y el origen separado
impide que el service worker interfiera con `stayhumaya.com`.

Agregar reglas de caché específicas: `sw.js`, `registerSW.js` y `manifest.webmanifest` deben
revalidarse; los bundles con hash pueden usar caché inmutable. Verificar en la URL HTTPS:

- `/` del origen del MVP muestra la portada, si se aprobó el origen separado;
- `/app` y cada pantalla interna abren directamente;
- `/staff`, `/staff/spa` y un perfil abren directamente;
- los assets de `public/` responden sin rutas de una máquina local;
- `manifest.webmanifest`, `registerSW.js` y `sw.js` responden correctamente;
- el service worker controla `/app` y no rompe recepción;
- `start_url` y `scope` siguen siendo `/app`;
- el manifest conserva nombre, colores, orientación e íconos oficiales.

Confirmar además que `stayhumaya.com/`, `confirmado.html`, la lista de espera y el formulario de
reservas siguen funcionando. Si el MVP se publica bajo un subdirectorio en vez de un origen separado,
revisar explícitamente Router, `base`, manifest, service-worker scope, `navigateFallback`,
`start_url` y rutas de assets.

## 7. Validación física de la PWA

Hacer esta validación sobre el despliegue HTTPS definitivo o un preview equivalente.

### Android / Chrome

- [ ] Abrir `/app` y navegar por las cinco pantallas.
- [ ] Instalar desde la opción ofrecida por Chrome.
- [ ] Confirmar nombre e ícono oficial.
- [ ] Abrir desde el ícono y comprobar modo standalone.
- [ ] Visitar las pantallas una vez, cerrar la app, desconectar la red y reabrirla.
- [ ] Confirmar que interfaz, fuentes, logos, foto y datos mock cargan sin conexión.
- [ ] Reconectar y comprobar que una nueva versión se actualiza sin quedar atrapada en caché vieja.

### iPhone / Safari

- [ ] Abrir `/app` en Safari.
- [ ] Usar “Agregar a pantalla de inicio”.
- [ ] Confirmar nombre e ícono oficial.
- [ ] Abrir desde la pantalla de inicio y comprobar presentación standalone.
- [ ] Repetir la reapertura sin conexión después de una primera visita completa.
- [ ] Revisar safe areas, barra inferior y teclado en la entrevista y el concierge.

Registrar fecha, modelo, versión del sistema, navegador, URL probada y resultado. Si se encuentra una
falla de caché, desinstalar la PWA y limpiar los datos del sitio antes de verificar la corrección.

## 8. Revisión responsive y accesible

Revisar con DevTools y, donde corresponda, en los dispositivos físicos:

- `/app` a 360 y 430 px, especialmente wordmark, selector de huésped y ES/EN;
- `/staff` a 390, 768, 1024 y 1440 px;
- navegación completa por teclado;
- foco visible y orden lógico;
- nombres accesibles de controles e imágenes;
- targets táctiles de 44 px;
- zoom de texto y ausencia de scroll horizontal;
- contraste y estados que no dependan solo del color.

Corregir regresiones encontradas y agregar un test automatizado cuando la falla sea reproducible sin
depender de un dispositivo específico.

## 9. Guion de demo de cinco minutos

El recorrido está escrito en [`docs/DEMO.md`](DEMO.md) con estos tiempos aproximados:

1. **0:00–0:40 — Portada y contexto.** Frontend con datos ficticios; dos áreas conectadas.
2. **0:40–2:10 — Huésped.** Cambiar Valeria/Hannah, mostrar ES/EN, entrevista y consentimiento.
3. **2:10–3:10 — Experiencia.** Concierge, villa oficial y reserva de bienestar.
4. **3:10–4:30 — Recepción.** Llegadas, perfil, experiencias WOW y agenda de spa.
5. **4:30–5:00 — PWA y siguiente etapa.** Instalación, offline y reemplazo futuro de mocks por API.

Falta ensayar el recorrido sobre el despliegue HTTPS real. El documento fija de antemano huésped,
idioma, día y horario para que la demo sea repetible.

## 10. Cierre y entrega

Antes del pull request final:

```bash
npx prettier --write "src/**/*.{ts,tsx,css}"
npm run lint
npm run typecheck
npm run test
npm run build
npm run e2e
```

Luego:

- [x] CI del pull request verde en el repositorio oficial.
- [ ] Pull request revisado y fusionado según el proceso de Anthony.
- [ ] Despliegue HTTPS verificado.
- [ ] PWA validada en Android y iPhone con evidencia registrada.
- [ ] Revisión responsive y accesible completada.
- [~] `docs/DEMO.md` creado; falta ensayarlo sobre HTTPS.
- [x] `docs/PLAN.md`, `docs/ESTADO.md` y `docs/FEEDBACK.md` actualizados para la entrega de código.
- [ ] URL, rama/commit entregado y limitaciones conocidas comunicadas.
- [ ] Copia de origen conservada hasta confirmar que la entrega oficial funciona.

La fase se considera terminada solo cuando todos esos puntos están resueltos. Un build local o un
deploy exitoso por sí solos no sustituyen el CI, los E2E ni las pruebas físicas de la PWA.

## Continuación operativa

> Después de aprobar y fusionar el pull request, crear `metodo.stayhumaya.com`, asignarle un document
> root independiente y activar SSL. Descargar `metodo-humaya-dist`, extraerlo únicamente en ese
> document root y ejecutar las listas de las secciones 6 a 9. No cerrar la fase hasta que las rutas
> HTTPS, la validación física Android/iPhone y el ensayo de la demo pasen con evidencia.
