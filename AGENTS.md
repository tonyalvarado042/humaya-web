# Humaya Web — contrato del repositorio

Este repositorio contiene tres productos con ciclos de trabajo distintos:

- `sitio/` es la landing productiva de `stayhumaya.com`, construida con HTML, CSS y JavaScript.
  **Se publica sola:** es un proyecto de Cloudflare Pages (`humaya-web`) conectado a este
  repositorio, que despliega lo que entre a `main` dentro de `sitio/`. Ya no se sube nada a mano.
- `metodo-humaya/` es el frontend React/Vite del Método Humaya: app del huésped, recepción y PWA.
  Se publica igual de solo, por el Worker `humaya-experience`.

- `tv/` es la pantalla del televisor de cada villa, un Cloudflare Worker en
  `tv.stayhumaya.com`. **Esta NO se publica sola:** se publica con
  `npx wrangler deploy` desde esa carpeta. Lee su configuración de Supabase y no
  administra nada: lo que ve el huésped se edita en `/staff/admin`.

Leé también `metodo-humaya/AGENTS.md` antes de modificar la aplicación, y
`tv/LEEME.md` antes de tocar la pantalla del televisor.

## Regla principal

No reemplaces ni muevas `sitio/index.html`, `sitio/confirmado.html` o `sitio/assets/img/` al
trabajar en el MVP. La landing contiene formularios reales conectados a Supabase y está en línea:
cualquier cosa que entre a `main` sale al aire sin paso manual.

El contenido de `metodo-humaya/dist/` nunca se copia dentro de `sitio/`: su `index.html`
reemplazaría la landing y su service worker podría controlar todo el dominio. No hace falta,
además: la app tiene su propio origen.

## Verificación de la landing

La landing no tiene build. Para verla localmente:

```powershell
python -m http.server 4321
```

Antes de entregar cambios que la toquen, comprobar navegación, cuatro idiomas, lista de espera y
solicitud de reserva. El despliegue actual se documenta en `README.md` y `DESPLIEGUES.md`.

## Verificación del Método Humaya

Desde la raíz:

```bash
npm --prefix metodo-humaya ci
npm --prefix metodo-humaya run lint
npm --prefix metodo-humaya run typecheck
npm --prefix metodo-humaya run test
npm --prefix metodo-humaya run build
```

Prettier se ejecuta antes de lint cuando haya cambios de código:

```bash
cd metodo-humaya
npx prettier --write "src/**/*.{ts,tsx,css}"
```

## Integración y despliegue

> **Corregido el 16 de noviembre de 2026.** Esta sección decía que la landing se subía a mano a
> SiteGround y que faltaba definir dónde viviría el MVP. Las dos cosas estaban viejas: desde el
> 1 de noviembre la landing es Cloudflare Pages, y desde el 15 el MVP tiene su propio Worker.
> Una instrucción vieja en el contrato del repositorio desinforma a todos los que lo lean después.

- El código vive aislado en `metodo-humaya/`; la landing vive en `sitio/`.
- **Un push a `main` publica.** No hay paso manual, y por eso tampoco hay forma de «guardar sin
  publicar»: lo que se commitea sale al aire. Se verifica antes, no después.
- No se configura Vercel.
- La landing: Cloudflare Pages, proyecto `humaya-web`, publica `sitio/`.
- La pantalla del TV: el Worker `humaya-tv`, en `tv.stayhumaya.com`. **Es la
  única pieza que no publica sola**: un push a `main` no la mueve. Se publica
  a mano con `npx wrangler deploy` desde `tv/`.
- La app: un solo Worker, `humaya-experience`, sirviendo los dos dominios —
  `experience.stayhumaya.com` (huésped) y `staff.stayhumaya.com` (recepción, agregado el 16 de
  noviembre de 2026). Quién ve qué lo decide `ladoDe()` en `src/marca.ts`, no la infraestructura.
- El service worker queda aislado de la landing porque vive en otro origen.
- `/exp1` y `/exp2` son propuestas de viaje que se mandan por enlace a una persona concreta. No
  van en el menú ni en `sitemap.xml`, llevan `noindex` y están en `robots.txt`. **Siguen siendo
  públicas para quien tenga el enlace:** no son privadas, son no anunciadas. Si alguna vez hace
  falta que sean privadas de verdad, es Cloudflare Access, no una ruta rara.
- Los secretos de Cloudflare, Supabase o GitHub nunca se guardan en el repositorio.

## Git

La rama que publica es `main`: Pages y el Worker construyen desde ahí. Conservá commits acotados
y no mezcles cambios de la landing con cambios de la aplicación salvo que sea indispensable y
quede explicado.

**No crear commits ni ejecutar `git push` por iniciativa propia.** Para cualquier tarea futura, dejá
los cambios verificados en el working tree y esperá una instrucción explícita del usuario antes de
commitear o publicar la rama. Que una tarea esté terminada no implica autorización para commit o push.
