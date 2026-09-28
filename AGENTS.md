# Humaya Web — contrato del repositorio

Este repositorio contiene dos productos con ciclos de trabajo distintos:

- La raíz es la landing productiva de `stayhumaya.com`, construida con HTML, CSS y JavaScript y
  desplegada manualmente en SiteGround.
- `metodo-humaya/` es el frontend React/Vite del Método Humaya: app del huésped, recepción y PWA.

Leé también `metodo-humaya/AGENTS.md` antes de modificar la aplicación.

## Regla principal

No reemplaces ni muevas `index.html`, `confirmado.html`, `.htaccess` o `assets/img/` al trabajar en
el MVP. La landing contiene formularios reales conectados a Supabase y debe seguir funcionando aunque
la aplicación todavía no esté desplegada.

El contenido de `metodo-humaya/dist/` nunca se copia directamente sobre `public_html`: su
`index.html` reemplazaría la landing y su service worker podría controlar todo el dominio.

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

## Integración y despliegue del MVP

- El código vive aislado en `metodo-humaya/`; la landing continúa en la raíz.
- No se configura Vercel.
- La URL y el document root del MVP en SiteGround siguen pendientes de confirmación.
- Hasta definirlos, se permite desarrollar, probar y revisar el build, pero no desplegarlo.
- El service worker debe quedar aislado de la landing antes de cualquier publicación.
- Los secretos de SiteGround, Supabase o GitHub nunca se guardan en el repositorio.

## Git

La rama de integración es `metodo-humaya`. Conservá commits acotados y no mezcles cambios de la
landing con cambios de la aplicación salvo que sea indispensable y quede explicado.

**No crear commits ni ejecutar `git push` por iniciativa propia.** Para cualquier tarea futura, dejá
los cambios verificados en el working tree y esperá una instrucción explícita del usuario antes de
commitear o publicar la rama. Que una tarea esté terminada no implica autorización para commit o push.
