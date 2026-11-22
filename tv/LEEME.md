# HUMAYA TV — la pantalla del televisor de cada villa

Un Cloudflare Worker en **tv.stayhumaya.com**. La pantalla viene de
[guest-tv](https://github.com/Seagey/guest-tv) (MIT), adaptada a HUMAYA.

```
TV:        https://tv.stayhumaya.com/tv/?home=<villa>&k=<clave>
Celular:   https://tv.stayhumaya.com/g?home=<villa>&k=<clave>   ← el QR de la pantalla
```

**La dirección exacta de cada villa sale de Admin**, en
`staff.stayhumaya.com/staff/admin` → *Pantallas del TV* → *Editar* → *Copiar*.
No hay que armarla a mano.

## Qué administra esto y qué no

**Nada.** Este Worker solo pinta. Antes traía su propio `/admin` con una clave
guardada como secreto de Cloudflare y la configuración en un KV: dos puertas,
dos listas de quién puede entrar y una clave más que recordar, para configurar
el mismo hotel que ya se configura en recepción.

Hoy la configuración vive en Supabase (`humaya_tv_villas`,
`humaya_tv_ajustes`) y se edita en **staff.stayhumaya.com/staff/admin**, con la
puerta de recepción y los roles del CRM.

## La clave de cada villa

`/api/state` devuelve el **nombre del huésped** y sus fechas, y el televisor no
tiene cuenta con la que autenticarse. Sin clave, cualquiera que adivine
`?home=v4-bruma` sabría quién duerme ahí esta noche.

La clave va dentro de la dirección, se escribe **una vez** al colgar el
televisor, y no debería quedar en un papel a la vista del huésped. Si se copia
mal, la pantalla lo dice con todas las letras en vez de mostrar un error crudo.

## Publicar

```
npm install
npx wrangler deploy
```

Los archivos de `public/` los sirve Cloudflare directamente (Workers Assets).
**No hay paso de compilación ni nada que regenerar a mano**: antes se
empaquetaban en base64 dentro de un `src/static.js` de 1,2 MB y había que
acordarse de correr un script después de tocar cualquier archivo. Un paso
manual que se olvida es un archivo viejo en producción.

## De dónde salen los datos

```
televisor → tv.stayhumaya.com/api/state
          → Edge Function humaya-tv (Supabase)
          → humaya_tv_villas + humaya_tv_ajustes   [detrás de RLS]
```

Aquí **no vive ninguna llave de Supabase**. Lo único que viaja es la clave de
la villa, que entra por la dirección.

El clima (Open-Meteo, La Fortuna) sí se pide desde el Worker y se guarda media
hora en la caché de Cloudflare.

Las fotos de fondo: primero las que viajan en `public/tv/homes/`, y si no está,
el bucket público `humaya-tv` de Supabase, que es donde caen las que sube
recepción.

## En cada TV (Google TV / Android TV)

1. Instalar la app **Guest TV** con Downloader (código `1061533`).
2. Escribir la dirección completa de esa villa, la que da Admin.

Desde la pantalla se abren Netflix, YouTube y las demás apps. No hace falta
ninguna computadora en el hotel.

## Los aires y la casa inteligente: qué falta de verdad

> **21 de noviembre de 2026.** Tony: *«si aires wifi sí habrán pero aún no tengo
> instalado eso»*. Esto queda escrito ahora porque hoy `/api/aircon` y
> `/api/hub` contestan «no hay nada» y **no dicen en ninguna parte qué habría
> que poner ahí**. Cuando lleguen los aires, nadie debería tener que leer 800
> líneas de `tv.js` para averiguarlo.

**La pantalla ya está entera.** Todo el lado del televisor vino de guest-tv y
nunca se quitó: la tarjeta *Climate*, el panel de zonas con su dial, las
flechas que suben y bajan la temperatura, OK que prende y apaga cada zona, el
refresco cada 20 segundos y el texto para cuando el aire no contesta. Lo único
que falta son estas dos rutas de `src/index.js`, que hoy son una línea cada una.

### `/api/aircon`

`GET` devuelve el estado; `POST` recibe un cambio. Lo que la pantalla lee:

```
{ connected, power: "on"|"off", mode: "cool"|"heat"|"fan", can_mode,
  simulated?, preview?,
  zones: [ { id, label, on, temp, setpoint, can_set } ] }
```

`POST {zone, on}` o `POST {zone, setpoint}` → `{ok: true}`, o
`{ok: false, error: "…"}` y la pantalla muestra ese texto. El `setpoint` va
entre 16 y 30, y cinco pulsaciones seguidas se juntan en un solo envío.

Dos banderas que guest-tv ya trae y sirven justo para esta etapa:
`simulated` avisa en pantalla que no se mueve nada real, y `preview` que el
cambio se ve pero todavía no se manda. **Con `zones: []` la tarjeta de clima
muestra el tiempo de afuera**, que es lo que se ve hoy.

### `/api/hub` (piscina, parlantes, luces)

```
{ rooms: [ { id, label, lights: { on } } ],
  pool: { label, temp, setpoint, heater, can_heat } | null,
  speakers: [ { id, label, playing, volume } ] }
```

`POST {heater}`, `POST {speaker, action, volume}`, `POST {lights, on}`.

### La restricción que decide si esto es fácil o difícil

**Este Worker corre en el borde de Cloudflare, no en la villa**, y no tiene
ninguna ruta a la red local de la casa. Que los aires sean «de WiFi» no basta:
lo que importa es por dónde se les habla.

- Si la marca tiene **API en la nube** (token, HTTPS, documentada), el Worker la
  llama igual que llama al clima y **no hace falta nada dentro de la villa**.
  Es una tarde de trabajo.
- Si el aire **solo habla en su red local**, hace falta algo adentro de la
  villa que salga hacia afuera —un túnel, un mini servidor— y eso ya es
  hardware, mantenimiento y una pieza más que se puede caer.

Al comprar, esa es la pregunta que vale: *¿tiene API en la nube?* No «¿es
inteligente?».
