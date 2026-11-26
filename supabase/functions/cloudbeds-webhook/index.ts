// HUMAYA · Método Humaya — receptor de los webhooks de Cloudbeds
//
// Cloudbeds avisa acá cada vez que pasa algo con una reserva. El payload viene
// "pelado" —apenas el ID y poco más—, así que para cada aviso le volvemos a
// preguntar a Cloudbeds el estado completo de esa reserva y lo guardamos.
//
// ── POR QUÉ RE-CONSULTAR EN VEZ DE APLICAR EL CAMBIO ────────────────────
// Sería más "eficiente" leer el campo que cambió y tocar solo ese. Pero los
// eventos llegan desordenados, se repiten, y algunos disparan otros (la propia
// documentación de Cloudbeds avisa que accommodation_type_changed dispara
// después un accommodation_changed, y que eso NO es un error). Aplicando
// cambios parciales, dos eventos cruzados dejan la fila mintiendo. Volviendo a
// preguntar, el peor caso es una consulta de más y la fila siempre dice lo que
// Cloudbeds dice. En un hotel de 10 villas, la consulta de más no se siente.
//
// ── LA PUERTA: CABECERA, NO URL ─────────────────────────────────
// Hasta el 15 de noviembre el secreto iba en la URL como ?key=. Lo cambié
// después de leer su documentación, que es explícita:
//   «Pongan lo sensible en la cabecera, NUNCA en la URL. Cloudbeds trata los
//    valores de cabecera como secretos: getWebhooks nunca los devuelve y no
//    quedan en los logs internos. De las URL no se puede garantizar lo mismo.»
// Al suscribirse con postWebhook se pasan authHeaderName y authHeaderValue, y
// Cloudbeds manda esa cabecera en cada entrega. Se sigue aceptando ?key= para
// no romper nada que ya estuviera registrado, pero la cabecera es el camino.
//
// ── CADA HOTEL CON SU LLAVE, SIN RESPALDO ──────────────────────────────
// Un secreto vive en la base, cifrado, leído solo por el servidor. Hay UNA
// llave por hotel: `CLOUDBEDS_API_KEY_<propertyID>`.
//
// Hasta el 26 de noviembre de 2026 esto caía en una llave general
// `CLOUDBEDS_API_KEY` cuando faltaba la del hotel. Con un hotel era comodidad;
// con dos, era un aviso de Bike & Bed resuelto con las credenciales de HUMAYA,
// en silencio. Tony, ese día: «cada hotel es una propiedad totalmente
// independiente (…) no puede revolverse una con otra en absolutamente nada».
//
// Ahora, sin llave del hotel, el aviso se rechaza con 500 y queda en el log
// con el número de propiedad. Cloudbeds reintenta, así que arreglar la llave
// recupera el aviso; adivinar con la llave de otro no se recupera nunca.
import { createClient } from "npm:@supabase/supabase-js@2";

const CLOUDBEDS_API_BASE = "https://hotels.cloudbeds.com/api/v1.2";

/** Eventos ante los que volvemos a preguntar el estado de la reserva. */
const REFRESCAN = new Set([
  "reservation/created",
  "reservation/status_changed",
  "reservation/dates_changed",
  "reservation/accommodation_changed",
  "reservation/accommodation_type_changed",
]);
const BORRADA = "reservation/deleted";

type Db = ReturnType<typeof createClient>;

async function leerSecreto(db: Db, nombre: string): Promise<string | null> {
  const { data, error } = await db.rpc("cta_leer_secreto", { p_nombre: nombre });
  if (error) {
    console.error("no se pudo leer la llave", nombre, error.message);
    return null;
  }
  const valor = (data as string | null) ?? null;
  return valor && valor.trim() ? valor.trim() : null;
}

/** Comparación en tiempo constante: comparar secretos con === filtra
 *  información por cuánto tarda en fallar. */
function igual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

async function getReservation(reservationId: string, propertyId: string, apiKey: string) {
  const parametros = new URLSearchParams({ reservationID: reservationId, propertyID: propertyId });
  const response = await fetch(`${CLOUDBEDS_API_BASE}/getReservation?${parametros}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body) throw new Error(`getReservation_failed_${response.status}`);
  return body;
}

/**
 * Comprobado contra las reservas reales de Humaya el 15 de noviembre de 2026.
 * El correo viene en `guestEmail` (NO en `email`), y para las de Airbnb viene
 * literalmente la cadena "N/A", que no es un correo y no debe guardarse como
 * tal: si se guardara, /entrada "encontraría" reservas buscando «N/A».
 */
function extraer(body: Record<string, unknown>) {
  const d = (Array.isArray(body?.data)
    ? (body.data[0] as Record<string, unknown> | undefined)
    : (body?.data as Record<string, unknown> | undefined)) ?? body;

  const lista = Array.isArray(d?.guestList) ? (d.guestList as Record<string, unknown>[]) : [];
  const primero = lista[0] ?? {};

  const correoCrudo =
    (d?.guestEmail as string | undefined) ??
    (d?.email as string | undefined) ??
    (primero.email as string | undefined) ??
    "";
  const correo = correoCrudo.trim().toLowerCase();
  const email = correo && correo !== "n/a" && correo.includes("@") ? correo : null;

  const nombre = (d?.guestFirstName as string) ?? (primero.guestFirstName as string) ?? "";
  const apellido = (d?.guestLastName as string) ?? (primero.guestLastName as string) ?? "";

  return {
    email,
    guestName: (d?.guestName as string | undefined) ??
      ([nombre, apellido].filter(Boolean).join(" ") || null),
    checkin: (d?.startDate as string) ?? (d?.checkIn as string) ?? null,
    checkout: (d?.endDate as string) ?? (d?.checkOut as string) ?? null,
    estado: (d?.status as string) ?? (d?.reservationStatus as string) ?? null,
    fuente: (d?.sourceName as string) ?? (d?.source as string) ?? (d?.origin as string) ?? null,
    confirmacion: (d?.thirdPartyIdentifier as string) ?? null,
    propertyId: d?.propertyID ? String(d.propertyID) : null,
  };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // ── La puerta ───────────────────────────────────────────────
  const secret = await leerSecreto(db, "CLOUDBEDS_WEBHOOK_SECRET");
  if (!secret) {
    console.error("cloudbeds_webhook_secret_sin_poner");
    return new Response(
      JSON.stringify({ error: "not_configured", detalle: "Falta CLOUDBEDS_WEBHOOK_SECRET." }),
      { status: 500 },
    );
  }
  const url = new URL(request.url);
  const presentado = request.headers.get("x-humaya-key") ?? url.searchParams.get("key") ?? "";
  if (!igual(presentado, secret)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown>;
  try {
    payload = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return new Response(JSON.stringify({ error: "bad_body" }), { status: 400 });
  }

  const evento = String(payload.event ?? "");
  // «deleted» manda reservationId con d minúscula; los demás, reservationID.
  const reservationId = String(
    payload.reservationID ?? payload.reservationId ?? payload.reservationID_str ?? "",
  );
  if (!reservationId) {
    return new Response(JSON.stringify({ error: "missing_reservation_id" }), { status: 400 });
  }

  // ── Borrada: se MARCA, no se borra ────────────────────────────────
  if (evento === BORRADA) {
    await db.from("humaya_cloudbeds_reservas")
      .update({ eliminada_en: new Date().toISOString(), estado: "deleted" })
      .eq("cloudbeds_reservation_id", reservationId);
    return new Response(JSON.stringify({ ok: true, marcada_como_borrada: true }), { status: 200 });
  }

  if (evento && !REFRESCAN.has(evento)) {
    // Reconocido sin error para que Cloudbeds no reintente de más.
    return new Response(JSON.stringify({ ok: true, ignorado: evento }), { status: 200 });
  }

  // ── ¿De qué hotel es? Se resuelve antes, porque define con qué llave ────
  //
  // Sin propertyID no se puede seguir. Antes se seguía igual, usando la llave
  // general; eso es preguntar por la reserva de un hotel cualquiera con las
  // credenciales del único que las tenía.
  const propertyIdAviso = payload.propertyID_str
    ? String(payload.propertyID_str)
    : payload.propertyID
      ? String(payload.propertyID)
      : null;

  if (!propertyIdAviso) {
    console.error("aviso_sin_property_id", reservationId);
    return new Response(
      JSON.stringify({ error: "missing_property_id", detalle: "El aviso no dice de qué hotel es." }),
      { status: 400 },
    );
  }

  const apiKey = await leerSecreto(db, `CLOUDBEDS_API_KEY_${propertyIdAviso}`);
  if (!apiKey) {
    console.error("cloudbeds_api_key_sin_poner", propertyIdAviso);
    return new Response(
      JSON.stringify({
        error: "not_configured",
        detalle: `Falta la llave de la propiedad ${propertyIdAviso}. ` +
          "Se pone en /staff/admin/cloudbeds. No se usa la de otro hotel.",
      }),
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await getReservation(reservationId, propertyIdAviso, apiKey);
  } catch (error) {
    console.error("get_reservation_failed", reservationId, (error as Error).message);
    return new Response(JSON.stringify({ error: "cloudbeds_fetch_failed" }), { status: 502 });
  }

  const r = extraer(body);
  // Lo que diga Cloudbeds manda sobre lo que dijo el aviso, pero si no coincide
  // con la propiedad cuya llave usamos, algo está cruzado: mejor no guardarlo.
  const propertyId = r.propertyId ?? propertyIdAviso;
  if (propertyId !== propertyIdAviso) {
    console.error("property_id_cruzado", propertyIdAviso, "->", propertyId);
    return new Response(JSON.stringify({ error: "property_id_cruzado" }), { status: 409 });
  }

  const { data: prop } = await db
    .from("humaya_propiedades").select("negocio_id").eq("property_id", propertyId).maybeSingle();
  const negocioId = (prop?.negocio_id as string | undefined) ?? null;
  if (!negocioId) {
    // Se guarda igual: una reserva sin etiqueta se arregla registrando la
    // propiedad; una reserva perdida no se arregla nunca.
    console.error("propiedad_sin_registrar", propertyId, "-> /staff/admin/cloudbeds");
  }

  const { error } = await db.from("humaya_cloudbeds_reservas").upsert(
    {
      cloudbeds_reservation_id: reservationId,
      property_id: propertyId,
      negocio_id: negocioId,
      email: r.email,
      guest_name: r.guestName,
      checkin: r.checkin,
      checkout: r.checkout,
      estado: r.estado,
      fuente: r.fuente,
      confirmacion_ota: r.confirmacion,
      crudo: body,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "cloudbeds_reservation_id" },
  );

  if (error) {
    console.error("upsert_failed", error.message);
    return new Response(JSON.stringify({ error: "db_error" }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      evento: evento || "(sin evento)",
      hotel_reconocido: Boolean(negocioId),
      con_correo: Boolean(r.email),
    }),
    { status: 200 },
  );
});
