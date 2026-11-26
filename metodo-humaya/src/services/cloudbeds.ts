import { cliente } from './sesion';

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
 * ── UNA LLAVE POR HOTEL, COMO TODO LO DEMÁS ────────────────────────────
 * La propiedad de Cloudbeds cuelga de `negocio_id`, igual que las otras
 * diecisiete tablas de Experience. Dos hoteles no comparten propiedad y la
 * base lo impide: intentar ligar a un hotel el número que ya es de otro
 * devuelve `property_id_de_otro_hotel` en vez de robárselo en silencio.
 *
 * ── LA LLAVE NO VUELVE ─────────────────────────────────────────────────
 * `estado()` dice si hay llave y de cuándo es, nunca cuál es. Se guarda en
 * la bóveda de Postgres y solo la lee el servidor. Un secreto que la
 * pantalla puede volver a mostrar dejó de ser un secreto.
 */

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
  /** Si existe la llave general, que sirve de respaldo para todos. */
  llaveGeneral: boolean;
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
  | 'desconocido';

export class ErrorCloudbeds extends Error {
  readonly motivo: FalloCloudbeds;
  constructor(motivo: FalloCloudbeds) {
    super(motivo);
    this.name = 'ErrorCloudbeds';
    this.motivo = motivo;
  }
}

const MOTIVOS: FalloCloudbeds[] = [
  'solo_plataforma',
  'property_id_de_otro_hotel',
  'property_id_invalido',
  'hotel_no_existe',
  'propiedad_no_registrada',
  'llave_muy_corta',
  'llave_vacia',
];

function motivoDe(mensaje: string | undefined): FalloCloudbeds {
  return MOTIVOS.find((m) => (mensaje ?? '').includes(m)) ?? 'desconocido';
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
    llaveGeneral: f.llave_general === true,
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

export async function guardarLlave(propertyId: string, llave: string): Promise<void> {
  const db = await cliente();
  const { error } = await db.rpc('humaya_cloudbeds_guardar_llave', {
    p_property_id: propertyId.trim(),
    p_llave: llave.trim(),
  });
  if (error) throw new ErrorCloudbeds(motivoDe(error.message));
}
