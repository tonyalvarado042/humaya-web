# HUMAYA Costa Rica — landing

Sitio de una sola página para **Humaya**, el hotel en La Fortuna, Arenal
(Etapa 2 de Bike & Bed). Apertura noviembre 2026.

Negro · bone · oro `#C8AD85` (el tono exacto sacado del logo).
Cuatro idiomas: **ES · EN · DE · FR**. Eslogan fijo en inglés: *Become more human*.

- **Repo:** <https://github.com/tonyalvarado042/humaya-web>
- **Dominio:** `stayhumaya.com`
- **Redes:** [@stayhumaya](https://instagram.com/stayhumaya) en Instagram y Facebook

```
humaya-web/
├── index.html          ← todo el sitio (HTML + CSS + JS en un solo archivo)
├── assets/img/         ← logos e imágenes
│   └── _extra/         ← fotos de la brand board que no se usan en el sitio
└── .claude/launch.json ← config del servidor local
```

## Verlo local

```powershell
python -m http.server 4321 --directory "C:\Users\Usuario\.claude\humaya-hotel"
```

Después abrí <http://localhost:4321>. Para bajarlo: `Get-Process python | Stop-Process`.

> **Ojo:** una sola línea, sin `cd` y sin `&&`. Windows PowerShell 5.1 **no soporta
> `&&`** — tira "The token '&&' is not a valid statement separator in this version".

**Tiene que ser por `http://`**, no abriendo el archivo directo — si no, el formulario
de correo no pasa el control de origen (CORS).

## Subirlo a producción

Es un sitio estático: no hay build, no hay servidor. Cualquiera de estas sirve.

| Opción | Cómo |
|---|---|
| **Vercel** (recomendado) | Importar el repo, sin comandos de build, output = raíz. Dominio en Settings → Domains. |
| **Netlify** | Igual: repo, sin build, publish directory = `.` |
| **GitHub Pages** | Settings → Pages → branch `main` / carpeta raíz. Para el dominio hay que agregar un archivo `CNAME` con `stayhumaya.com`. |

En el DNS del dominio: `A` / `CNAME` apuntando a donde diga el proveedor que elijás,
y `www` como `CNAME` al mismo lado.

## Idiomas

Detecta el idioma del navegador y recuerda la elección en `localStorage`.
Todos los textos viven en el objeto `I18N` dentro de `index.html`. Para cambiar
una frase, se cambia ahí en los cuatro idiomas — el HTML solo lleva `data-i18n="clave"`.

## Lista de correos (Supabase)

Proyecto: **`mlhhhwbgymobcxiklnoz`** · `https://mlhhhwbgymobcxiklnoz.supabase.co`

**Doble opt-in**: se guarda como `pending`, sale un correo con un enlace, y al hacer
clic pasa a `confirmed`. Así la lista queda limpia y lista para migrar a Mailchimp.

| Pieza | Qué hace |
|---|---|
| tabla `public.subscribers` | email, nombre, idioma, origen, estado, token, IP, fechas |
| función `subscribe` | `POST` desde el sitio → guarda en `pending` y manda el correo |
| función `confirm` | `GET ?token=…` → marca `confirmed` y muestra una página con la marca |

La tabla tiene **RLS activo y cero políticas**: nadie la lee ni la escribe desde
afuera. Solo las dos funciones (con service role) la tocan. Es a propósito.

Frenos ya puestos: máximo 6 altas por IP por hora, y un reenvío cada 2 minutos por correo.
Orígenes permitidos: `stayhumaya.com`, `www.stayhumaya.com` y localhost.

### Ver quién se registró

```sql
select email, lang, status, created_at, confirmed_at
from public.subscribers order by created_at desc;
```

### ⚠️ Falta para que salgan los correos

Hoy el alta **se guarda bien pero el correo no sale**, porque falta la llave del
proveedor. En Supabase → Edge Functions → Secrets:

| Secret | Valor |
|---|---|
| `RESEND_API_KEY` | la llave de [resend.com](https://resend.com) (gratis hasta 3.000/mes) |
| `MAIL_FROM` | `HUMAYA <hola@stayhumaya.com>` — el dominio hay que verificarlo en Resend |
| `SITE_URL` | `https://stayhumaya.com` — a dónde vuelve el botón de la página de confirmación |

Sin eso el correo queda registrado igual, y la respuesta trae `email_sent: false`.

## Lo que queda pendiente

1. **Renders reales.** Los que están son los de MODO Studio sacados de los PDF, más
   cinco imágenes **generadas con IA** para el volcán y las aguas termales
   (`vol-*.jpg`, `termales.jpg`). Hay que cambiarlas antes de la campaña grande.
2. **El buzón `hola@stayhumaya.com` todavía no existe.** Hay que crearlo cuando el
   dominio esté conectado.
3. **Las cuentas @stayhumaya** de Instagram y Facebook hay que crearlas — los enlaces
   ya están puestos y apuntan ahí.
4. **El formulario de reserva de abajo no manda nada todavía.** Solo muestra el
   "gracias". Se conecta a Supabase igual que la lista de correos cuando digás.

## Datos que se usaron (y de dónde salen)

- 10 villas, apertura noviembre 2026, La Fortuna de San Carlos → confirmados por Tony.
- Eslogan, los cinco pilares y "a place to become who you were created to be" → de
  la brand board.
- **No hay precios, teléfonos, distancias ni metrajes**, porque no están confirmados.

---

© 2026 Humaya Costa Rica. El logo, los renders y los textos son de la marca —
el repo es público para poder desplegarlo, no para reutilizar los assets.
