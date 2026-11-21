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
