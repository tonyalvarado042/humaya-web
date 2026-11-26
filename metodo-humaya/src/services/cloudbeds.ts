import { cabeceraDeRecepcion, cliente } from './sesion';

/**
 * Conectar cada hotel con su propiedad de Cloudbeds, y guardar su llave.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 25 de noviembre de 2026, mirando Admin: «Ya tengo la API de
 * Cloudbeds, pero no hay pantalla donde ponerla». No la había. La única que
 * guardaba llaves de Cloudbeds vivía en el CRM (Ari ARM), y ese es el CRM de
 * Tony, no el panel de un hotel.
 *
 * El mismo día, sobre por qué eso estaba mal: «Hotel Experience, que es la
 * aplicación que estamos haciendo ahorita, yo esta aplicación la desligaría
 * del CRM para que no intervenga con el mismo».
 *
 * ── UNA LLAVE POR HOTEL, Y NINGUNA COMPARTIDA ──────────────────────────
 * La propiedad de Cloudbeds cuelga de `negocio_id`, igual que las otras
 * diecisiete tablas de Experience. Dos hoteles no comparten propiedad y la
 * base lo impide: intentar ligar a un hotel el número que ya es de otro
 * devuelve `property_id_de_otro_hotel` en vez de robárselo en silencio.
 *
 * Hasta el 26 de noviembre quedaba un hueco: el servidor caía en una llave
 * general cuando al hotel le faltaba la suya. Tony: «cada hotel es una
 * propiedad totalmente independiente (…) no puede revolverse una con otra en
 * absolutamente nada». Esa caída ya no existe, y el servidor comprueba
 * además que la llave sea DE ESE hotel: pegar la de HUMAYA en Bike & Bed
 * rebota con `llave_de_otro_hotel`.
 *
 * ── GUARDAR LA LLAVE ES CONECTAR EL HOTEL ──────────────────────────────
 * Tony, 26 de noviembre: «se supone que al pegar la llave automáticamente se
 * tiene que hacer eso, ¿o me equivoco?». No se equivocaba. `guardarLlave`
 * guarda y además prueba la llave, registra los webhooks y trae las reservas
 * que ya existían. Antes eso eran tres acciones de servidor que no llamaba
 * ninguna pantalla, y las 68 de HUMAYA entraron porque alguien las invocó a
 * mano: desde fuera parecía que pegar la llave las traía.
 *
 * ── LA LLAVE NO VUELVE ─────────────────────────────────────────────────
 * `estado()` dice si hay llave y de cuándo es, nunca cuál es. Se guarda en
 * la bóveda de Postgres y solo la lee el servidor. Un secreto que la
 * pantalla puede volver a mostrar dejó de ser un secreto.
 */

const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';

export interface HotelCloudbeds {
  negocioId: string;
  codigo: string;
  nombre: string;
  /** De dónde entran sus reservas, según la ficha del hotel. */
  origen: string;
  /** Su número de propiedad en Cloudbeds, o null si nadie lo ha puesto. */
  propertyId: string | null;
  llavePropia: boolean;
  /** Cuándo se guardó la llave propia, para saber si es la vieja. */
  llaveDesde: string | null;
  reservas: number;
}

/** Los motivos que devuelve la base, para poder explicar cada uno. */
export type FalloCloudbeds =
  | 'solo_plataforma'
  | 'property_id_invalido'
  | 'property_id_de_otro_hotel'
  | 'hotel_no_existe'
  | 'propiedad_no_registrada'
  | 'llave_vacia'
  | 'llave_muy_corta'
  | 'sin_llave'
  | 'llave_rechazada'
  | 'llave_de_otro_hotel'
  | 'no_contesto'
  | 'desconocido';

export class ErrorCloudbeds extends Error {
  readonly motivo: FalloCloudbeds;
  /** Lo que contó el servidor, cuando sirve para entender el fallo. */
  readonly detalle: string | null;
  /**
   * Si la llave alcanzó a guardarse antes del fallo.
   *
   * Cambia qué hacer: con la llave guardada basta reintentar, y pedírsela de
   * nuevo sería pedir algo que Cloudbeds ya no muestra — la enseña una sola
   * vez. Sin ella hay que volver a pegarla.
   */
  readonly llaveGuardada: boolean;

  constructor(motivo: FalloCloudbeds, detalle: string | null = null, llaveGuardada = false) {
    super(motivo);
    this.name = 'ErrorCloudbeds';
    this.motivo = motivo;
    this.detalle = detalle;
    this.llaveGuardada = llaveGuardada;
  }
}

/**
 * Los motivos que llegan como texto dentro del mensaje de Postgres.
 *
 * El orden importa: se devuelve el primero que aparezca en el mensaje, así
 * que un motivo que contenga a otro como texto tiene que ir antes.
 */
export const MOTIVOS: FalloCloudbeds[] = [
  'solo_plataforma',
  'property_id_de_otro_hotel',
  'property_id_invalido',
  'hotel_no_existe',
  'propiedad_no_registrada',
  'llave_muy_corta',
  'llave_vacia',
];

export function motivoDe(mensaje: string | undefined): FalloCloudbeds {
  return MOTIVOS.find((m) => (mensaje ?? '').includes(m)) ?? 'desconocido';
}

/** Los motivos que devuelve la función del servidor, por nombre exacto. */
const DEL_SERVIDOR = new Set<string>([
  'solo_plataforma',
  'property_id_invalido',
  'propiedad_no_registrada',
  'sin_llave',
  'llave_rechazada',
  'llave_de_otro_hotel',
]);

/** Lo que pasó al conectar el hotel con Cloudbeds. */
export interface Sincronizacion {
  ok: boolean;
  propertyId: string;
  /** Las propiedades que alcanza esa llave, según Cloudbeds. */
  alcanza: { propertyId: string; nombre: string }[];
  webhooks: { ok: boolean; registrados: string[]; faltan: string[] };
  reservas: {
    encontradas: number;
    guardadas: number;
    sinCorreo: number;
    fallaron: number;
    hayMas: boolean;
  };
}

export async function estadoCloudbeds(): Promise<HotelCloudbeds[]> {
  const db = await cliente();
  const { data, error } = await db.rpc('humaya_cloudbeds_estado');
  if (error) throw new Error('cloudbeds_no_se_pudo_leer');
  return ((data ?? []) as Record<string, unknown>[]).map((f) => ({
    negocioId: String(f.negocio_id),
    codigo: String(f.codigo ?? ''),
    nombre: String(f.nombre ?? ''),
    origen: String(f.origen_reservas ?? 'ninguno'),
    propertyId: (f.property_id as string | null) ?? null,
    llavePropia: f.llave_propia === true,
    llaveDesde: (f.llave_propia_desde as string | null) ?? null,
    reservas: Number(f.reservas ?? 0),
  }));
}

export async function conectarHotel(negocioId: string, propertyId: string): Promise<void> {
  const db = await cliente();
  const { error } = await db.rpc('humaya_cloudbeds_conectar', {
    p_negocio: negocioId,
    p_property_id: propertyId.trim(),
  });
  if (error) throw new ErrorCloudbeds(motivoDe(error.message));
}

/**
 * Prueba la llave contra Cloudbeds, registra los webhooks y trae las reservas
 * que ya existían. Es lo que corre solo después de guardar una llave.
 *
 * Se llama aparte de `guardarLlave` a propósito: si Cloudbeds está caído, la
 * llave ya quedó guardada y se puede reintentar esto sin volver a pedírsela a
 * nadie — Cloudbeds la muestra una sola vez.
 */
export async function sincronizarHotel(propertyId: string): Promise<Sincronizacion> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${FN_BASE}/cloudbeds-conectar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await cabeceraDeRecepcion()) },
      body: JSON.stringify({ property_id: propertyId.trim() }),
    });
  } catch {
    throw new ErrorCloudbeds('no_contesto');
  }

  const cuerpo = (await respuesta.json().catch(() => null)) as Record<string, unknown> | null;

  if (!respuesta.ok || !cuerpo) {
    const nombre = String(cuerpo?.error ?? '');
    throw new ErrorCloudbeds(
      DEL_SERVIDOR.has(nombre) ? (nombre as FalloCloudbeds) : 'no_contesto',
      typeof cuerpo?.detalle === 'string' ? cuerpo.detalle : null,
    );
  }

  const llave = (cuerpo.llave ?? {}) as Record<string, unknown>;
  const webhooks = (cuerpo.webhooks ?? {}) as Record<string, unknown>;
  const reservas = (cuerpo.reservas ?? {}) as Record<string, unknown>;
  const alcanza = Array.isArray(llave.alcanza) ? (llave.alcanza as Record<string, unknown>[]) : [];

  return {
    ok: cuerpo.ok === true,
    propertyId: String(cuerpo.property_id ?? propertyId),
    alcanza: alcanza.map((h) => ({
      propertyId: String(h.property_id ?? ''),
      nombre: String(h.nombre ?? ''),
    })),
    webhooks: {
      ok: webhooks.ok === true,
      registrados: Array.isArray(webhooks.registrados) ? (webhooks.registrados as string[]) : [],
      faltan: Array.isArray(webhooks.faltan) ? (webhooks.faltan as string[]) : [],
    },
    reservas: {
      encontradas: Number(reservas.encontradas ?? 0),
      guardadas: Number(reservas.guardadas ?? 0),
      sinCorreo: Number(reservas.sin_correo ?? 0),
      fallaron: Number(reservas.fallaron ?? 0),
      hayMas: reservas.hay_mas === true,
    },
  };
}

/**
 * Guarda la llave del hotel y lo deja funcionando: prueba, suscribe y trae.
 *
 * Si la llave se guarda pero la sincronización falla, el error sale con
 * `llaveGuardada: true`. Esa diferencia es la que necesita la pantalla: con
 * la llave adentro, reintentar alcanza; sin ella hay que volver a pegarla, y
 * Cloudbeds la muestra una sola vez.
 */
export async function guardarLlave(propertyId: string, llave: string): Promise<Sincronizacion> {
  const db = await cliente();
  const { error } = await db.rpc('humaya_cloudbeds_guardar_llave', {
    p_property_id: propertyId.trim(),
    p_llave: llave.trim(),
  });
  if (error) throw new ErrorCloudbeds(motivoDe(error.message));

  try {
    return await sincronizarHotel(propertyId);
  } catch (e) {
    if (e instanceof ErrorCloudbeds) throw new ErrorCloudbeds(e.motivo, e.detalle, true);
    throw new ErrorCloudbeds('no_contesto', null, true);
  }
}
