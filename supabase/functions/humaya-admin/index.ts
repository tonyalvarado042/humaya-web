// HUMAYA · admin
//
// Un solo endpoint para lo que se configura desde /staff/admin y lo que lee
// el huésped: las opciones del Home/menú (humaya_admin_opciones) y el
// catálogo de servicios reservables (humaya_servicios + humaya_servicio_reservas).
//
// GET ?hotel=<codigo>&que=opciones[&habilitadas=1]
// GET ?hotel=<codigo>&que=servicios[&habilitados=1]
// GET ?hotel=<codigo>&que=servicio-slots&servicio_id=X&fecha=YYYY-MM-DD
// POST { hotel, action: "toggle_opcion",  id, habilitada }
// POST { hotel, action: "crear_servicio", nombre, ... }
// POST { hotel, action: "toggle_servicio", id, habilitado }
// POST { hotel, action: "reservar_servicio", servicio_id, stay_id, guest_name, fecha, hora_inicio }
//
// ── POR QUE TODO PIDE EL HOTEL ─────────────────────────────────────
// Comprobado el 20 de noviembre de 2026, con un segundo hotel recien creado:
// `?que=servicios` devolvia los servicios de LOS DOS. Un huesped de HUMAYA
// habria visto "Masaje de prueba" en sus reservas, y 12 opciones de menu en
// vez de 6. Las consultas nunca filtraron, y con un solo hotel devolvian lo
// correcto POR CASUALIDAD.
//
// Esta funcion usa la llave de servicio, asi que RLS no la frena: el filtro
// tiene que estar aca, escrito, en cada consulta.
//
// Viaja el CODIGO y no el uuid: es lo que ya tiene el navegador, y un codigo
// equivocado no revela nada.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────
// Esto era una lista escrita a mano: stayhumaya.com, www y experience. El 16
// de noviembre de 2026 se agrego staff.stayhumaya.com y NADIE se acordo de
// esta lista, asi que el navegador bloqueo todas las respuestas y
// /staff/admin mostraba "No pudimos cargar esta pantalla". Desde fuera la
// funcion respondia 200 — con curl se veia bien, porque curl no aplica CORS.
// Un fallo que solo existe dentro del navegador.
//
// Volvio a pasar el 20 de noviembre con hotelexp y guestexp.liderax10.com,
// los dominios del producto: quedaban fuera. Ahora entran los dos dominios.
const ALLOWED_RE =
  /^https:\/\/([a-z0-9-]+\.)?stayhumaya\.com$|^https:\/\/([a-z0-9-]+\.)?liderax10\.com$|^https:\/\/metodo-humaya-preview(-[a-z0-9-]+)?\.vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1):5173$/;
const DEFAULT_ORIGIN = "https://stayhumaya.com";

function allowed(origin: string | null) {
  return !!origin && ALLOWED_RE.test(origin);
}

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": allowed(origin) ? origin! : DEFAULT_ORIGIN,
    Vary: "Origin",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function hhmmOf(totalMin: number): string {
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * El uuid del hotel a partir de su codigo, o null si no existe o esta de baja.
 *
 * Se consulta por el esquema PUBLIC, no por `crm_tony_alvarado`: ese esquema
 * no esta expuesto a PostgREST. `cta_negocios` y `cta_usuarios` existen como
 * VISTAS en public, y es por ahi por donde llegan todas las funciones.
 * Pedirlas con `db: { schema: "crm_tony_alvarado" }` devuelve vacio sin dar
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
  if (!data) console.warn("negocio_no_encontrado", limpio);
  return (data as { id?: string } | null)?.id ?? null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: cors(origin) });
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const faltaHotel = () =>
    new Response(JSON.stringify({ error: "falta_hotel" }), { status: 400, headers });

  if (request.method === "GET") {
    const url = new URL(request.url);
    const que = url.searchParams.get("que");

    const negocio = await negocioDe(db, url.searchParams.get("hotel") ?? "");
    if (!negocio) return faltaHotel();

    if (que === "opciones") {
      let query = db
        .from("humaya_admin_opciones")
        .select("*")
        .eq("negocio_id", negocio)
        .order("orden", { ascending: true });
      if (url.searchParams.get("habilitadas")) query = query.eq("habilitada", true);
      const { data, error } = await query;
      if (error) {
        console.error("opciones_failed", error.message);
        return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
      }
      return new Response(JSON.stringify({ opciones: data }), { headers });
    }

    if (que === "servicios") {
      let query = db
        .from("humaya_servicios")
        .select("*")
        .eq("negocio_id", negocio)
        .order("orden", { ascending: true });
      if (url.searchParams.get("habilitados")) query = query.eq("habilitado", true);
      const { data, error } = await query;
      if (error) {
        console.error("servicios_failed", error.message);
        return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
      }
      return new Response(JSON.stringify({ servicios: data }), { headers });
    }

    if (que === "servicio-slots") {
      const servicioId = url.searchParams.get("servicio_id") ?? "";
      const fecha = url.searchParams.get("fecha") ?? "";
      if (!servicioId || !fecha) {
        return new Response(JSON.stringify({ error: "missing_params" }), { status: 400, headers });
      }

      // Acotado al hotel: sin esto, sabiendo el uuid de un servicio ajeno se
      // podrian leer sus horarios ocupados — y con ellos, cuanta gente tiene.
      const { data: servicio, error: servicioError } = await db
        .from("humaya_servicios")
        .select("*")
        .eq("id", servicioId)
        .eq("negocio_id", negocio)
        .maybeSingle();
      if (servicioError || !servicio) {
        return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers });
      }

      const { data: reservas, error: reservasError } = await db
        .from("humaya_servicio_reservas")
        .select("hora_inicio")
        .eq("servicio_id", servicioId)
        .eq("negocio_id", negocio)
        .eq("fecha", fecha);
      if (reservasError) {
        console.error("slots_failed", reservasError.message);
        return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
      }

      const taken = new Set((reservas ?? []).map((row) => row.hora_inicio));
      const start = minutesOf(servicio.hora_inicio);
      const end = minutesOf(servicio.hora_fin);
      const step = servicio.duracion_min as number;
      const slots: { start: string; taken: boolean }[] = [];
      for (let cursor = start; cursor + step <= end; cursor += step) {
        const hhmm = hhmmOf(cursor);
        slots.push({ start: hhmm, taken: taken.has(hhmm) });
      }

      return new Response(JSON.stringify({ servicio, slots }), { headers });
    }

    return new Response(JSON.stringify({ error: "unknown_query" }), { status: 400, headers });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_json" }), { status: 400, headers });
  }

  const action = String(body.action ?? "");
  const negocio = await negocioDe(db, String(body.hotel ?? ""));
  if (!negocio) return faltaHotel();

  // ── Quien puede cambiar la configuracion ─────────────────────────────
  // toggle_opcion, toggle_servicio y crear_servicio cambian lo que ve TODO
  // huesped. Son de recepcion, no del publico. Hasta el 16 de noviembre de
  // 2026 esta funcion no pedia NADA: un POST desde cualquier parte del mundo
  // podia apagarle el menu a los huespedes o inventar servicios, porque usa
  // la llave de servicio y RLS no la frena.
  //
  // OJO con la columna: el rol se busca por `cta_usuarios.id`, que ES el id
  // de Supabase Auth. No existe ninguna columna `auth_user_id`.
  //
  // reservar_servicio NO pide sesion a proposito: lo llama la app del
  // huesped, que entra por codigo de confirmacion y no tiene cuenta.
  const SOLO_RECEPCION = new Set(["toggle_opcion", "toggle_servicio", "crear_servicio"]);
  const ROLES_RECEPCION = new Set(["administrador", "operaciones", "vendedor", "lectura"]);

  if (SOLO_RECEPCION.has(action)) {
    const encabezado = request.headers.get("authorization") ?? "";
    const token = encabezado.toLowerCase().startsWith("bearer ")
      ? encabezado.slice(7).trim()
      : "";
    if (!token) {
      return new Response(JSON.stringify({ error: "no_autorizado" }), { status: 401, headers });
    }

    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth?.user) {
      return new Response(JSON.stringify({ error: "no_autorizado" }), { status: 401, headers });
    }

    // El rol se lee de la tabla, no del token: un JWT puede traer metadata
    // que el usuario mismo edito. Sin fila, no entra.
    const { data: usuario, error: usuarioError } = await db
      .from("cta_usuarios")
      .select("rol,activo")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (usuarioError) {
      // Si la consulta se rompe, se dice que se rompio. Tratar un fallo de
      // lectura como "sin permiso" manda a recepcion a buscar un problema de
      // permisos que no existe.
      console.error("rol_lookup_failed", usuarioError.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }

    const fila = usuario as { rol?: string | null; activo?: boolean | null } | null;
    const rol = fila?.rol ?? "";
    const activo = fila?.activo !== false;
    if (!fila || !activo || !ROLES_RECEPCION.has(rol)) {
      return new Response(JSON.stringify({ error: "sin_permiso" }), { status: 403, headers });
    }
  }

  if (action === "toggle_opcion") {
    const id = String(body.id ?? "");
    if (!id) return new Response(JSON.stringify({ error: "missing_id" }), { status: 400, headers });
    // `.select()` para contar lo que de verdad cambio: un update acotado al
    // hotel que no toca nada devuelve exito con cero filas, y la pantalla
    // diria que guardo algo que no guardo.
    const { data, error } = await db
      .from("humaya_admin_opciones")
      .update({ habilitada: Boolean(body.habilitada), actualizado_en: new Date().toISOString() })
      .eq("id", id)
      .eq("negocio_id", negocio)
      .select("id");
    if (error) {
      console.error("toggle_opcion_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }
    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: "no_es_de_este_hotel" }), { status: 404, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  if (action === "toggle_servicio") {
    const id = String(body.id ?? "");
    if (!id) return new Response(JSON.stringify({ error: "missing_id" }), { status: 400, headers });
    const { data, error } = await db
      .from("humaya_servicios")
      .update({ habilitado: Boolean(body.habilitado), actualizado_en: new Date().toISOString() })
      .eq("id", id)
      .eq("negocio_id", negocio)
      .select("id");
    if (error) {
      console.error("toggle_servicio_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }
    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: "no_es_de_este_hotel" }), { status: 404, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  if (action === "crear_servicio") {
    const nombre = String(body.nombre ?? "").trim().slice(0, 120);
    if (!nombre) {
      return new Response(JSON.stringify({ error: "missing_nombre" }), { status: 400, headers });
    }
    const { data, error } = await db
      .from("humaya_servicios")
      .insert({
        negocio_id: negocio,
        nombre,
        descripcion: body.descripcion ? String(body.descripcion).slice(0, 500) : null,
        proveedor: body.proveedor ? String(body.proveedor).slice(0, 120) : null,
        precio_usd: body.precio_usd != null ? Number(body.precio_usd) : null,
        unidad_precio: body.unidad_precio ? String(body.unidad_precio).slice(0, 30) : "hora",
        duracion_min: body.duracion_min != null ? Number(body.duracion_min) : 60,
        hora_inicio: body.hora_inicio ? String(body.hora_inicio) : "08:00",
        hora_fin: body.hora_fin ? String(body.hora_fin) : "18:00",
      })
      .select("*")
      .single();
    if (error) {
      console.error("crear_servicio_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }
    return new Response(JSON.stringify({ servicio: data }), { headers });
  }

  if (action === "reservar_servicio") {
    const servicioId = String(body.servicio_id ?? "");
    const stayId = String(body.stay_id ?? "");
    const guestName = String(body.guest_name ?? "").slice(0, 120);
    const fecha = String(body.fecha ?? "");
    const horaInicio = String(body.hora_inicio ?? "");
    if (!servicioId || !stayId || !guestName || !fecha || !horaInicio) {
      return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400, headers });
    }

    // El servicio tiene que ser DE ESTE HOTEL. Sin esta comprobacion, sabiendo
    // el uuid de un servicio ajeno se le podria llenar la agenda a otro hotel.
    const { data: servicio } = await db
      .from("humaya_servicios")
      .select("id")
      .eq("id", servicioId)
      .eq("negocio_id", negocio)
      .maybeSingle();
    if (!servicio) {
      return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers });
    }

    const { error } = await db.from("humaya_servicio_reservas").insert({
      negocio_id: negocio,
      servicio_id: servicioId,
      stay_id: stayId,
      guest_name: guestName,
      fecha,
      hora_inicio: horaInicio,
    });
    if (error) {
      if (error.code === "23505") {
        return new Response(JSON.stringify({ error: "slot_taken" }), { status: 409, headers });
      }
      console.error("reservar_servicio_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers });
});
