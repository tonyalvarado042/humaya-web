# Registro de despliegues — stayhumaya.com

Qué versión hay arriba, siempre. La versión también va **dentro del HTML**, así que
se puede comprobar sin entrar a ningún panel:

```bash
curl -s https://stayhumaya.com/ | grep humaya-version
```

| Versión | Fecha | Dónde | Qué cambió |
|---|---|---|---|
| **1.1.0** | 2026-08-26 | SiteGround | El formulario de reservas ya guarda de verdad (tabla `booking_requests` + función `book`). Antes solo mostraba "gracias" y se perdía el dato. Se estampó la versión en el HTML. |
| 1.0.1 | 2026-08-26 | SiteGround | Se agregó `.htaccess` (HTTPS, quitar www, gzip, caché). Primer despliegue en SiteGround, subido a mano por Tony. |
| 1.0.0 | 2026-08-26 | Vercel *(retirado)* | Primer sitio en línea. Se movió a SiteGround porque ahí está el hospedaje y el correo. |

## Cómo publicar

1. Empaquetar `index.html`, `.htaccess` y `assets/img/`.
2. SiteGround → Site Tools → Site → File Manager → `public_html`.
3. Subir el ZIP → Extract → borrar el ZIP.
4. Comprobar: `curl -s https://stayhumaya.com/ | grep humaya-version`
5. Anotar la versión nueva en esta tabla.

> Subir el ZIP **reemplaza** `index.html` y las imágenes que coincidan, pero **no
> borra** archivos viejos que ya no estén en el paquete. Si alguna vez se quita una
> imagen del sitio, hay que borrarla a mano del servidor.

## Reglas de numeración

- **Parche** (1.1.x) — textos, colores, ajustes chicos.
- **Menor** (1.x.0) — una sección nueva, un formulario que antes no existía.
- **Mayor** (x.0.0) — rediseño o cambio de estructura.
