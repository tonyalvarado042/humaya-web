# Registro de despliegues — stayhumaya.com

Qué versión hay arriba, siempre. La versión también va **dentro del HTML**, así que
se puede comprobar sin entrar a ningún panel:

```bash
curl -s https://stayhumaya.com/ | grep humaya-version
```

> ⚠️ **31 de octubre de 2026 — esta tabla estaba mintiendo.** Decía que la 1.2.2
> y la 1.3.0 estaban en línea. **No lo estaban:** el servidor tenía la 1.2.1 del
> 27 de agosto. Las dos se anotaron sin que la subida llegara.
>
> **La regla de ahora en adelante:** una fila se anota en esta tabla **después** de
> que el `curl` de arriba devuelva ese número desde el servidor. Nunca antes.

| Versión | Fecha | Dónde | Qué cambió |
|---|---|---|---|
| **1.6.1** | 2026-11-01 | **Cloudflare Pages** | **Se juntaron las dos ramas que se habían separado.** El sitio en línea (v1.6.0) y el repo tenían cosas distintas, y el de en línea **nunca había pasado por git** — `reservar.html`, el motor de Cloudbeds, vivía solo en el servidor. Ahora el repo tiene todo: el motor de reservas, el botón «Ver disponibilidad y reservar», el campo de WhatsApp, **más** los campos del formulario legibles (la 1.6.0 los seguía teniendo invisibles), el correo a `reservations@` (seguía en `hola@`, que no existe) y las URLs por idioma `/en/ /de/ /fr/` con su SEO. La fecha quedó como estaba en línea, **sin día**, hasta que Tony decida — el motor de Cloudbeds no vende antes del 9 de diciembre. |
| 1.6.0 | 2026-10-31 | SiteGround | El motor de Cloudbeds (`reservar.html`). **Subida a mano, nunca entró al repo.** |
| 1.3.1 | 2026-10-31 | *absorbida en la 1.6.1* | **Los campos del formulario de reservas no se veían.** Estaban en `background:transparent` con un subrayado al 12 % de opacidad: sobre negro no se distinguía dónde empezaba el campo. Ahora van con fondo más claro que el fondo de atrás, borde de 2 px, letra de 16 px y halo de oro al enfocar — la receta que Tony ya había pedido en otros tres proyectos. Se agregó `color-scheme:dark`, que es lo que hace que el calendario de las fechas y el desplegable de personas salgan oscuros en vez de con el tema claro de Chrome. **Correo de contacto:** `hola@stayhumaya.com` → `reservations@stayhumaya.com` en los 4 idiomas (el buzón `hola@` nunca se creó). Incluye todo lo de la 1.3.0, que nunca llegó a subirse. |
| 1.3.0 | 2026-10-17 | *nunca se subió* | Apertura: noviembre → **1 de diciembre de 2026** en los 4 idiomas (confirmado por Tony el 26 de setiembre). Se sacó la foto aérea del hero (las villas en semicírculo) a pedido de Tony — quedan 3 fotos rotando. **Paquete de SEO/GEO:** Schema.org (`LodgingBusiness`), Open Graph y Twitter Card completos, `robots.txt`, `sitemap.xml`, `llms.txt` (archivos nuevos en la raíz). **Cambio estructural:** cada idioma pasa a tener su propia URL real — `/en/`, `/de/`, `/fr/` (antes era una sola página que cambiaba de idioma con JS) — con su `hreflang`, su `<title>`/meta/Schema.org traducidos, y el texto ya horneado en el HTML de cada uno (no depende de que el buscador ejecute JS). El selector de idioma ahora navega entre esas URLs en vez de solo cambiar el texto en memoria. Subir `index.html`, `en/`, `de/`, `fr/`, `robots.txt`, `sitemap.xml`, `llms.txt` completos. |
| 1.2.2 | 2026-08-27 | *nunca se subió* | "Descubrí" estaba corrido 34 px a la derecha **en todas las pantallas** — la animación de entrada terminaba en `transform:none` y borraba el `translateX(-50%)` que lo centraba. Ahora se centra con `left/right`, sin depender del transform. Solo `index.html`. |
| 1.2.1 | 2026-08-27 | SiteGround | Separación entre los botones del hero y "Descubrí". En portátiles de ~760 px de alto quedaban a 13 px; ahora hay 88 px. Solo `index.html`. |
| 1.2.0 | 2026-08-27 | SiteGround | Página `confirmado.html` con la marca: el enlace del correo ahora cae ahí. Supabase fuerza `text/plain` en las Edge Functions, así que la función solo redirige (303). Avisos de reserva pasan a `reservations@stayhumaya.com`. |
| 1.1.0 | 2026-08-26 | SiteGround | El formulario de reservas ya guarda de verdad (tabla `booking_requests` + función `book`). Antes solo mostraba "gracias" y se perdía el dato. Se estampó la versión en el HTML. |
| 1.0.1 | 2026-08-26 | SiteGround | Se agregó `.htaccess` (HTTPS, quitar www, gzip, caché). Primer despliegue en SiteGround, subido a mano por Tony. |
| 1.0.0 | 2026-08-26 | Vercel *(retirado)* | Primer sitio en línea. Se movió a SiteGround porque ahí está el hospedaje y el correo. |

## Cómo publicar — desde el 1 de noviembre de 2026

**Ya no se sube nada a mano.** El sitio vive en Cloudflare Pages (proyecto
`humaya-web`), que despliega solo lo que entre a `main` dentro de `sitio/`.

```bash
git push origin main
curl -s https://stayhumaya.com/ | grep humaya-version
```

> ⚠️ **Esta máquina cachea el DNS y puede mentirte.** Si el `curl` devuelve la
> versión vieja, comprobá a qué IP se conectó de verdad:
> `curl -s -o /dev/null -w "%{remote_ip}
" https://stayhumaya.com/`
> Si dice `34.174.253.132` es SiteGround viejo en caché, no el sitio. Forzá
> Cloudflare con `--resolve stayhumaya.com:443:104.21.5.31`.

**Para revertir a SiteGround:** en Cloudflare → DNS, cambiar el CNAME del apex y
del `www` de vuelta a `A 34.174.253.132` en «DNS only». SiteGround conserva
todos los archivos. Tarda minutos.


## Reglas de numeración

- **Parche** (1.1.x) — textos, colores, ajustes chicos.
- **Menor** (1.x.0) — una sección nueva, un formulario que antes no existía.
- **Mayor** (x.0.0) — rediseño o cambio de estructura.
