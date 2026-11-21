// HUMAYA · La pantalla del TV de cada villa
//
// GET ?villa=<id>&clave=<clave>  -> el estado que pinta el televisor
//
// ── POR QUE EXISTE ESTA FUNCION ───────────────────────────────────
// El televisor no tiene cuenta: pide su estado sin credenciales. Las tablas
// `humaya_tv_*` estan detras de RLS y un anonimo no saca ni una fila, asi que
// hace falta algo en el medio. La alternativa era meter la llave de servicio
// de Supabase dentro del Worker de Cloudflare — un secreto mas, en otro
// proveedor, para que lo lea un aparato colgado en una pared.
//
// Lo que NO pasa por aca es la administracion. Recepcion escribe directo en
// la tabla con la llave publicable y quien decide es RLS, igual que
// `editarServicio`. Una funcion en el medio solo agregaria un lugar donde
// equivocarse.
//
// ── POR QUE SE PIDE UNA CLAVE ─────────────────────────────────────
// Esta respuesta trae el NOMBRE DEL HUESPED y sus fechas. Sin clave,
// cualquiera que adivine `?villa=v4-bruma` sabria quien esta alojado esta
// noche en esa villa. La clave se escribe una sola vez en el televisor,
// dentro de la direccion, y no la ve ningun huesped.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

// Sin uuid escrito a mano. Hasta el 21 de noviembre de 2026 habia uno, el de
// HUMAYA, y con el el televisor de CUALQUIER hotel leia la guia de la casa,
// las reglas, los telefonos de emergencia y el huso horario de HUMAYA. El
// hotel demo ya tenia dos pantallas y una guia propia de una sola clave: la
// de HUMAYA tiene seis, y eran esas seis las que habria mostrado.
//
// De que hotel es se saca de la VILLA, que es lo unico que el televisor
// manda. `humaya_tv_villas` tiene el id como clave primaria, asi que una
// villa pertenece a un solo hotel y no hay ambiguedad.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
const headers = { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers });

interface Villa {
  id: string;
  negocio_id: string;
  clave: string;
  nombre: string;
  tipo: string | null;
  anfitrion: string | null;
  wifi_ssid: string | null;
  wifi_clave: string | null;
  wifi_siempre: boolean;
  huesped: string | null;
  llegada: string | null;
  salida: string | null;
  checkin: string;
  checkout: string;
  bienvenida: string | null;
  nota_titulo: string | null;
  nota_texto: string | null;
  foto: string | null;
  reloj_posicion: string;
  guia: Record<string, unknown>;
  habilitada: boolean;
}

interface Ajustes {
  guia: Record<string, unknown>;
  utc_offset: number;
  // El clima es de cada hotel y ya vivia en la tabla; lo que faltaba era
  // devolverlo. El Worker lo tenia escrito a mano en La Fortuna, asi que un
  // hotel en otra parte habria mostrado el clima de aca.
  clima_lugar: string | null;
  clima_lat: number | string | null;
  clima_lon: number | string | null;
  clima_tz: string | null;
  // El Wi-Fi y la foto son del HOTEL. Estaban por villa, repetidos diez
  // veces identicos, y cambiar la clave eran diez ediciones. Tony, 21 de
  // noviembre de 2026: «la wifi y la foto deben ser para todo, no por villa».
  wifi_ssid: string | null;
  wifi_clave: string | null;
  wifi_siempre: boolean | null;
  foto: string | null;
}

/**
 * Comparar claves sin filtrar cuanto acerto quien prueba.
 *
 * Un `===` corta en la primera letra distinta, y esa diferencia de tiempo —
 * aunque sea de microsegundos — le dice al que prueba que va bien. Acá se
 * recorren siempre todos los caracteres.
 */
function mismaClave(dada: string, guardada: string): boolean {
  if (dada.length !== guardada.length) return false;
  let diff = 0;
  for (let i = 0; i < guardada.length; i += 1) {
    diff |= dada.charCodeAt(i) ^ guardada.charCodeAt(i);
  }
  return diff === 0;
}

// ── El momento de la estadia ───────────────────────────────────────
// Portado tal cual del Worker, que a su vez lo trajo de guest-tv. La cuenta
// se hace en el dia del hotel, no en UTC: alguien que entra a las 11 de la
// noche ya esta en su noche 1.

const minutos = (hhmm: string | null) => {
  const [h, m] = String(hhmm ?? "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const sumarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const diasEntre = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);

function ahoraLocal(offsetHoras: number) {
  const d = new Date(Date.now() + offsetHoras * 3600e3);
  return { dia: d.toISOString().slice(0, 10), minutos: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

function instante(dia: string, hhmm: string, off: number) {
  const signo = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  const hh = String(Math.floor(a)).padStart(2, "0");
  const mm = String(Math.round((a % 1) * 60)).padStart(2, "0");
  return `${dia}T${hhmm || "00:00"}:00${signo}${hh}:${mm}`;
}

function estadiaDe(villa: Villa, off: number, faseForzada: string | null) {
  const fecha = /^\d{4}-\d{2}-\d{2}$/;
  const desde = villa.llegada ?? "";
  const hasta = villa.salida ?? "";
  if (!(fecha.test(desde) && fecha.test(hasta))) {
    return { phase: "between", guest: "", guests: 0, active: false };
  }

  const { dia: hoy, minutos: ahora } = ahoraLocal(off);
  const entra = minutos(villa.checkin);
  const sale = minutos(villa.checkout);
  const antesDeSalir = hoy < hasta || (hoy === hasta && ahora < sale);

  if (!(sumarDias(desde, -1) <= hoy && antesDeSalir)) {
    return { phase: "between", guest: "", guests: 0, active: false };
  }

  const noches = Math.max(1, diasEntre(desde, hasta));
  const noche = Math.min(noches, Math.max(1, diasEntre(desde, hoy) + 1));
  const antesDeEntrar = hoy < desde || (hoy === desde && ahora < entra);

  let fase = antesDeEntrar && hoy === desde
    ? "arrival"
    : antesDeEntrar
      ? "before"
      : hoy === hasta
        ? "lastday"
        : "during";
  if (faseForzada && ["arrival", "during", "lastday"].includes(faseForzada)) fase = faseForzada;

  return {
    phase: fase,
    guest: villa.huesped ?? "",
    guests: 0,
    active: ["arrival", "during", "lastday"].includes(fase),
    from: desde,
    to: hasta,
    checkin: instante(desde, villa.checkin, off),
    checkout: instante(hasta, villa.checkout, off),
    nights: noches,
    night: fase === "lastday" ? noches : noche,
  };
}

/** La guía de la villa si tiene una propia; si no, la del hotel. */
function guiaDe(villa: Villa, ajustes: Ajustes): Record<string, unknown> {
  const propia = villa.guia ?? {};
  return Object.keys(propia).length > 0 ? propia : (ajustes.guia ?? {});
}

/**
 * El reloj se corre según la foto: si la foto trae el logo en el centro, el
 * reloj va a un lado para no taparlo. `clockX` es el porcentaje de corrimiento
 * que entiende tv.js.
 */
const CORRIMIENTO: Record<string, number> = { centro: 0, izquierda: -34, derecha: 34 };

async function estado(db: SupabaseClient, villa: Villa, faseForzada: string | null) {
  const { data } = await db
    .from("humaya_tv_ajustes")
    .select(
      "guia,utc_offset,clima_lugar,clima_lat,clima_lon,clima_tz,wifi_ssid,wifi_clave,wifi_siempre,foto",
    )
    .eq("negocio_id", villa.negocio_id)
    .maybeSingle();
  const ajustes = (data ?? {
    guia: {},
    utc_offset: -6,
    clima_lugar: null,
    clima_lat: null,
    clima_lon: null,
    clima_tz: null,
    wifi_ssid: null,
    wifi_clave: null,
    wifi_siempre: true,
    foto: null,
  }) as Ajustes;

  // Quien esta en la villa sale de las RESERVAS, no de lo que alguien haya
  // escrito a mano. Tony, 21 de noviembre de 2026: «todo debe ser
  // automatizado, tu tienes las reservas, por que me pides agregar nombre de
  // huesped?». La vista `humaya_tv_ocupacion` casa el cuarto de Cloudbeds
  // —«V1 - CAPI CAPI »— con la pantalla —«V1 · CAPI CAPI»— y parte por comas
  // las reservas que ocupan varias villas.
  //
  // Lo escrito a mano queda como respaldo, para una entrada que todavia no
  // esta en Cloudbeds. Si hay reserva, manda la reserva.
  const { data: ocupa } = await db
    .from("humaya_tv_ocupacion")
    .select("huesped,llegada,salida")
    .eq("villa_id", villa.id)
    .maybeSingle();
  const reserva = ocupa as
    | { huesped: string | null; llegada: string | null; salida: string | null }
    | null;
  const quienEsta: Villa = reserva?.huesped
    ? { ...villa, huesped: reserva.huesped, llegada: reserva.llegada, salida: reserva.salida }
    : villa;

  const st = estadiaDe(quienEsta, Number(ajustes.utc_offset ?? -6), faseForzada);
  // En un hotel el Wi-Fi queda en pantalla también entre huéspedes: quien
  // entra a limpiar o a revisar la villa también lo necesita.
  // El Wi-Fi y la foto salen del hotel; si la villa tiene los suyos, ganan.
  // Mismo patron que la guia, ver `guiaDe`. La clave y el «mostrarlo siempre»
  // siguen al SSID: si la villa tiene su propia red, son los de esa red.
  const ssid = villa.wifi_ssid ?? ajustes.wifi_ssid;
  const claveWifi = villa.wifi_ssid ? villa.wifi_clave : ajustes.wifi_clave;
  const siempre = villa.wifi_ssid ? villa.wifi_siempre : ajustes.wifi_siempre;
  const foto = villa.foto ?? ajustes.foto ?? "";

  const mostrar = st.active || siempre !== false;
  const g = guiaDe(villa, ajustes) as Record<string, unknown>;

  // Las hermanas, para el menu que ofrece el televisor. Sin el filtro, el TV
  // de un hotel listaba las villas de los otros por su nombre.
  const { data: otras } = await db
    .from("humaya_tv_villas")
    .select("id,nombre")
    .eq("negocio_id", villa.negocio_id)
    .eq("habilitada", true)
    .order("orden", { ascending: true });

  const notas = villa.nota_titulo || villa.nota_texto
    ? [{ title: villa.nota_titulo ?? "", body: villa.nota_texto ?? "" }]
    : [];

  return {
    id: villa.id,
    mode: "stay",
    demo: false,
    name: villa.nombre,
    kind: villa.tipo ?? "",
    host: villa.anfitrion ?? "",
    // Solo el nombre: el Worker lo convierte en /tv/homes/<nombre>.jpg y, si
    // la villa no tiene foto propia, usa la que viene dentro del Worker.
    // La version desenfocada para el reloj se deriva pegandole "-glass".
    photos: { hero: foto, inside: foto, area: foto },
    scene: { clockTop: 13, clockSize: 14, clockX: CORRIMIENTO[villa.reloj_posicion] ?? -34, fg: false },
    stay: st,
    checkin: quienEsta.checkin,
    checkout_time: quienEsta.checkout,
    // De donde salio quien aparece en pantalla, para que Admin lo diga.
    ocupacion: reserva?.huesped ? "reserva" : villa.huesped ? "a_mano" : "vacia",
    wifi: mostrar && ssid ? { ssid, password: claveWifi ?? "" } : null,
    access: [],
    welcome: villa.bienvenida || (g.welcome ?? ""),
    rules: g.rules ?? [],
    howto: g.howto ?? [],
    local: g.local ?? [],
    checkout: g.checkout ?? {},
    emergency: g.emergency ?? [],
    notes: notas,
    remote_url: null,
    homes: (otras ?? []).map((o: { id: string; nombre: string }) => ({ id: o.id, name: o.nombre })),
    // De donde es el clima que pinta el Worker. Null = que use el suyo.
    clima: ajustes.clima_lugar
      ? {
        place: ajustes.clima_lugar,
        lat: Number(ajustes.clima_lat),
        lon: Number(ajustes.clima_lon),
        tz: ajustes.clima_tz,
      }
      : null,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(request.url);
  const id = (url.searchParams.get("villa") ?? "").trim().slice(0, 40);
  const clave = (url.searchParams.get("clave") ?? "").trim().slice(0, 64);
  if (!id || !clave) return json({ error: "falta_villa_o_clave" }, 400);

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await db
    .from("humaya_tv_villas")
    .select("*")
    .eq("id", id)
    .eq("habilitada", true)
    .maybeSingle();

  if (error) {
    console.error("tv_lookup_failed", error.message);
    return json({ error: "db_error" }, 500);
  }

  // Misma respuesta para "no existe" y "clave mala": si fueran distintas, se
  // podría averiguar qué villas existen probando ids.
  const villa = data as Villa | null;
  if (!villa || !mismaClave(clave, villa.clave)) return json({ error: "no_autorizado" }, 401);

  return json(await estado(db, villa, url.searchParams.get("phase")));
});
