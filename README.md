# HUMAYA Costa Rica — landing

Sitio de una sola página para **Humaya**, el hotel en La Fortuna, Arenal
(Etapa 2 de Bike & Bed). Apertura noviembre 2026.

Negro · bone · oro `#C8AD85` (el tono exacto sacado del logo).
Cuatro idiomas: **ES · EN · DE · FR**. Eslogan fijo en inglés: _Become more human_.

|               |                                                                         |
| ------------- | ----------------------------------------------------------------------- |
| **En línea**  | <https://stayhumaya.com>                                                |
| **Hospedaje** | SiteGround · IP `34.174.253.132`                                        |
| **Dominio**   | GoDaddy, delegado a `ns1.siteground.net` / `ns2.siteground.net`         |
| **Repo**      | <https://github.com/tonyalvarado042/humaya-web>                         |
| **Redes**     | [@stayhumaya](https://instagram.com/stayhumaya) en Instagram y Facebook |

```
humaya-web/
├── index.html          ← todo el sitio (HTML + CSS + JS en un solo archivo)
├── .htaccess           ← HTTPS, quitar www, gzip, caché
├── assets/img/         ← logos e imágenes
│   └── _extra/         ← fotos de la brand board que no se usan
└── metodo-humaya/      ← app del huésped, recepción y PWA (React/Vite)
```

## Método Humaya

`metodo-humaya/` es una aplicación independiente dentro del mismo repositorio. Su destino es
`https://metodo.stayhumaya.com`, con un document root separado en SiteGround para aislar el service
worker y evitar que su `index.html` reemplace el del sitio público. El subdominio, SSL y document root
todavía deben crearse antes de publicar el artefacto.

Para correrla y verificarla:

```bash
npm --prefix metodo-humaya install
npm --prefix metodo-humaya run dev
npm --prefix metodo-humaya run lint
npm --prefix metodo-humaya run typecheck
npm --prefix metodo-humaya run test
npm --prefix metodo-humaya run build
npm --prefix metodo-humaya run e2e
```

Las reglas completas están en `AGENTS.md`; la arquitectura y el estado del MVP, dentro de
`metodo-humaya/`. El workflow del MVP guarda `metodo-humaya-dist`, un artefacto desplegable que
incluye el `.htaccess` propio del subdominio; no debe extraerse sobre `public_html` de la landing.

## Publicar un cambio

**No hay despliegue automático.** El sitio se sube a mano:

1. Empaquetar `index.html`, `.htaccess` y `assets/img/` en un ZIP.
2. SiteGround → **Site Tools → Site → File Manager** → `public_html`.
3. Subir el ZIP, botón derecho → **Extract**, borrar el ZIP.

> El `.htaccess` es un **archivo oculto**. Si no aparece después de extraer,
> activá "Show hidden files" en el File Manager.

## Verlo local

```powershell
python -m http.server 4321 --directory "C:\Users\Usuario\.claude\humaya-hotel"
```

Después abrí <http://localhost:4321>. Para bajarlo: `Get-Process python | Stop-Process`.

> **Ojo:** una sola línea, sin `cd` y sin `&&`. Windows PowerShell 5.1 **no soporta
> `&&`**. Y tiene que ser por `http://`, no abriendo el archivo directo, o los
> formularios fallan por CORS.

## Idiomas

Detecta el idioma del navegador y recuerda la elección en `localStorage`.
Todos los textos viven en el objeto `I18N` dentro de `index.html`. Para cambiar
una frase, se cambia ahí en los cuatro idiomas — el HTML solo lleva `data-i18n="clave"`.

## Lo que corre en Supabase

Proyecto **`mlhhhwbgymobcxiklnoz`** · `https://mlhhhwbgymobcxiklnoz.supabase.co`

### 1 · Lista de espera (doble opt-in)

Se guarda como `pending`, sale un correo con un enlace, y al hacer clic pasa a
`confirmed`. Así la lista queda limpia para migrar a Mailchimp cuando se quiera.

| Pieza               | Qué hace                                                |
| ------------------- | ------------------------------------------------------- |
| tabla `subscribers` | email, idioma, origen, estado, token, IP, fechas        |
| función `subscribe` | `POST` → guarda en `pending` y manda el correo          |
| función `confirm`   | `GET ?token=…` → marca `confirmed`, página con la marca |

### 2 · Solicitudes de reserva

El formulario de abajo del sitio. Guarda la solicitud, **le avisa a Humaya** por
correo y **le acusa recibo al huésped** en su idioma.

| Pieza                    | Qué hace                                                 |
| ------------------------ | -------------------------------------------------------- |
| tabla `booking_requests` | nombre, email, fechas, personas, idioma, mensaje, estado |
| función `book`           | `POST` → guarda + los dos correos                        |

Estados: `nueva` → `leida` → `contestada` (o `descartada`).

### Seguridad

Las dos tablas tienen **RLS activo y cero políticas**: no se leen ni se escriben
desde afuera. Solo las Edge Functions (service role) las tocan. Es a propósito —
el advisor de Supabase lo marca como INFO y está bien así.

Frenos: 6 altas de correo por IP/hora, 4 solicitudes de reserva por IP/hora, y un
reenvío cada 2 minutos por dirección.

Orígenes permitidos: `stayhumaya.com`, `www.stayhumaya.com` y localhost.

### Ver qué ha llegado

```sql
select email, lang, status, created_at, confirmed_at
from public.subscribers order by created_at desc;

select name, email, arrival, departure, guests, message, status, created_at
from public.booking_requests where status = 'nueva' order by created_at desc;
```

### Los correos ya salen

`stayhumaya.com` está verificado en Resend y los cuatro secretos están puestos en
Supabase → Edge Functions → Secrets:

| Secret           | Qué es                                                             |
| ---------------- | ------------------------------------------------------------------ |
| `RESEND_API_KEY` | la llave de [resend.com](https://resend.com)                       |
| `MAIL_FROM`      | `HUMAYA <hola@stayhumaya.com>`                                     |
| `SITE_URL`       | `https://stayhumaya.com` — a dónde vuelve el botón de confirmación |
| `BOOKING_INBOX`  | a dónde llegan las solicitudes de reserva                          |

Probado de punta a punta el 26 de agosto de 2026: alta en la lista → correo de
confirmación; solicitud de reserva → aviso a Humaya + acuse al huésped.

Las funciones leen todo con `Deno.env.get`. Si algún día hay que rotar la llave,
se cambia el Secret y listo — no se toca código.

## Lo que queda pendiente

1. **Renders reales.** Los que están son los de MODO Studio sacados de los PDF, más
   cinco imágenes **generadas con IA** para el volcán y las aguas termales
   (`vol-*.jpg`, `termales.jpg`). Hay que cambiarlas antes de la campaña grande.
2. **El buzón `hola@stayhumaya.com`** — crearlo en SiteGround → E-mail → Cuentas.
   Los MX ya están puestos. ⚠️ Los avisos de reserva ya se están mandando ahí, así
   que hasta que exista el buzón esos correos rebotan.
3. **Las cuentas @stayhumaya** de Instagram y Facebook — los enlaces ya apuntan ahí.

## Datos que se usaron (y de dónde salen)

- 10 villas, apertura noviembre 2026, La Fortuna de San Carlos → confirmados por Tony.
- Eslogan, los cinco pilares y "a place to become who you were created to be" → de
  la brand board.
- **No hay precios, teléfonos, distancias ni metrajes**, porque no están confirmados.

---

© 2026 Humaya Costa Rica. El logo, los renders y los textos son de la marca —
el repo es público para poder desplegarlo, no para reutilizar los assets.
