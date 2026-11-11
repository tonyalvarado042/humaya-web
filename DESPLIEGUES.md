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
| **1.7.6** | 2026-11-11 | **Cloudflare Pages** | **Las aguas termales no son de Humaya: están cerca.** Lo vio Tony. El sitio decía *«Agua termal, en el mismo terreno»* y cerraba las preguntas con *«todo en el mismo lugar donde dormís: no hay que manejar a ningún lado»*, metiendo las termales adentro. Peor: el `amenityFeature` del Schema declaraba «Aguas termales» y «Piscina termal» en las 4 portadas y en `/bienestar/` — eso significa literalmente «el hotel tiene esto» y lo leen Google y los motores de IA. Ahora se dice con las dos frases que eligió Tony: **«aguas termales cerca»** y **«el volcán calienta el agua, nosotros solo te decimos dónde»**, con decenas a cinco o diez minutos y el hotel ayudando a elegir y reservar. **«Piscina termal» pasa a «Piscina con vista al volcán»**, que es la amenidad real. La ficha de termales se mueve al final de las seis: las cinco de arriba son nuestras, la sexta no. `llms.txt` lo dice explícito para que ninguna IA lo repita mal. No se nombran termales concretos. Y por decisión de Tony se quita la leyenda «Imágenes de referencia del proyecto» de las cuatro páginas de bienestar. Cuatro idiomas; 37 bloques JSON-LD revisados, ninguno roto; comprobado en las 20 páginas en vivo. |
| **1.7.5** | 2026-11-11 | **Cloudflare Pages** | **Un solo menú en las 20 páginas:** Villas · Bienestar · Experience · La huerta · Propósito · Contacto. Hasta hoy había dos menús que no compartían nada, y las cuatro páginas nuevas colgaban **sólo del pie de la portada** — incómodo para el huésped y malo para el posicionamiento, porque un enlace del menú pesa mucho más que uno del pie. Salen «Experiencias» (se pisaba con Experience) y «El lugar»; las dos secciones siguen en la portada, fuera del menú. Lo eligió Tony. De paso: los enlaces del menú llevan `white-space:nowrap`, porque en francés el navegador partía «Bien-être» por el guion y el menú se iba a dos líneas. Probado: los 20 destinos dan 200; a 1280 y a 1024 el menú entra en una línea sin pisar nada; en móvil los seis enlaces quedan dentro de la pantalla y son tocables. |
| **1.7.4** | 2026-11-11 | **Cloudflare Pages** | **La hamburguesa desaparecía al abrir el menú y no quedaba salida** — defecto que introduje en la 1.7.3: al arreglar el overlay para que midiera la pantalla entera, pasó a taparla. El overlay vive dentro del `<header>`, que ya es contexto de apilamiento, así que su `z-index:99` no compite contra el header sino contra sus hermanos de adentro. Ahora la barra superior (marca, idioma, Reservar y la X) queda por encima del menú, y **tocar el fondo también cierra**. Mi prueba anterior daba verde porque usaba `.click()` sobre el elemento, y eso **no comprueba si algo lo está tapando**: desde la 1.7.4 se prueba con `elementFromPoint` y con clics reales por coordenada. |
| **1.7.3** | 2026-11-11 | **Cloudflare Pages** | **El menú se salía de la pantalla con la página bajada.** Al bajar, el header toma `.solid`, que le agrega `backdrop-filter` — y un elemento con `backdrop-filter` se vuelve el bloque contenedor de sus hijos `position:fixed`. El menú, que vive dentro del header, dejaba de medirse contra la pantalla: el overlay de la portada quedaba de **68px de alto en vez de 812** y dos de los cuatro enlaces caían en `y=-98` y `y=-24`, fuera de la pantalla. Arriba del todo no se notaba, porque ahí el header todavía no es `.solid`. Portadas: se le apaga el blur al header mientras el menú está abierto. Páginas nuevas: el panel pasa a `position:absolute; top:100%` dentro del header, y de paso deja de depender de un `top:62px` escrito a mano. **Y la trampa de caché:** Pages entregaba `/assets/*` con `max-age` de un año e `immutable`, y las 16 páginas nuevas enlazaban `paginas.css` sin versión — quien ya hubiera entrado se quedaba con el CSS viejo hasta **2027**. Ahora el enlace lleva `?v=` y un `_headers` baja la caja a **un día con revalidación**, para que reemplazar una foto se vea el mismo día. Probado a 375×812 **con la página bajada 1800px**, en vivo, en los dos plantillas. |
| **1.7.2** | 2026-11-11 | **Cloudflare Pages** | **El menú móvil que no existía.** Las 16 páginas nuevas escondían los enlaces en móvil y no tenían hamburguesa: desde un teléfono no se podía llegar a ninguna otra página. Y en las portadas, abrir el menú ponía `overflow:hidden` en el `body` y sólo se soltaba tocando la hamburguesa o un enlace — tocar fuera o rotar el teléfono dejaba la página congelada. Ahora los cinco caminos de salida andan en las 20 páginas. La marca `humaya-version` de las cuatro portadas decía 1.6.2 aunque habían cambiado en la 1.7.0 y la 1.7.1: las 20 quedan alineadas. Lo encontró Tony, no la verificación — de ahí la regla **todo se prueba antes de lanzarse**. |
| **1.7.1** | 2026-11-11 | **Cloudflare Pages** | **Sauna, piscina termal, cuatro fotos y el teléfono.** `/bienestar/` pasa de cuatro fichas a seis (sauna y piscina termal entran al texto, al Schema y a `llms.txt`) y suma una galería de cuatro imágenes **de referencia, marcadas como tales**, que hay que reemplazar por fotos reales antes de abrir. El teléfono **+506 6444 6939** entra al pie de las 20 páginas y como `telephone` en el Schema; no se inventó, coincide en la ficha de Google y en la constante del formulario de reservas. |
| **1.7.0** | 2026-11-11 | **Cloudflare Pages** | **Cuatro páginas nuevas, cada una en los cuatro idiomas — 16 en total.** `/bienestar/` (gimnasio, cold plunge, luz infrarroja, termales), `/experiencia/` (**HUMAYA Experience**, *Feel what makes you human*, los cinco pilares y los **Momentos HUMAYA**), `/proposito/` (**Naturaleza Viva** y **Comunidad con Futuro**: el hotel empieza destinando el **1 %** de sus ingresos y publicará resultados cada año) y `/huerta/` (huerta, clases de cocina, caminatas). El Schema de la portada pasa de amenities de *villa* a las de *wellness*. `sitemap.xml` sube a 21 URLs; `llms.txt` suma los hechos nuevos **y la advertencia de que los aliados no están confirmados**, para que ninguna IA lo cite como hecho. Hoja compartida `assets/paginas.css` para las 16. El texto de propósito queda **en futuro** a propósito: el hotel abre en diciembre y no hay proyectos ni aliados definidos. |
| **1.4.4 / 1.6.2** | 2026-11-05 | **Cloudflare Pages** | **Posicionamiento "HUMAYA Wellness Hotel" en SEO/GEO.** Title, meta description, keywords, Open Graph, Twitter Card y Schema.org (`LodgingBusiness`) en `index.html`, `en/`, `de/`, `fr/` (1.6.2) y `reservar.html` (1.4.4) pasan a llevar ese posicionamiento. Se agregaron dos amenities reales al structured data (aguas termales cercanas, yoga/recuperación), `llms.txt` reescrito con el mismo enfoque y la fecha ya alineada con el sitio (diciembre 2026, sin día), y `sitemap.xml` suma `reservar.html` (no estaba). **De paso se encontró y se cerró un loop de canonical:** Cloudflare redirige `reservar.html` → `/reservar` (308), pero el canonical/og:url/JSON-LD de esa página seguían apuntando de vuelta a `reservar.html`. Ahora los tres apuntan a `/reservar`, la URL que el servidor sirve de verdad. No se tocó body, anchors, rutas de imágenes, hreflang, ni la lógica JS que arma la URL de reserva con las fechas. |
| 1.6.1 | 2026-11-01 | **Cloudflare Pages** | **Se juntaron las dos ramas que se habían separado.** El sitio en línea (v1.6.0) y el repo tenían cosas distintas, y el de en línea **nunca había pasado por git** — `reservar.html`, el motor de Cloudbeds, vivía solo en el servidor. Ahora el repo tiene todo: el motor de reservas, el botón «Ver disponibilidad y reservar», el campo de WhatsApp, **más** los campos del formulario legibles (la 1.6.0 los seguía teniendo invisibles), el correo a `reservations@` (seguía en `hola@`, que no existe) y las URLs por idioma `/en/ /de/ /fr/` con su SEO. La fecha quedó como estaba en línea, **sin día**, hasta que Tony decida — el motor de Cloudbeds no vende antes del 9 de diciembre. |
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
