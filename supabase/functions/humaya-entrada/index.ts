// HUMAYA · Método Humaya — /entrada: encontrar tu reserva
//
// El huésped llega acá por el enlace corto del hotel: por correo, por el chat
// de Airbnb, por un QR en la villa o porque recepción se lo dictó.
//
// ── POR QUÉ NO ALCANZA CON EL CORREO ──────────────────────────────
// Se midió el 15 de noviembre de 2026 sobre las 62 reservas reales:
//
//   21 traen un correo propio, que el huésped reconocería
//   27 traen un ALIAS de la OTA (skorth.878218@guest.booking.com). Reenvía,
//      pero el huésped no lo conoce y jamás lo escribiría
//   14 no traen correo del todo (Airbnb manda la cadena "N/A")
//   62 traen el CÓDIGO DE CONFIRMACIÓN de la OTA
//
// Pedir solo el correo dejaba afuera a 41 de 62. El código lo tienen todos:
// Airbnb se lo muestra como HMMS93AC2K, Expedia como 2603163669.
//
// ── POR QUÉ TAMBIÉN SE PIDE EL APELLIDO ───────────────────────────
// Un código solo sería una contraseña de un solo factor para ver el nombre y
// las fechas de otra persona. Con apellido + código hay que saber dos cosas
// de la misma reserva. No es un banco, pero tampoco se regala.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * El uuid del hotel a partir de su codigo, o null.
 *
 * Igual que en `humaya-admin`: por el esquema PUBLIC, donde `cta_negocios`
 * existe como vista. Pedirlo por `crm_tony_alvarado` devuelve vacio sin dar
 * error, que se lee como "ese hotel no existe".
 */
async function negocioDe(db: SupabaseClient, codigo: string): Promise<string | null> {
  const limpio = codigo.trim().toLowerCase().slice(0, 40);
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(limpio)) return null;

  const { data, error } = await db
    .from("cta_negocios")
    .select("id")
    .eq("codigo", limpio)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    console.error("negocio_lookup_failed", limpio, error.message);
    return null;
  }
  return (data as { id?: string } | null)?.id ?? null;
}

const INBOX_POR_DEFECTO = "reservations@stayhumaya.com";

/** ⚠️ NO usar hola@stayhumaya.com: es un buzón que nunca se creó. Ya pasó en
 *  la función `book` el 31 de octubre: cada «responder» caía al vacío. */
const REMITENTE = "HUMAYA <reservations@stayhumaya.com>";

// Era una lista escrita a mano y le faltaban los dominios del producto
// (hotelexp y guestexp.liderax10.com) y staff.stayhumaya.com. El mismo
// descuido que ya habia costado dos veces en `humaya-admin`: desde fuera la
// funcion contesta 200 y el navegador igual bloquea la respuesta.
const ALLOWED_RE =
  /^https:\/\/([a-z0-9-]+\.)?stayhumaya\.com$|^https:\/\/([a-z0-9-]+\.)?liderax10\.com$|^http:\/\/(localhost|127\.0\.0\.1):(5173|4321)$/;
const DEFAULT_ORIGIN = "https://experience.stayhumaya.com";

function cors(origin: string | null) {
  const ok = !!origin && ALLOWED_RE.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin! : DEFAULT_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const CANCELADAS = new Set(["canceled", "cancelled", "no_show", "noshow", "deleted"]);

/** Sin tildes, sin mayúsculas, sin espacios de más: «Muñoz» y «munoz» son la
 *  misma persona escribiendo con otro teclado. */
function plano(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/\s+/g, " ").trim();
}

/** Los códigos se dictan por teléfono y se copian con espacios de más.
 *  «hmms 93ac2k» y «HMMS93AC2K» son el mismo código. */
const soloCodigo = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, "");

function esc(v: string) {
  return v.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function avisoHtml(buscado: string, apellido: string) {
  return `<!doctype html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#0A0A0A;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111110;border:1px solid rgba(200,173,133,.24);">
<tr><td style="padding:32px 36px;">
  <div style="font-size:20px;letter-spacing:.3em;color:#C8AD85;">HUMAYA</div>
  <p style="color:#F4F1EA;font-size:15px;line-height:1.7;">
    Alguien intentó entrar a su reserva y <b>no la encontramos</b>.</p>
  <p style="color:rgba(244,241,234,.75);font-size:14px;line-height:1.8;">
    Buscó: <b>${esc(buscado)}</b><br>Apellido: <b>${esc(apellido)}</b></p>
  <p style="color:rgba(244,241,234,.55);font-size:13px;line-height:1.7;">
    Puede ser un código mal copiado, o una reserva que todavía no sincronizó.
    Vale la pena buscarla en Cloudbeds y escribirle.</p>
</td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };

  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: "bad_json" }), { status: 400, headers }); }

  const buscado = String(body.codigo ?? body.email ?? "").trim().slice(0, 254);
  const apellido = plano(String(body.apellido ?? "").slice(0, 80));
  const hotel = String(body.hotel ?? "").trim().slice(0, 40);

  if (!buscado) {
    return new Response(JSON.stringify({ error: "falta_codigo" }), { status: 400, headers });
  }
  if (apellido.length < 2) {
    return new Response(JSON.stringify({ error: "falta_apellido" }), { status: 400, headers });
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // ── Límite por IP ────────────────────────────────────────────
  // Con código + apellido, probar a ciegas es caro; igual se pone techo.
  const ip = (request.headers.get("cf-connecting-ip") ??
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0]).trim() || null;
  if (ip) {
    const desde = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await db.from("humaya_entrada_intentos")
      .select("id", { count: "exact", head: true }).eq("ip", ip).gte("creado_en", desde);
    if ((count ?? 0) >= 12) {
      return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers });
    }
  }

  // ── La búsqueda: código de la OTA, número de Cloudbeds, o correo ────────
  const codigo = soloCodigo(buscado);
  const esCorreo = EMAIL_RE.test(buscado);

  // ── De que hotel se esta preguntando ──────────────────────────
  // Sin esto la busqueda recorria las reservas de TODOS los hoteles: un
  // codigo de HUMAYA entraba desde el /entrada de otro hotel y devolvia el
  // nombre y las fechas de ese huesped. Apellido + codigo identifican una
  // reserva, pero no dicen de que hotel es.
  const negocio = await negocioDe(db, hotel);
  if (!negocio) {
    return new Response(JSON.stringify({ error: "falta_hotel" }), { status: 400, headers });
  }

  let consulta = db.from("humaya_cloudbeds_reservas")
    .select("guest_name, email, checkin, checkout, estado, fuente, confirmacion_ota, cloudbeds_reservation_id, negocio_id")
    .eq("negocio_id", negocio)
    .is("eliminada_en", null);

  consulta = esCorreo
    ? consulta.eq("email", buscado.toLowerCase())
    : consulta.or(`confirmacion_ota.eq.${codigo},cloudbeds_reservation_id.eq.${codigo}`);

  const { data: filas, error } = await consulta.order("checkin", { ascending: false }).limit(10);
  if (error) {
    console.error("lookup_failed", error.message);
    return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
  }

  // Vivas primero, y el apellido tiene que calzar con el nombre del huésped.
  const candidatas = (filas ?? []).filter(
    (r) => !r.estado || !CANCELADAS.has(String(r.estado).toLowerCase()),
  );
  const encontrada = candidatas.find((r) => plano(String(r.guest_name ?? "")).includes(apellido));

  // El intento queda anotado CON su hotel. El techo por IP de arriba, en
  // cambio, se cuenta entre todos a proposito: quien prueba a ciegas contra
  // varios hoteles sigue siendo el mismo que prueba a ciegas.
  await db.from("humaya_entrada_intentos").insert({
    negocio_id: negocio,
    email: esCorreo ? buscado.toLowerCase() : `codigo:${codigo}`,
    encontrada: Boolean(encontrada),
    ip,
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 300),
  });

  if (encontrada) {
    return new Response(JSON.stringify({
      found: true,
      guestName: encontrada.guest_name,
      checkin: encontrada.checkin,
      checkout: encontrada.checkout,
      fuente: encontrada.fuente,
      // Para que el formulario sepa a qué reserva pegarle lo que se llene.
      reserva: encontrada.cloudbeds_reservation_id,
      // Si no tenemos correo suyo, el formulario se lo va a pedir: es el
      // unico momento del viaje en que el huesped esta dispuesto a darlo.
      pedir_correo: !encontrada.email ||
        /@(m\.expediapartnercentral\.com|guest\.booking\.com)$/i.test(String(encontrada.email)),
    }), { headers });
  }

  // ── No encontrada: se avisa, pero no en cada reintento ──────────────────
  const desde = new Date(Date.now() - 3_600_000).toISOString();
  const { count: avisos } = await db.from("humaya_entrada_intentos")
    .select("id", { count: "exact", head: true })
    .eq("email", esCorreo ? buscado.toLowerCase() : `codigo:${codigo}`)
    .eq("encontrada", false).gte("creado_en", desde);

  if ((avisos ?? 0) <= 1) {
    const key = Deno.env.get("RESEND_API_KEY");
    const inbox = Deno.env.get("BOOKING_INBOX") ?? INBOX_POR_DEFECTO;
    if (key) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: REMITENTE, to: [inbox],
          subject: `Entrada: no encontramos la reserva — ${buscado}`,
          html: avisoHtml(buscado, String(body.apellido ?? "")),
        }),
      }).catch((e) => console.error("resend", (e as Error).message));
    } else {
      console.warn("RESEND_API_KEY sin configurar: no se avisó al equipo", buscado);
    }
  }

  return new Response(JSON.stringify({ found: false, hotel }), { headers });
});
