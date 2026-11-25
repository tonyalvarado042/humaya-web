// HUMAYA TV: la pantalla de bienvenida de cada villa, en un Cloudflare Worker.
//
//   TV:       https://tv.stayhumaya.com/tv/?home=<villa>&k=<clave>
//   Celular:  https://tv.stayhumaya.com/g?home=<villa>&k=<clave>   (el QR de la pantalla)
//
// La pantalla viene de guest-tv (Seagey/guest-tv, MIT), adaptada a HUMAYA.
//
// ── POR QUE YA NO HAY ADMIN AQUI ────────────────────────────────────────
// Lo habia: /admin, con su propia clave guardada como secreto de Cloudflare,
// y la configuracion en un KV. Dos lugares para entrar, dos listas de quien
// puede, y una clave mas que recordar.
//
// Ahora se configura en staff.stayhumaya.com/staff/admin, con la misma puerta
// de recepcion y los mismos roles del CRM. Este Worker quedo siendo lo que
// deberia: una pantalla que PINTA, sin nada que guardar.
//
// ── DE DONDE SALEN LOS DATOS ────────────────────────────────────────────
// De la Edge Function `humaya-tv` de Supabase, que lee las tablas detras de
// RLS. Aqui no vive ninguna llave de Supabase: lo unico que viaja es la clave
// de la villa, que entra por la direccion del televisor.
import qrcode from "qrcode-generator";
import { guidePage } from "./guide.js";

/** De donde se pide el estado. Se puede cambiar con la variable SUPABASE_FN. */
const FN_POR_DEFECTO = "https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1";

/**
 * El clima por omision: La Fortuna, donde esta HUMAYA.
 *
 * Aca decia que vivia escrito «a proposito: el hotel no se muda». Cierto para
 * UN hotel. Con mas de uno, el televisor de un hotel en otra parte mostraba
 * el clima de La Fortuna — y el clima de cada hotel ya estaba en la base,
 * en `humaya_tv_ajustes` (clima_lugar, clima_lat, clima_lon, clima_tz).
 *
 * Ahora la pantalla manda el suyo, que le llego con su estado, y esto queda
 * solo para cuando todavia no lo tiene (el primer dibujo) o el hotel no lo
 * configuro.
 */
const CLIMA = { place: "La Fortuna", lat: 10.4678, lon: -84.6427, tz: "America/Costa_Rica" };

/**
 * Un hotel sin foto se queda SIN foto.
 *
 * Aca habia un `FOTO_POR_DEFECTO = "humaya-own-hero"`, y esa foto trae el
 * logotipo de HUMAYA quemado dentro de la imagen. El 25 de noviembre de 2026,
 * al colgar las cinco pantallas de Bike & Bed, cada cabana recibio al huesped
 * con «HUMAYA» en letras de un palmo: el hotel de otra empresa, en la pared
 * de su cuarto. No era un detalle de diseno — era decirle que esta en otro
 * hotel, el mismo fallo que `LogoDelHotel` ya habia tenido en recepcion.
 *
 * La foto de HUMAYA no se borro: paso a ser un DATO suyo, en
 * `humaya_tv_ajustes.foto`, igual que la de cualquier otro hotel. Lo que se
 * fue es el respaldo escrito en el codigo, que convertia a un hotel en otro.
 *
 * Sin foto la pantalla queda negra y se lee entera —hora, bienvenida, clima,
 * los QR y las apps—; medido en vivo antes de hacer este cambio. Un fondo
 * negro no le miente a nadie.
 */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });

// ---------------------------------------------------------------- el estado

/**
 * El estado de la villa, pedido a Supabase.
 *
 * `phone_url` lo arma este Worker y no la funcion: la funcion no sabe en que
 * dominio esta colgada la pantalla, y ese enlace es el que termina dentro del
 * QR que escanea el huesped.
 */
async function estadoDe(env, url) {
  const home = url.searchParams.get("home") || url.searchParams.get("tv") || "";
  const clave = url.searchParams.get("k") || "";
  if (!home || !clave) return { error: "falta_villa_o_clave", status: 400 };

  const base = env.SUPABASE_FN || FN_POR_DEFECTO;
  const pedido = new URL(`${base}/humaya-tv`);
  pedido.searchParams.set("villa", home);
  pedido.searchParams.set("clave", clave);
  const fase = url.searchParams.get("phase");
  if (fase) pedido.searchParams.set("phase", fase);

  let r;
  try {
    r = await fetch(pedido.toString());
  } catch {
    return { error: "sin_conexion", status: 502 };
  }
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) return { error: cuerpo.error || "no_autorizado", status: r.status };

  // Sin foto propia, ninguna: nunca la de otro hotel.
  const hero = (cuerpo.photos && cuerpo.photos.hero) || "";
  cuerpo.photos = { hero, inside: hero, area: hero };

  // La direccion que termina dentro del QR. Si la villa esta ocupada ahora,
  // lleva ADEMAS la llave de la estadia: eso es lo que deja que el huesped
  // entre a la app sin escribir su codigo. Ver `supabase/functions/*/llave.ts`.
  //
  // La llave de la villa (`k`) no cambia nunca, asi que una foto vieja del
  // televisor abre esta pagina para siempre; la de la estadia se vence con
  // ella, y la pantalla dibuja una nueva sola en el siguiente refresco.
  const conClave = `?home=${encodeURIComponent(home)}&k=${encodeURIComponent(clave)}`;
  const conLlave = cuerpo.llave_estadia
    ? `${conClave}&s=${encodeURIComponent(cuerpo.llave_estadia)}`
    : conClave;
  cuerpo.phone_url = url.origin + "/g" + conLlave;
  return { estado: cuerpo, status: 200 };
}

// ---------------------------------------------------------------- las fotos

/**
 * `/tv/homes/<nombre>.jpg`
 *
 * Primero las que vienen dentro del Worker —las de HUMAYA por defecto—, y si
 * no esta, se busca en el bucket publico de Supabase, que es donde caen las
 * que sube recepcion. Asi `tv.js` no cambio: sigue pidiendo `homes/x.jpg`.
 */
const NOMBRE_DE_FOTO = /^[a-z0-9][a-z0-9.-]{0,79}\.jpg$/;

async function foto(env, request, nombre) {
  // Primero las que viajan con el Worker (las de HUMAYA por defecto).
  const dentro = await env.ASSETS.fetch(request);
  if (dentro.status === 200) return dentro;
  if (!NOMBRE_DE_FOTO.test(nombre)) return new Response("not found", { status: 404 });

  const base = (env.SUPABASE_FN || FN_POR_DEFECTO).replace("/functions/v1", "");
  const r = await fetch(`${base}/storage/v1/object/public/humaya-tv/${encodeURIComponent(nombre)}`, {
    cf: { cacheTtl: 86400, cacheEverything: true },
  });
  if (!r.ok) return new Response("not found", { status: 404 });
  return new Response(r.body, {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" },
  });
}

// ---------------------------------------------------------------- el clima

async function weather(ctx, url) {
  // De donde pedirlo: lo que mando la pantalla, o La Fortuna.
  const lat = Number(url && url.searchParams.get("lat"));
  const lon = Number(url && url.searchParams.get("lon"));
  const donde = Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)
    ? {
      lat, lon,
      tz: (url.searchParams.get("tz") || CLIMA.tz),
      place: (url.searchParams.get("place") || CLIMA.place),
    }
    : CLIMA;

  const q = new URLSearchParams({
    latitude: donde.lat, longitude: donde.lon, timezone: donde.tz, forecast_days: 7,
    current: "temperature_2m,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
  });
  const cacheKey = new Request("https://weather.cache/" + q.toString());
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit.json();
  try {
    // Sin `cf: { cacheTtl }`: con una URL con query, Cloudflare contestaba
    // "Unexpected internal error" en texto plano y el JSON.parse reventaba.
    // El cacheo de media hora ya lo hace el `cache.put` de abajo.
    const r = await fetch("https://api.open-meteo.com/v1/forecast?" + q);
    if (!r.ok) {
      console.error("clima_http", r.status, (await r.text()).slice(0, 200));
      return { place: donde.place, ok: false };
    }
    const d = await r.json(), dl = d.daily;
    if (!d.current || !dl) {
      console.error("clima_sin_datos", JSON.stringify(d).slice(0, 200));
      return { place: donde.place, ok: false };
    }
    const out = {
      ok: true, place: donde.place,
      now: { temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, day: d.current.is_day },
      days: dl.time.map((t, i) => ({
        date: t, code: dl.weather_code[i], hi: Math.round(dl.temperature_2m_max[i]), lo: Math.round(dl.temperature_2m_min[i]),
        rain: dl.precipitation_probability_max[i], sunrise: dl.sunrise[i].slice(-5), sunset: dl.sunset[i].slice(-5),
      })),
    };
    ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(out), { headers: { "cache-control": "max-age=1800" } })));
    return out;
  } catch (e) {
    // Un clima que falla callado se ve igual que un clima nublado.
    console.error("clima_falla", String((e && e.message) || e));
    return { place: donde.place, ok: false };
  }
}

// ---------------------------------------------------------------- QR

function qrSvg(text) {
  const q = qrcode(0, "M");
  q.addData(text, "Byte");
  q.make();
  const n = q.getModuleCount(), b = 2, size = n + b * 2;
  let path = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) path += `M${c + b} ${r + b}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#111"/></svg>`;
}
const wifiQr = (w) => {
  const e = (s) => String(s || "").replace(/([\\;,:"])/g, "\\$1");
  return `WIFI:T:WPA;S:${e(w.ssid)};P:${e(w.password)};;`;
};

// ---------------------------------------------------------------- rutas

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (p === "/" || p === "/tv") return Response.redirect(url.origin + "/tv/" + url.search, 302);

    if (p === "/api/health") return json({ ok: true, app: "humaya-tv" }, 200, { "access-control-allow-origin": "*" });
    if (p === "/api/weather") return json(await weather(ctx, url));

    // Lo que guest-tv pide y HUMAYA no tiene: se contesta vacio en vez de 404,
    // porque la pantalla los consulta en cada arranque.
    if (p === "/api/hub") return json({ rooms: [], pool: null, speakers: [] });
    if (p === "/api/aircon") return json({ connected: false, power: "off", mode: "cool", can_mode: false, zones: [] });
    if (p === "/api/tv/apps") return json({ apps: [] });
    if (p === "/api/log") return json({ ok: true });

    if (p === "/api/state") {
      const r = await estadoDe(env, url);
      return r.estado ? json(r.estado) : json({ error: r.error }, r.status);
    }

    if (p === "/api/qr") {
      const r = await estadoDe(env, url);
      if (!r.estado) return json({ error: r.error }, r.status);
      let text = r.estado.phone_url;
      const what = url.searchParams.get("what");
      if (what === "wifi") {
        if (!r.estado.wifi) return json({ error: "no wifi now" }, 404);
        text = wifiQr(r.estado.wifi);
      } else if (what === "remote") {
        return json({ error: "no remote" }, 404);
      }
      return new Response(qrSvg(text), { headers: { "content-type": "image/svg+xml", "cache-control": "no-store" } });
    }

    if (p.startsWith("/tv/homes/")) return foto(env, request, p.slice("/tv/homes/".length));

    if (p === "/g" || p === "/g/") {
      const r = await estadoDe(env, url);
      if (!r.estado) return new Response("not found", { status: r.status === 400 ? 400 : 404 });
      // La llave que entra por la direccion, NO la que la funcion acaba de
      // firmar. Si la pagina usara la fresca, la foto que el huesped de
      // diciembre le tomo al televisor abriria en enero la estadia del
      // huesped de enero — justo lo que esta llave viene a evitar.
      return new Response(guidePage(r.estado, url.searchParams.get("s")), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
