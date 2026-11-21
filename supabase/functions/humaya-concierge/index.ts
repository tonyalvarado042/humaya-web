// HUMAYA · Método Humaya — Concierge
//
// GET  ?hotel=X&stay_id=Y           -> hilo de esa estadia (app del huesped)
// GET  ?hotel=X&staff=1             -> bandeja de recepcion         [pide sesion]
// GET  ?hotel=X&que=estado[&probar=1] -> estado del bot y gasto     [pide sesion]
// POST { hotel, action: "send",  stay_id, guest_name, text, idioma? } -> el huesped
// POST { hotel, action: "reply", stay_id, text, text_en? }   [pide sesion]
// POST { hotel, action: "read",  stay_id }                   [pide sesion]
//
// ── POR QUE TODO PIDE EL HOTEL (21 de noviembre de 2026) ─────────────────
// Esta funcion era de UN hotel, con el uuid de HUMAYA escrito adentro, y
// ninguna consulta filtraba. Probandola en vivo contra el hotel demo:
// `?que=estado` decia «2 temas activos» cuando el demo tiene UNO.
//
// Lo que eso significaba de verdad, que es mucho peor que un contador:
//   · El system del bot se armaba con la base de conocimiento de LOS DOS
//     hoteles. Un huesped de HUMAYA podia recibir «este es el hotel demo del
//     producto, no es un hotel real»; uno del demo, las reglas internas de
//     HUMAYA y el precio de su entrenador con nombre y apellido.
//   · El catalogo de servicios tampoco filtraba: el bot ofrecia a cada
//     huesped los servicios del otro hotel.
//   · El interruptor de encendido, el modelo y las tarifas se leian SIEMPRE
//     de HUMAYA: apagar el bot en un hotel no lo apagaba.
//   · El gasto sumaba los tokens de todos los hoteles en una sola factura.
//
// Esta funcion usa la llave de servicio, asi que RLS no la frena: el filtro
// tiene que estar aca, escrito, en cada consulta.
//
// Viaja el CODIGO y no el uuid: es lo que ya tiene el navegador, y un codigo
// equivocado no revela nada. La funcion lo traduce.
//
// ── POR QUE EL BOT NO CONTESTA DE LO QUE SABE ────────────────────────────
// Se le pregunto a un modelo, SIN darle un dato del hotel: "a que hora es el
// desayuno? si no lo sabes, decilo". Contesto "de 7:00 a 10:00 hrs". Se lo
// invento. Por eso solo puede usar humaya_concierge_base mas el catalogo
// real de servicios, y tiene que declarar si le alcanzo.
//
// ── EL IDIOMA NO SE DEDUCE ────────────────────────────────────────
// Lo manda la app del huesped, que ES la que sabe en que idioma la esta
// leyendo. Deducirlo del texto falla con "ok", "gracias" o un nombre propio,
// que es justo lo que mas se escribe en un chat.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────
// liderax10.com entra desde el 21 de noviembre de 2026: los dominios del
// producto —guestexp y hotelexp— quedaban fuera, asi que el Concierge
// respondia 200 y el navegador tiraba la respuesta. Un fallo que solo existe
// dentro del navegador: con curl se veia perfecto.
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

const ROLES_RECEPCION = new Set(["administrador", "operaciones", "vendedor", "lectura"]);
const MODELO_POR_DEFECTO = "claude-haiku-5-5";

/** Quien es este hotel, y como se llama para el huesped. */
interface Hotel {
  id: string;
  nombre: string;
}

/**
 * El hotel a partir de su codigo, o null si no existe o esta de baja.
 *
 * Se consulta por el esquema PUBLIC, no por `crm_tony_alvarado`: ese esquema
 * no esta expuesto a PostgREST. `cta_negocios` existe como VISTA en public.
 * Pedirla con `db: { schema: "crm_tony_alvarado" }` devuelve vacio sin dar
 * error, que se lee como "ese hotel no existe".
 */
async function hotelDe(db: SupabaseClient, codigo: string): Promise<Hotel | null> {
  const limpio = codigo.trim().toLowerCase().slice(0, 40);
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(limpio)) return null;

  const { data, error } = await db
    .from("cta_negocios")
    .select("id,nombre")
    .eq("codigo", limpio)
    .eq("activo", true)
    .maybeSingle();

  if (error) {
    console.error("negocio_lookup_failed", limpio, error.message);
    return null;
  }
  if (!data) {
    console.warn("negocio_no_encontrado", limpio);
    return null;
  }

  const id = (data as { id: string }).id;

  // El nombre que ve el huesped es el de la marca, no el interno del CRM.
  const { data: marca } = await db
    .from("humaya_hoteles")
    .select("marca_hotel")
    .eq("negocio_id", id)
    .maybeSingle();

  const nombre =
    (marca as { marca_hotel?: string | null } | null)?.marca_hotel?.trim() ||
    (data as { nombre?: string | null }).nombre?.trim() ||
    "";

  return { id, nombre };
}

type Localized = { es: string; en: string };

const FALLBACK_ANSWER: Localized = {
  es: "Con gusto. Ya se lo paso al equipo y te confirmo por aquí en unos minutos.",
  en: "Of course. I will pass this to the team and confirm here in a few minutes.",
};

const KNOWN_STAYS: Record<string, string> = {
  "s-mendez-rojas": "Valeria",
  "s-weber": "Hannah",
};

interface MessageRow {
  id: string;
  stay_id: string;
  guest_name: string;
  remitente: "huesped" | "concierge" | "staff";
  texto: string;
  texto_en: string | null;
  escalado: boolean;
  leido_en: string | null;
  creado_en: string;
  idioma: string | null;
}

/**
 * El mensaje como lo lee la app.
 *
 * `translations` se devuelve para el concierge Y para el staff: lo que el
 * huesped ve tiene que estar en su idioma venga de quien venga. Del huesped
 * NO se traduce nada — lo que escribio es lo que escribio; de el solo viaja
 * en que idioma tenia la app.
 */
function toMessage(row: MessageRow) {
  const traducible = row.remitente === "concierge" || row.remitente === "staff";
  return {
    id: row.id,
    stayId: row.stay_id,
    guestName: row.guest_name,
    from: row.remitente === "huesped" ? "guest" : row.remitente === "staff" ? "staff" : "concierge",
    text: row.texto,
    translations: traducible && row.texto_en ? { es: row.texto, en: row.texto_en } : undefined,
    escalated: row.escalado,
    readAt: row.leido_en,
    at: row.creado_en,
    lang: row.remitente === "huesped" ? (row.idioma ?? null) : null,
  };
}

async function leerAjuste(db: SupabaseClient, negocio: string, clave: string): Promise<unknown> {
  const { data } = await db
    .from("humaya_ajustes")
    .select("valor")
    .eq("negocio_id", negocio)
    .eq("clave", clave)
    .maybeSingle();
  return (data as { valor?: unknown } | null)?.valor ?? null;
}

/**
 * La llave: PRIMERO la boveda (donde escribe settings), despues el entorno.
 *
 * La llave NO se separa por hotel todavia: es una sola cuenta de Anthropic
 * para todo el producto. Cuando cada hotel pague la suya, esto cambia — y el
 * gasto ya se cuenta por hotel, que es la mitad del trabajo.
 */
async function llaveAnthropic(
  db: SupabaseClient,
): Promise<{ llave: string | null; desde: string | null }> {
  try {
    const { data } = await db.rpc("cta_leer_secreto", { p_nombre: "ANTHROPIC_API_KEY" });
    const deLaBoveda = (data as string | null) ?? null;
    if (deLaBoveda) return { llave: deLaBoveda, desde: "settings" };
  } catch {
    // Sin cta_leer_secreto se sigue al entorno.
  }
  const delEntorno = Deno.env.get("ANTHROPIC_API_KEY");
  if (delEntorno) return { llave: delEntorno, desde: "los secretos de la función" };
  return { llave: null, desde: null };
}

interface Tema {
  tema: string;
  contenido: string;
}

async function temasActivos(db: SupabaseClient, negocio: string): Promise<Tema[]> {
  const { data } = await db
    .from("humaya_concierge_base")
    .select("tema,contenido")
    .eq("negocio_id", negocio)
    .eq("activo", true)
    .order("orden", { ascending: true });
  return (data ?? []) as Tema[];
}

interface Servicio {
  nombre: string;
  descripcion: string | null;
  proveedor: string | null;
  precio_usd: number | string | null;
  unidad_precio: string;
  duracion_min: number;
  hora_inicio: string;
  hora_fin: string;
}

/**
 * El catalogo real de lo que se puede reservar, leido de la tabla.
 * Si manana cambia un precio en Admin, el bot lo dice bien sin que nadie se
 * acuerde de tocar dos lugares.
 */
async function serviciosReservables(db: SupabaseClient, negocio: string): Promise<Servicio[]> {
  const { data } = await db
    .from("humaya_servicios")
    .select(
      "nombre,descripcion,proveedor,precio_usd,unidad_precio,duracion_min,hora_inicio,hora_fin",
    )
    .eq("negocio_id", negocio)
    .eq("habilitado", true)
    .order("orden", { ascending: true });
  return (data ?? []) as Servicio[];
}

/**
 * El system del modelo.
 *
 * ── POR QUE YA NO DICE «HUMAYA, LA FORTUNA, ARENAL» ─────────────────────
 * Porque estaba escrito aca, en el codigo, y el bot de CUALQUIER hotel
 * afirmaba ser HUMAYA y estar al pie del Arenal. Ahora el nombre sale del
 * hotel y el lugar sale de su base de conocimiento, que es donde viven los
 * hechos de cada hotel. El de HUMAYA se paso a un tema para no perderlo.
 */
function armarSistema(hotel: string, temas: Tema[], servicios: Servicio[]): string {
  const base = temas.map((t) => `## ${t.tema}\n${t.contenido}`).join("\n\n");

  const catalogo = servicios
    .map((s) => {
      const partes = [`## ${s.nombre}`];
      if (s.descripcion) partes.push(s.descripcion);
      if (s.proveedor) partes.push(`Lo da: ${s.proveedor}.`);
      if (s.precio_usd != null) partes.push(`Precio: ${s.precio_usd} USD por ${s.unidad_precio}.`);
      partes.push(
        `Horario: de ${s.hora_inicio} a ${s.hora_fin}, en bloques de ${s.duracion_min} minutos.`,
      );
      return partes.join("\n");
    })
    .join("\n\n");

  return [
    `Sos el concierge de ${hotel || "este hotel"}.`,
    "Hablas con un huesped que esta alojado. Sos calido, breve y concreto: dos o tres frases, nunca una lista larga.",
    "",
    "REGLA QUE NO SE ROMPE: solo podes afirmar lo que este en LO QUE SABEMOS o en SE PUEDE RESERVAR. No completes con lo que sepas de otros hoteles, de Costa Rica o del mundo. Si falta un horario, un precio, un nombre o una regla, NO lo inventes. Ni siquiera el pais, la ciudad o que clase de hotel es: si no esta escrito abajo, no lo sabes.",
    "",
    "Si el huesped quiere reservar algo del catalogo, confirmale que se puede y decile que lo haga desde Reservas en la app, o que vos se lo pasas a recepcion. No le prometas una hora concreta: eso lo confirma recepcion.",
    "",
    "Devolve SOLO un objeto JSON, sin texto alrededor y sin bloques de codigo, con estas claves:",
    '  "alcanza": true si LO QUE SABEMOS o SE PUEDE RESERVAR contestan la pregunta completa; false si falta cualquier parte.',
    '  "es": la respuesta en espanol de Costa Rica (vos, tenes, podes).',
    '  "en": la misma respuesta en ingles.',
    "",
    "Si alcanza es false, igual escribi es/en, pero no se van a usar: va a contestar el equipo.",
    "",
    "LO QUE SABEMOS:",
    base || "(no hay nada cargado todavia)",
    "",
    "SE PUEDE RESERVAR:",
    catalogo || "(no hay servicios cargados todavia)",
  ].join("\n");
}

interface Respuesta {
  texto: Localized;
  escalado: boolean;
  uso: { entrada: number; salida: number; ms: number } | null;
  error: string | null;
  /**
   * Si la API acepto la llamada, aunque despues el contenido no sirviera.
   *
   * Separa dos cosas que no se arreglan igual: «la llave o los parametros
   * estan mal» y «el modelo contesto, pero su respuesta no servia». La
   * pantalla pinta la primera como «Llave invalida»; si no se distinguen,
   * una respuesta cortada se muestra como una llave rota y se manda a
   * cambiar una llave que estaba bien.
   */
  apiOk: boolean;
}

/**
 * Cuanto se le deja escribir al modelo.
 *
 * ── POR QUE NO 400 ──────────────────────────────────────────────────
 * Con 400 se midio una respuesta de 400 tokens justos: el techo. El JSON
 * quedo cortado a la mitad, JSON.parse fallo y el huesped recibio «ya se lo
 * paso al equipo» sin que nadie supiera por que. Cada respuesta se escribe
 * DOS veces, en espanol y en ingles, asi que 400 alcanzaba apenas para la
 * mas corta. Los textos igual se recortan a 1200 caracteres mas abajo.
 */
const MAX_TOKENS = 1200;

/**
 * La UNICA puerta al modelo: por aca salen la respuesta de verdad Y el boton
 * Probar, con el mismo cuerpo.
 *
 * ── POR QUE UNA SOLA PUERTA ─────────────────────────────────────────────
 * Comprobado el 17 de noviembre de 2026. El boton Probar decia «Funciona.
 * claude-haiku-5-5, 736 ms.» y, al mismo tiempo, TODO mensaje de huesped
 * recibia «ya se lo paso al equipo». El motivo estaba en
 * humaya_concierge_uso: «`temperature` is deprecated for this model».
 *
 * La prueba mandaba un cuerpo distinto al real — sin `temperature` — asi que
 * no podia ver el unico campo que rompia la respuesta. Un verificador que
 * manda otra cosa que lo que se usa da verde y da permiso.
 *
 * Y nada de `temperature`: los modelos Claude 5 lo rechazan. El JSON que se
 * pide no lo necesita para salir estable; eso lo sostiene el system.
 */
async function respuestaDelModelo(
  llave: string,
  modelo: string,
  system: string,
  pregunta: string,
  historial: MessageRow[],
): Promise<Respuesta> {
  const inicio = Date.now();

  const mensajes = historial.slice(-6).map((fila) => ({
    role: fila.remitente === "huesped" ? "user" : "assistant",
    content: fila.texto,
  }));
  mensajes.push({ role: "user", content: pregunta });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": llave,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: MAX_TOKENS,
        system,
        messages: mensajes,
      }),
    });

    const ms = Date.now() - inicio;
    const cuerpo = (await r.json().catch(() => ({}))) as {
      content?: { type: string; text?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
      stop_reason?: string | null;
      error?: { message?: string };
    };

    if (!r.ok) {
      return {
        texto: FALLBACK_ANSWER,
        escalado: true,
        uso: { entrada: 0, salida: 0, ms },
        error: cuerpo.error?.message ?? `http_${r.status}`,
        apiOk: false,
      };
    }

    const uso = {
      entrada: cuerpo.usage?.input_tokens ?? 0,
      salida: cuerpo.usage?.output_tokens ?? 0,
      ms,
    };

    // Una respuesta cortada se llama cortada. Si se deja caer en el
    // «respuesta_no_json» de abajo, el registro dice que el modelo contesto
    // mal cuando lo que paso fue que no lo dejamos terminar.
    if (cuerpo.stop_reason === "max_tokens") {
      return {
        texto: FALLBACK_ANSWER,
        escalado: true,
        uso,
        error: "respuesta_cortada",
        apiOk: true,
      };
    }

    const crudo = (cuerpo.content ?? [])
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    let salida: { alcanza?: boolean; es?: string; en?: string };
    try {
      salida = JSON.parse(crudo);
    } catch {
      return {
        texto: FALLBACK_ANSWER,
        escalado: true,
        uso,
        error: "respuesta_no_json",
        apiOk: true,
      };
    }

    if (salida.alcanza !== true || !salida.es || !salida.en) {
      return { texto: FALLBACK_ANSWER, escalado: true, uso, error: null, apiOk: true };
    }

    return {
      texto: { es: String(salida.es).slice(0, 1200), en: String(salida.en).slice(0, 1200) },
      escalado: false,
      uso,
      error: null,
      apiOk: true,
    };
  } catch (e) {
    return {
      texto: FALLBACK_ANSWER,
      escalado: true,
      uso: null,
      error: e instanceof Error ? e.message : "falla_red",
      apiOk: false,
    };
  }
}

/** Los candados — encendido, llave y base — y despues la puerta de arriba. */
async function preguntarAlModelo(
  db: SupabaseClient,
  hotel: Hotel,
  pregunta: string,
  historial: MessageRow[],
): Promise<Respuesta> {
  const encendido = (await leerAjuste(db, hotel.id, "bot_encendido")) === true;
  const temas = await temasActivos(db, hotel.id);
  const servicios = await serviciosReservables(db, hotel.id);
  const { llave } = await llaveAnthropic(db);

  const cerrado = (error: string): Respuesta => ({
    texto: FALLBACK_ANSWER,
    escalado: true,
    uso: null,
    error,
    apiOk: false,
  });

  if (!encendido) return cerrado("apagado");
  if (!llave) return cerrado("sin_llave");
  if (temas.length === 0 && servicios.length === 0) return cerrado("sin_base");

  const modelo =
    ((await leerAjuste(db, hotel.id, "bot_modelo")) as string | null) ?? MODELO_POR_DEFECTO;
  return respuestaDelModelo(
    llave,
    modelo,
    armarSistema(hotel.nombre, temas, servicios),
    pregunta,
    historial,
  );
}

async function quienEs(db: SupabaseClient, request: Request): Promise<string | null> {
  const encabezado = request.headers.get("authorization") ?? "";
  const token = encabezado.toLowerCase().startsWith("bearer ") ? encabezado.slice(7).trim() : "";
  if (!token) return null;

  const { data: auth, error } = await db.auth.getUser(token);
  if (error || !auth?.user) return null;

  const { data } = await db
    .from("cta_usuarios")
    .select("rol,activo")
    .eq("id", auth.user.id)
    .maybeSingle();

  const fila = data as { rol?: string | null; activo?: boolean | null } | null;
  if (!fila || fila.activo === false) return null;
  const rol = fila.rol ?? "";
  return ROLES_RECEPCION.has(rol) ? rol : null;
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };

  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const noAutorizado = () =>
    new Response(JSON.stringify({ error: "no_autorizado" }), { status: 401, headers });
  const faltaHotel = () =>
    new Response(JSON.stringify({ error: "falta_hotel" }), { status: 400, headers });

  if (request.method === "GET") {
    const url = new URL(request.url);

    // Sin hotel no se contesta NADA. No hay valor por defecto a proposito:
    // el que habia era HUMAYA, y eso es justo lo que hacia que el bot de
    // cualquier hotel leyera la base de HUMAYA.
    const hotel = await hotelDe(db, url.searchParams.get("hotel") ?? "");
    if (!hotel) return faltaHotel();

    if (url.searchParams.get("que") === "estado") {
      if (!(await quienEs(db, request))) return noAutorizado();

      const { llave, desde } = await llaveAnthropic(db);
      const temas = await temasActivos(db, hotel.id);
      const servicios = await serviciosReservables(db, hotel.id);
      const modelo =
        ((await leerAjuste(db, hotel.id, "bot_modelo")) as string | null) ?? MODELO_POR_DEFECTO;
      const precioEntrada = (await leerAjuste(db, hotel.id, "bot_precio_entrada")) as number | null;
      const precioSalida = (await leerAjuste(db, hotel.id, "bot_precio_salida")) as number | null;

      const { data: filas } = await db
        .from("humaya_concierge_uso")
        .select("tokens_entrada,tokens_salida,creado_en,ok")
        .eq("negocio_id", hotel.id);
      const uso = (filas ?? []) as {
        tokens_entrada: number;
        tokens_salida: number;
        creado_en: string;
        ok: boolean;
      }[];

      const desdeElMes = new Date();
      desdeElMes.setUTCDate(1);
      desdeElMes.setUTCHours(0, 0, 0, 0);

      const sumar = (lista: typeof uso) => {
        const entrada = lista.reduce((t, f) => t + (f.tokens_entrada ?? 0), 0);
        const salida = lista.reduce((t, f) => t + (f.tokens_salida ?? 0), 0);
        const usd =
          precioEntrada == null || precioSalida == null
            ? null
            : Number(((entrada / 1e6) * precioEntrada + (salida / 1e6) * precioSalida).toFixed(4));
        return { llamadas: lista.length, tokensEntrada: entrada, tokensSalida: salida, usd };
      };

      let prueba: { ok: boolean; detalle: string } | null = null;
      if (url.searchParams.get("probar") && llave) {
        // La prueba pasa por la MISMA puerta que una respuesta de verdad, con
        // el mismo cuerpo y el mismo system. Lo unico que no comprueba es el
        // interruptor de encendido: si lo comprobara, no se podria probar la
        // llave con el bot apagado — y la pantalla no deja encenderlo hasta
        // que la prueba pase. Seria un candado con la llave adentro.
        //
        // La pregunta es la de un huesped cualquiera, sin pedirle un formato:
        // decirle «en una frase» pelea con el JSON que el system le exige.
        const r = await respuestaDelModelo(
          llave,
          modelo,
          armarSistema(hotel.nombre, temas, servicios),
          "Hola, que servicios se pueden reservar?",
          [],
        );
        const ms = r.uso?.ms ?? 0;

        if (!r.apiOk) {
          // Lo unico que de verdad significa «la llave o los parametros
          // estan mal». Lo de abajo son problemas del contenido.
          prueba = { ok: false, detalle: r.error ?? "falla desconocida" };
        } else if (r.error === "respuesta_cortada") {
          prueba = {
            ok: true,
            detalle:
              `${modelo}, ${ms} ms. La llave sirve, pero la respuesta no cupo y llegó cortada: ` +
              `el huésped recibe «ya se lo paso al equipo». Avisale a quien hizo esta pantalla.`,
          };
        } else if (r.error !== null) {
          prueba = {
            ok: true,
            detalle: `${modelo}, ${ms} ms. La llave sirve, pero el modelo contestó algo inservible (${r.error}).`,
          };
        } else if (r.escalado) {
          // El modelo contesto bien; lo que no alcanzo fue lo que sabe. Se
          // dice, porque «arreglar la llave» y «cargar la base» son dos
          // trabajos distintos y no conviene confundirlos.
          prueba = {
            ok: true,
            detalle:
              `${modelo}, ${ms} ms. Pero con lo que sabe hoy no le alcanzó para contestar: ` +
              `el huésped sigue recibiendo «ya se lo paso al equipo». Encendé temas acá abajo.`,
          };
        } else {
          prueba = { ok: true, detalle: `${modelo}, ${ms} ms. El huésped recibiría respuesta.` };
        }
      }

      return new Response(
        JSON.stringify({
          encendido: (await leerAjuste(db, hotel.id, "bot_encendido")) === true,
          modelo,
          hayLlave: !!llave,
          llaveDesde: desde,
          prueba,
          temasActivos: temas.length,
          serviciosActivos: servicios.length,
          gasto: {
            precioEntrada,
            precioSalida,
            mes: sumar(uso.filter((f) => new Date(f.creado_en) >= desdeElMes)),
            total: sumar(uso),
          },
        }),
        { headers },
      );
    }

    if (url.searchParams.get("staff")) {
      if (!(await quienEs(db, request))) return noAutorizado();

      const { data, error } = await db
        .from("humaya_concierge_mensajes")
        .select("*")
        .eq("negocio_id", hotel.id)
        .order("creado_en", { ascending: true });
      if (error) {
        console.error("staff_list_failed", error.message);
        return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
      }

      const rows = (data ?? []) as MessageRow[];
      const conversations = Object.entries(KNOWN_STAYS).map(([stayId, guestName]) => {
        const thread = rows.filter((row) => row.stay_id === stayId);
        const lastGuest = thread.filter((row) => row.remitente === "huesped").at(-1);
        const unreadCount = thread.filter((row) => row.remitente === "huesped" && !row.leido_en)
          .length;
        const escalated = thread.some(
          (row) => row.remitente === "concierge" && row.escalado && !row.leido_en,
        );

        // Desde cuando espera: el primer mensaje del huesped sin leer. Si
        // nadie lo leyo, nadie lo contesto.
        const primeroSinLeer = thread.find((row) => row.remitente === "huesped" && !row.leido_en);

        return {
          stayId,
          guestName,
          lastGuestMessage: lastGuest ? toMessage(lastGuest) : null,
          unreadCount,
          escalated,
          lang: lastGuest?.idioma ?? null,
          waitingSince: primeroSinLeer?.creado_en ?? null,
        };
      });

      return new Response(JSON.stringify({ conversations }), { headers });
    }

    const stayId = url.searchParams.get("stay_id") ?? "";
    if (!KNOWN_STAYS[stayId]) {
      return new Response(JSON.stringify({ error: "unknown_stay" }), { status: 400, headers });
    }

    const { data, error } = await db
      .from("humaya_concierge_mensajes")
      .select("*")
      .eq("negocio_id", hotel.id)
      .eq("stay_id", stayId)
      .order("creado_en", { ascending: true });
    if (error) {
      console.error("thread_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ messages: (data ?? []).map(toMessage) }), { headers });
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

  const hotel = await hotelDe(db, String(body.hotel ?? ""));
  if (!hotel) return faltaHotel();

  const action = String(body.action ?? "");
  const stayId = String(body.stay_id ?? "");
  if (!KNOWN_STAYS[stayId]) {
    return new Response(JSON.stringify({ error: "unknown_stay" }), { status: 400, headers });
  }

  if (action === "reply" || action === "read") {
    if (!(await quienEs(db, request))) return noAutorizado();
  }

  if (action === "read") {
    const { error } = await db
      .from("humaya_concierge_mensajes")
      .update({ leido_en: new Date().toISOString() })
      .eq("negocio_id", hotel.id)
      .eq("stay_id", stayId)
      .is("leido_en", null);
    if (error) {
      console.error("mark_read_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  const text = String(body.text ?? "")
    .trim()
    .slice(0, 2000);
  if (!text) {
    return new Response(JSON.stringify({ error: "missing_text" }), { status: 400, headers });
  }

  if (action === "reply") {
    const textEn = String(body.text_en ?? "")
      .trim()
      .slice(0, 2000);

    const { error } = await db.from("humaya_concierge_mensajes").insert({
      negocio_id: hotel.id,
      stay_id: stayId,
      guest_name: KNOWN_STAYS[stayId],
      remitente: "staff",
      texto: text,
      texto_en: textEn || null,
    });
    if (error) {
      console.error("staff_reply_failed", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }
    await db
      .from("humaya_concierge_mensajes")
      .update({ leido_en: new Date().toISOString() })
      .eq("negocio_id", hotel.id)
      .eq("stay_id", stayId)
      .is("leido_en", null);

    const { data } = await db
      .from("humaya_concierge_mensajes")
      .select("*")
      .eq("negocio_id", hotel.id)
      .eq("stay_id", stayId)
      .order("creado_en", { ascending: true });
    return new Response(JSON.stringify({ messages: (data ?? []).map(toMessage) }), { headers });
  }

  if (action === "send") {
    const guestName = String(body.guest_name ?? KNOWN_STAYS[stayId]).slice(0, 80);
    // Solo es/en: cualquier otra cosa se guarda como nada antes que como un
    // dato falso sobre el huesped.
    const crudo = String(body.idioma ?? "").toLowerCase();
    const idioma = crudo === "es" || crudo === "en" ? crudo : null;

    const { data: previos } = await db
      .from("humaya_concierge_mensajes")
      .select("*")
      .eq("negocio_id", hotel.id)
      .eq("stay_id", stayId)
      .order("creado_en", { ascending: true });

    const { error: insertError } = await db.from("humaya_concierge_mensajes").insert({
      negocio_id: hotel.id,
      stay_id: stayId,
      guest_name: guestName,
      remitente: "huesped",
      texto: text,
      idioma,
    });
    if (insertError) {
      console.error("guest_message_failed", insertError.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }

    const respuesta = await preguntarAlModelo(db, hotel, text, (previos ?? []) as MessageRow[]);

    if (respuesta.uso) {
      const modelo =
        ((await leerAjuste(db, hotel.id, "bot_modelo")) as string | null) ?? MODELO_POR_DEFECTO;
      await db.from("humaya_concierge_uso").insert({
        negocio_id: hotel.id,
        stay_id: stayId,
        modelo,
        tokens_entrada: respuesta.uso.entrada,
        tokens_salida: respuesta.uso.salida,
        ok: respuesta.error === null,
        error: respuesta.error,
        ms: respuesta.uso.ms,
      });
    }

    const { error: replyError } = await db.from("humaya_concierge_mensajes").insert({
      negocio_id: hotel.id,
      stay_id: stayId,
      guest_name: guestName,
      remitente: "concierge",
      texto: respuesta.texto.es,
      texto_en: respuesta.texto.en,
      escalado: respuesta.escalado,
    });
    if (replyError) {
      console.error("concierge_reply_failed", replyError.message);
      return new Response(JSON.stringify({ error: "db_error" }), { status: 500, headers });
    }

    const { data } = await db
      .from("humaya_concierge_mensajes")
      .select("*")
      .eq("negocio_id", hotel.id)
      .eq("stay_id", stayId)
      .order("creado_en", { ascending: true });
    return new Response(JSON.stringify({ messages: (data ?? []).map(toMessage) }), { headers });
  }

  return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers });
});
