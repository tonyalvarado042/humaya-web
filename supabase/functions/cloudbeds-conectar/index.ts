// HUMAYA · Método Humaya — conectar un hotel con SU Cloudbeds
//
// Un solo trabajo: dejar un hotel funcionando contra Cloudbeds. Probar que la
// llave sirve, registrar los webhooks y traer las reservas que ya existen.
// Las tres cosas juntas, porque para quien las usa son una sola:
//
//   Tony, 26 de noviembre de 2026: «¿Por qué dices que tienes que hacer unos
//   botones de suscribir o importar? Porque se supone que al pegar la llave
//   automáticamente se tiene que hacer eso, ¿o me equivoco?»
//
// No se equivocaba. Antes esto eran tres acciones sueltas que no llamaba
// ninguna pantalla, y las 68 reservas de HUMAYA entraron porque alguien las
// invocó a mano. Desde hoy las llama la pantalla, al guardar la llave.
//
// ── CADA HOTEL CON SU LLAVE, SIN RESPALDO ──────────────────────────────
// Antes, si un hotel no tenía llave propia, esta función caía en una llave
// general `CLOUDBEDS_API_KEY`. Con un hotel era comodidad. Con dos es un
// hotel preguntándole a Cloudbeds con las credenciales de otro, callado.
//
//   Tony, 26 de noviembre de 2026: «cada hotel es una propiedad totalmente
//   independiente (…) no puede revolverse una con otra en absolutamente
//   nada».
//
// Así que la llave general ya no se lee. Si falta la del hotel, se dice.
//
// Y se comprueba una cosa más, que antes no se comprobaba: que la llave sea
// DE ESTE hotel. `getHotels` devuelve las propiedades que esa llave alcanza;
// si la propiedad pedida no está entre ellas, se rechaza. Pegar la llave de
// HUMAYA en Bike & Bed tiene que rebotar, no "funcionar" a medias.
//
// ── LA PUERTA ──────────────────────────────────────────────────────────
// La sesión de quien está en recepción, y además `humaya_soy_plataforma()`:
// la misma condición que la pantalla. Antes la puerta era un secreto de
// servidor (`x-humaya-key`) que el navegador no puede tener — por eso no la
// llamaba nadie.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const API = "https://hotels.cloudbeds.com/api";
const ENDPOINT_WEBHOOK =
  "https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1/cloudbeds-webhook";
const CABECERA_WEBHOOK = "X-Humaya-Key";

/** Los eventos que nos importan y por qué.
 *  No se suscriben los accommodation_*: hoy no guardamos la villa asignada,
 *  así que solo traerían ruido. Cuando «Mi villa» sea real, se agregan. */
const EVENTOS = [
  { action: "created", porque: "una reserva nueva" },
  { action: "status_changed", porque: "cancelada, no-show, check-in, check-out" },
  { action: "dates_changed", porque: "cambió las fechas: mueve cuándo se le escribe" },
  { action: "deleted", porque: "la borraron del todo" },
];

/** Cuántas reservas se piden por página, y hasta dónde se insiste.
 *  Antes se pedía UNA página de 100 y se devolvía «listo». Un hotel con 140
 *  reservas importaba 100 y nadie se enteraba de las otras 40. */
const POR_PAGINA = 100;
const PAGINAS_MAX = 25;
/** De a cuántas se piden los detalles a la vez. Una por una, 100 reservas son
 *  100 viajes en fila; de a ocho, son trece. */
const EN_PARALELO = 8;
/** Cuándo parar aunque falte. Es mejor devolver «traje 300, hay más» que que
 *  la función se muera sin decir nada. */
const MS_MAX = 45_000;

const ALLOWED_RE =
  /^https:\/\/([a-z0-9-]+\.)?stayhumaya\.com$|^https:\/\/([a-z0-9-]+\.)?liderax10\.com$|^https:\/\/metodo-humaya-preview(-[a-z0-9-]+)?\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1):5173$/;
const DEFAULT_ORIGIN = "https://stayhumaya.com";

function cors(origin: string | null) {
  const permitido = !!origin && ALLOWED_RE.test(origin);
  return {
    "Access-Control-Allow-Origin": permitido ? origin! : DEFAULT_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

type Db = SupabaseClient;

async function leerSecreto(db: Db, nombre: string): Promise<string | null> {
  const { data, error } = await db.rpc("cta_leer_secreto", { p_nombre: nombre });
  if (error) {
    console.error("no se pudo leer el secreto", nombre, error.message);
    return null;
  }
  const v = (data as string | null) ?? null;
  return v && v.trim() ? v.trim() : null;
}

/**
 * La llave de ESTE hotel. Sin respaldo a ninguna llave general, a propósito:
 * ver la cabecera del archivo.
 */
function llaveDe(db: Db, propertyId: string): Promise<string | null> {
  return leerSecreto(db, `CLOUDBEDS_API_KEY_${propertyId}`);
}

/** Quién llama: devuelve su uid solo si es cuenta de plataforma. */
async function quienEsPlataforma(db: Db, request: Request): Promise<string | null> {
  const encabezado = request.headers.get("authorization") ?? "";
  const token = encabezado.toLowerCase().startsWith("bearer ") ? encabezado.slice(7).trim() : "";
  if (!token) return null;

  const { data: auth, error } = await db.auth.getUser(token);
  if (error || !auth?.user) return null;

  const { data } = await db
    .from("cta_usuarios")
    .select("activo,es_plataforma")
    .eq("id", auth.user.id)
    .maybeSingle();

  const fila = data as { activo?: boolean | null; es_plataforma?: boolean | null } | null;
  if (!fila || fila.activo === false || fila.es_plataforma !== true) return null;
  return auth.user.id;
}

/** Igual que en cloudbeds-webhook: "N/A" NO es un correo. */
function extraer(body: Record<string, unknown>) {
  const d = (Array.isArray(body?.data)
    ? (body.data[0] as Record<string, unknown> | undefined)
    : (body?.data as Record<string, unknown> | undefined)) ?? body;
  const crudo = String(d?.guestEmail ?? d?.email ?? "").trim().toLowerCase();
  return {
    email: crudo && crudo !== "n/a" && crudo.includes("@") ? crudo : null,
    guestName: (d?.guestName as string) ?? null,
    checkin: (d?.startDate as string) ?? null,
    checkout: (d?.endDate as string) ?? null,
    estado: (d?.status as string) ?? null,
    fuente: (d?.sourceName as string) ?? (d?.source as string) ?? null,
    confirmacion: (d?.thirdPartyIdentifier as string) ?? null,
  };
}

interface Hotel {
  property_id: string;
  nombre: string;
}

/** Qué propiedades alcanza esta llave, según Cloudbeds. */
async function hotelesDeLaLlave(
  auth: Record<string, string>,
): Promise<{ ok: boolean; mensaje: string; hoteles: Hotel[] }> {
  const r = await fetch(`${API}/v1.2/getHotels`, { headers: auth });
  const b = await r.json().catch(() => null);
  const hoteles: Hotel[] = Array.isArray(b?.data)
    ? b.data.map((h: Record<string, unknown>) => ({
        property_id: String(h.propertyID),
        nombre: String(h.propertyName ?? ""),
      }))
    : [];
  return {
    ok: r.ok && b?.success === true,
    mensaje: b?.success === true
      ? `Cloudbeds contestó bien. ${hoteles.length} propiedad(es).`
      : String(b?.message ?? `Cloudbeds no aceptó la llave (HTTP ${r.status}).`),
    hoteles,
  };
}

/** Registra los webhooks y después pregunta cuáles quedaron de verdad. */
async function suscribir(auth: Record<string, string>, propertyId: string, secreto: string) {
  for (const e of EVENTOS) {
    // Cloudbeds exige formulario, no JSON. Esta es la razón de que esta
    // función exista y no se haga todo desde SQL: pg_net solo manda JSON, y
    // Cloudbeds contesta «Parameter endpointUrl is required».
    const form = new URLSearchParams({
      endpointUrl: ENDPOINT_WEBHOOK,
      object: "reservation",
      action: e.action,
      authHeaderName: CABECERA_WEBHOOK,
      authHeaderValue: secreto,
    });
    await fetch(`${API}/v1.3/postWebhook?propertyID=${propertyId}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }).catch((e) => console.error("postWebhook", (e as Error).message));
  }

  // El veredicto NO sale de lo que contestó cada alta: sale de lo que
  // Cloudbeds dice que hay AHORA. Volver a suscribir algo ya suscrito
  // contesta error, y eso no es un fallo — es que ya estaba.
  const rl = await fetch(`${API}/v1.3/getWebhooks?propertyID=${propertyId}`, { headers: auth });
  const bl = await rl.json().catch(() => null);
  const registrados: string[] = Array.isArray(bl?.data)
    ? bl.data.map((w: Record<string, unknown>) => {
        const ev = w.event as Record<string, unknown> | undefined;
        return `${ev?.entity}/${ev?.action}`;
      })
    : [];

  const faltan = EVENTOS.map((e) => `reservation/${e.action}`).filter(
    (q) => !registrados.includes(q),
  );
  return { ok: faltan.length === 0, registrados, faltan };
}

/** Trae las reservas que ya existen, TODAS las páginas. */
async function importar(
  db: Db,
  auth: Record<string, string>,
  propertyId: string,
  negocioId: string | null,
  desde: number,
) {
  let encontradas = 0, guardadas = 0, sinCorreo = 0, fallaron = 0, paginas = 0;
  let hayMas = false;

  for (let pagina = 1; pagina <= PAGINAS_MAX; pagina++) {
    if (Date.now() - desde > MS_MAX) { hayMas = true; break; }

    const lista = await fetch(
      `${API}/v1.2/getReservations?propertyID=${propertyId}` +
        `&pageNumber=${pagina}&pageSize=${POR_PAGINA}`,
      { headers: auth },
    );
    const lb = await lista.json().catch(() => null);
    const reservas: Record<string, unknown>[] = Array.isArray(lb?.data) ? lb.data : [];
    paginas = pagina;
    encontradas += reservas.length;
    if (reservas.length === 0) break;

    for (let i = 0; i < reservas.length; i += EN_PARALELO) {
      if (Date.now() - desde > MS_MAX) { hayMas = true; break; }

      const tanda = reservas.slice(i, i + EN_PARALELO);
      const filas = await Promise.all(tanda.map(async (res) => {
        const rid = String(res.reservationID ?? "");
        if (!rid) return null;
        try {
          const d = await fetch(
            `${API}/v1.2/getReservation?propertyID=${propertyId}` +
              `&reservationID=${encodeURIComponent(rid)}`,
            { headers: auth },
          );
          const cuerpo = await d.json().catch(() => null);
          if (!d.ok || !cuerpo) return null;
          const r = extraer(cuerpo);
          if (!r.email) sinCorreo++;
          return {
            cloudbeds_reservation_id: rid,
            property_id: propertyId,
            negocio_id: negocioId,
            email: r.email,
            guest_name: r.guestName,
            checkin: r.checkin,
            checkout: r.checkout,
            estado: r.estado,
            fuente: r.fuente,
            confirmacion_ota: r.confirmacion,
            crudo: cuerpo,
            actualizado_en: new Date().toISOString(),
          };
        } catch (e) {
          console.error("getReservation", rid, (e as Error).message);
          return null;
        }
      }));

      const buenas = filas.filter((f) => f !== null);
      fallaron += tanda.length - buenas.length;
      if (buenas.length === 0) continue;

      const { error } = await db
        .from("humaya_cloudbeds_reservas")
        .upsert(buenas, { onConflict: "cloudbeds_reservation_id" });
      if (error) {
        console.error("upsert", error.message);
        fallaron += buenas.length;
      } else {
        guardadas += buenas.length;
      }
    }

    if (hayMas) break;
    // Página incompleta = era la última.
    if (reservas.length < POR_PAGINA) break;
    if (pagina === PAGINAS_MAX) hayMas = true;
  }

  return { encontradas, guardadas, sin_correo: sinCorreo, fallaron, paginas, hay_mas: hayMas };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };
  const desde = Date.now();

  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers });
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  if (!(await quienEsPlataforma(db, request))) {
    return new Response(JSON.stringify({ error: "solo_plataforma" }), { status: 401, headers });
  }

  let cuerpo: Record<string, unknown> = {};
  try { cuerpo = await request.json(); } catch { /* sin cuerpo está bien */ }

  const propertyId = String(cuerpo.property_id ?? "").trim();
  if (!/^[0-9]{6,24}$/.test(propertyId)) {
    return new Response(JSON.stringify({ error: "property_id_invalido" }), { status: 400, headers });
  }

  // De qué hotel es. Si la propiedad no está registrada, no hay dónde colgar
  // las reservas: se para acá en vez de guardarlas huérfanas.
  const { data: prop } = await db
    .from("humaya_propiedades").select("negocio_id").eq("property_id", propertyId).maybeSingle();
  const negocioId = (prop?.negocio_id as string | undefined) ?? null;
  if (!negocioId) {
    return new Response(
      JSON.stringify({ error: "propiedad_no_registrada", property_id: propertyId }),
      { status: 400, headers },
    );
  }

  const apiKey = await llaveDe(db, propertyId);
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "sin_llave", property_id: propertyId }),
      { status: 400, headers },
    );
  }
  const auth = { Authorization: `Bearer ${apiKey}` };

  // ── 1. ¿La llave sirve, y es de ESTE hotel? ──────────────────
  const prueba = await hotelesDeLaLlave(auth);
  if (!prueba.ok) {
    return new Response(
      JSON.stringify({ error: "llave_rechazada", detalle: prueba.mensaje }),
      { status: 400, headers },
    );
  }
  if (!prueba.hoteles.some((h) => h.property_id === propertyId)) {
    return new Response(
      JSON.stringify({
        error: "llave_de_otro_hotel",
        property_id: propertyId,
        alcanza: prueba.hoteles,
      }),
      { status: 400, headers },
    );
  }

  // ── 2. Los webhooks, para que las próximas lleguen solas ─────
  const secreto = await leerSecreto(db, "CLOUDBEDS_WEBHOOK_SECRET");
  const webhooks = secreto
    ? await suscribir(auth, propertyId, secreto)
    : { ok: false, registrados: [] as string[], faltan: ["(falta CLOUDBEDS_WEBHOOK_SECRET)"] };

  // ── 3. Las que ya existen ────────────────────────────────────
  const reservas = await importar(db, auth, propertyId, negocioId, desde);

  return new Response(
    JSON.stringify({
      ok: webhooks.ok && reservas.fallaron === 0,
      property_id: propertyId,
      llave: { ok: true, alcanza: prueba.hoteles },
      webhooks,
      reservas,
    }),
    { status: 200, headers },
  );
});
