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

const NEGOCIO = "4cb80ad6-1004-4d06-9dfb-946a1718be87";

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
    .select("guia,utc_offset")
    .eq("negocio_id", NEGOCIO)
    .maybeSingle();
  const ajustes = (data ?? { guia: {}, utc_offset: -6 }) as Ajustes;

  const st = estadiaDe(villa, Number(ajustes.utc_offset ?? -6), faseForzada);
  // En un hotel el Wi-Fi queda en pantalla también entre huéspedes: quien
  // entra a limpiar o a revisar la villa también lo necesita.
  const mostrar = st.active || villa.wifi_siempre !== false;
  const g = guiaDe(villa, ajustes) as Record<string, unknown>;

  const { data: otras } = await db
    .from("humaya_tv_villas")
    .select("id,nombre")
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
    photos: { hero: villa.foto ?? "", inside: villa.foto ?? "", area: villa.foto ?? "" },
    scene: { clockTop: 13, clockSize: 14, clockX: CORRIMIENTO[villa.reloj_posicion] ?? -34, fg: false },
    stay: st,
    checkin: villa.checkin,
    checkout_time: villa.checkout,
    wifi: mostrar && villa.wifi_ssid
      ? { ssid: villa.wifi_ssid, password: villa.wifi_clave ?? "" }
      : null,
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
