# Revisión del repositorio oficial de StayHumaya

Foto tomada el **26 de septiembre de 2026** después de clonar y revisar `humaya-web`. La auditoría se
hizo sin modificar el clon; después, por instrucción del usuario, el MVP se integró de forma aislada
en la rama `metodo-humaya`.

## Actualización de integración

- El código vive en `metodo-humaya/`; la landing permanece en la raíz.
- Se agregó un contrato raíz para proteger landing, formularios y proceso de despliegue.
- Se agregó CI con Node 22 y `working-directory: metodo-humaya`.
- El build y el artefacto para Apache están preparados, pero no se desplegó ni se publicó el service
  worker.
- La URL aprobada es `metodo.stayhumaya.com`; crear su subdominio, SSL y document root separado sigue
  pendiente. Producción continúa intacta.

## Conclusión ejecutiva

El repositorio oficial **no está vacío** y no es un contenedor listo para reemplazar. Aloja la landing
productiva de `stayhumaya.com`, con formularios reales, cuatro idiomas y un proceso manual de
despliegue a SiteGround.

El MVP puede vivir en el mismo repositorio, pero **no se debe copiar en la raíz ni desplegar su
`dist/` sobre `public_html`**. Eso reemplazaría la landing. Además, el service worker actual del MVP
se registra con alcance `/`; si se publicara sin ajuste en el mismo origen, podría controlar también
el sitio público.

La decisión aprobada conserva intacta la landing y mantiene el código del MVP en una carpeta propia
del repositorio. Su build se desplegará en `metodo.stayhumaya.com`, con un document root separado en
SiteGround.

## Estado comprobado del repositorio

| Área                   | Situación actual                                                              |
| ---------------------- | ----------------------------------------------------------------------------- |
| Remoto                 | `https://github.com/tonyalvarado042/humaya-web.git`                           |
| Rama base auditada     | `main`, alineada con `origin/main` y sin cambios locales                      |
| Rama de integración    | `metodo-humaya`                                                               |
| Último commit revisado | `8195270` — versión 1.2.2, 27 ago 2026                                        |
| Tecnología             | HTML, CSS y JavaScript sin framework ni proceso de build                      |
| Sitio                  | Landing de una página en `index.html`; confirmación en `confirmado.html`      |
| Hosting                | SiteGround, despliegue manual por ZIP a `public_html`                         |
| Dominio                | `stayhumaya.com`; HTTPS y eliminación de `www` vía `.htaccess`                |
| Backend real           | Edge Functions de Supabase para lista de espera y solicitudes de reserva      |
| Idiomas                | ES, EN, DE y FR en un objeto `I18N` dentro de `index.html`                    |
| Automatización         | Sin `package.json`, tests, CI ni despliegue automático                        |
| PWA                    | Sin manifest ni service worker                                                |
| Reglas para agentes    | No hay `AGENTS.md`; solo una configuración local de lanzamiento en `.claude/` |

El README declara que producción está en la versión 1.2.2. La comprobación automática de la URL
desde este entorno recibió HTTP 403 de SiteGround, por lo que **no se confirmó que el HTML público
sea idéntico al commit local**. Ese 403 puede ser una restricción a tráfico automatizado y no prueba
que el sitio esté caído; hay que comprobarlo en un navegador normal antes de integrar.

## Lo que ya coincide

- `mark-gold.png`, `wordmark-white.png` y `villa-02.jpg` son idénticos byte por byte entre el MVP y
  el repositorio oficial; se compararon sus SHA-256.
- Ambos proyectos usan negro como base, una familia de tonos dorados y la marca “Become More Human”.
- Ambos contemplan los mismos cinco pilares y contenido bilingüe ES/EN.
- SiteGround usa Apache y ya tiene `mod_rewrite` en `.htaccess`, así que técnicamente puede servir una
  SPA si se agregan reglas acotadas y se verifica el servidor real.
- El MVP no necesita conectarse todavía a las tablas ni a las Edge Functions del sitio: continúa con
  mocks, por alcance aprobado.

El repositorio oficial también contiene variantes adicionales de marca (`mark`, `wordmark` y
`lockup` en gold, ink y white) y más fotografías de villas. No hace falta duplicarlas sin una razón;
la integración debe decidir una sola ubicación canónica para los assets compartidos.

## Diferencias que importan

| Tema             | Landing oficial                                   | MVP                                                           | Consecuencia                                                                                           |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Raíz `/`         | Landing pública y formularios reales              | Portada demo prevista para Fase 6                             | La portada demo no puede reemplazar la raíz productiva.                                                |
| Stack            | Archivo estático sin build                        | React/Vite/TypeScript                                         | Conviene alojar el MVP en una subcarpeta con ciclo de build independiente.                             |
| Hosting          | SiteGround manual                                 | Sin hosting configurado                                       | El runbook debe adaptarse a SiteGround, no a Vercel.                                                   |
| Rutas            | Anclas dentro de `/`                              | `/app`, `/staff`; `/dev/ui` solo en desarrollo                | El origen separado usa un fallback SPA propio sin tocar la landing.                                    |
| Service worker   | No existe                                         | Se registra en `/sw.js` con alcance `/`                       | En el mismo origen podría controlar y cachear la landing.                                              |
| Fallback offline | No aplica                                         | Hoy apunta a `/index.html`                                    | En el mismo origen apuntaría a la landing, no al shell React.                                          |
| Idiomas          | ES, EN, DE y FR reales                            | ES y EN; DE/FR caen a español                                 | Es una diferencia visible, aunque DE/FR siguen fuera del MVP.                                          |
| Tipografía       | Jost para display e Inter para cuerpo             | Cormorant Garamond para display y Jost para cuerpo            | Falta decidir si la app adopta las fuentes oficiales de la landing.                                    |
| Dorado principal | `#C8AD85`, documentado como color exacto del logo | Guest `#C8A565`; staff usa un dorado más oscuro por contraste | Hay que armonizar marca sin perder contraste AA.                                                       |
| Fondo claro      | `#F4F1EA`                                         | Staff `#F4F0E8`                                               | Diferencia menor, pero debe resolverse como token de marca.                                            |
| Fuentes          | Google Fonts                                      | `@fontsource`, empaquetadas y offline                         | Conviene mantener fuentes locales para la PWA, aunque cambien las familias.                            |
| Calidad          | Sin tests ni CI                                   | 191 tests, 3 E2E, lint, typecheck y build                     | El CI trabaja dentro de la carpeta del MVP sin imponer Node a la landing.                              |
| Despliegue       | ZIP manual y registro de versiones                | Build genera archivos con hash                                | No se debe mezclar `dist/` a ciegas con `public_html`.                                                 |
| Caché            | Imágenes inmutables 1 año; JS 1 mes               | Service worker con actualización automática                   | `sw.js`, registro y manifest necesitan `no-cache`; Workbox y assets con hash sí pueden ser inmutables. |

## Riesgos de una copia directa

1. **Pérdida de la landing:** el `index.html` de Vite reemplazaría el `index.html` público.
2. **Formularios rotos:** un cambio de estructura o despliegue podría afectar las llamadas reales a
   Supabase para lista de espera y reservas.
3. **Service worker sobre el sitio público:** el registro actual usa scope `/`, no solamente `/app`.
4. **Fallback incorrecto:** Workbox precachea y usa el `index.html` del MVP; en la raíz oficial ese
   nombre pertenece a la landing.
5. **Rutas directas con 404:** el `.htaccess` actual no tiene fallback para `/app` ni `/staff`.
6. **Caché vieja del service worker:** las reglas actuales de Apache permiten caché prolongada de
   JavaScript y no exceptúan `sw.js`.
7. **Colisión de assets:** ambos proyectos usan una carpeta `assets`, con políticas y procesos de
   generación distintos.
8. **Despliegue no reproducible:** hoy producción se actualiza manualmente y el repo no verifica el
   build antes de publicar.

## Topologías posibles

### A. Carpeta de código + origen separado — aprobada

Estructura orientativa del repositorio:

```text
humaya-web/
├── index.html              # landing, sin reemplazar
├── confirmado.html
├── assets/img/
├── .htaccess
    └── metodo-humaya/          # React/Vite
    ├── src/
    ├── public/
    ├── docs/
    └── package.json
```

El build de `metodo-humaya/` se publica en el document root separado de
`metodo.stayhumaya.com`. Así el MVP puede conservar
sus rutas `/`, `/app` y `/staff` dentro de su propio origen; el service worker no toca la landing y la
portada demo de Fase 6 puede existir sin reemplazar `stayhumaya.com/`.

Ventajas:

- menor riesgo para producción y para los formularios;
- PWA y caché aisladas por origen;
- despliegues independientes;
- la landing continúa sin requerir Node;
- CI puede usar `working-directory: metodo-humaya`.

Decisión: el origen será `metodo.stayhumaya.com`. Falta crearlo en SiteGround, asignar su document
root independiente, activar SSL y acordar quién ejecuta el despliegue manual.

### B. Mismo origen y rutas reservadas — posible, más compleja

Mantener la landing en `/` y servir el shell React solo para `/app`, `/staff` y `/dev/ui`. Exige:

- cambiar la salida y el `base` de Vite;
- separar el shell de React del `index.html` público;
- restringir el service worker a `/app`;
- ajustar `navigateFallback`, manifest y rutas de assets;
- crear reglas Apache que respeten archivos reales, formularios y `confirmado.html`;
- decidir cómo sirve `/staff` el mismo shell sin quedar bajo la PWA del huésped;
- probar caché y apertura directa de cada ruta en SiteGround.

Tiene más puntos de falla y acopla el release de la app al de la landing. No es la recomendación
inicial.

## Decisiones necesarias antes de desplegar

- [x] Código fuente aislado en una carpeta propia del repositorio.
- [x] Origen separado aprobado.
- [x] URL definida: `metodo.stayhumaya.com`.
- [ ] Crear el subdominio, SSL y document root independiente en SiteGround.
- [x] Permiso para trabajar en la rama `metodo-humaya`.
- [ ] Confirmar quién revisa y fusiona en `main`.
- [x] La portada demo vive en `/` del origen separado.
- [x] La app conserva su dirección visual, fuentes y tokens actuales durante esta fase.
- [ ] Confirmar si DE/FR siguen fuera de alcance para la app del huésped.
- [x] El CI produce un artefacto reproducible; la carga a SiteGround continúa manual.
- [x] `/dev/ui` se limita al desarrollo y responde con la pantalla de ruta inexistente en producción.
- [ ] Verificar `stayhumaya.com` en un navegador normal y confirmar la versión de producción.

## Posición actual

| Frente                           | Estado                                  |
| -------------------------------- | --------------------------------------- |
| MVP funcional                    | Listo: fases 0–5, 191 tests y build PWA |
| Repositorio oficial identificado | Listo: clonado, limpio y auditado       |
| Assets oficiales                 | Listo: coincidencia exacta confirmada   |
| Estrategia de convivencia        | `metodo.stayhumaya.com`, origen aislado |
| Escritura en repo oficial        | Autorizada en `metodo-humaya`           |
| Integración de código            | Copiada en `metodo-humaya/`             |
| CI oficial                       | Checks y E2E preparados; falta PR final |
| Playwright                       | 3 recorridos pasan localmente           |
| Despliegue del MVP               | Artefacto listo; SiteGround pendiente   |
| Validación PWA física            | Pendiente del origen HTTPS definitivo   |

El siguiente paso es abrir/revisar el pull request y confirmar su CI. Después se crean subdominio,
SSL y document root en SiteGround, se carga el artefacto y se ejecutan la validación física de la PWA
y el ensayo de la demo.
