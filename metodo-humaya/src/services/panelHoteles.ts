import { cliente } from './sesion';

/**
 * El panel de súper admin: crear hoteles y decir quién trabaja en cada uno.
 *
 * ── DE DÓNDE SALE ──────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «dónde está el panel súper admin para
 * crear nuevos hoteles, voy a crear uno. Este debe dejarme seleccionar si
 * conecta con airbnb o con cloud beds etc». Y: los hoteles nuevos van en
 * liderax10.
 *
 * Hasta hoy crear un hotel era meter filas a mano en la base, y asignar
 * quién entra no se hacía en ninguna parte: `cta_usuario_negocios` tenía
 * CERO filas.
 *
 * ── EL PERMISO LO EXIGE LA BASE ────────────────────────────────────────
 * Todas estas funciones son `security definer` y preguntan primero si quien
 * llama es súper admin. Probado contra la API: un anónimo y una cuenta con
 * rol `administrador` que NO es de plataforma reciben `solo_plataforma`.
 * Esconder el botón en la pantalla es cortesía, no protección.
 */

/** De dónde entran las reservas. Los mismos nombres que usa X10 Vision. */
export type OrigenReservas = 'ninguno' | 'cloudbeds' | 'airbnb_ical';

export interface HotelDelPanel {
  negocioId: string;
  codigo: string;
  nombre: string;
  marcaHotel: string;
  marcaExperiencia: string;
  correo: string;
  origen: OrigenReservas;
  esDemo: boolean;
  activo: boolean;
  usuarios: number;
  reservas: number;
}

export interface MiembroDelEquipo {
  usuarioId: string;
  correo: string;
  nombre: string | null;
  rol: string | null;
  asignado: boolean;
}

/** Los motivos que la base devuelve, para poder explicarlos en la pantalla. */
export type FalloAlCrear =
  | 'codigo_invalido'
  | 'codigo_reservado'
  | 'codigo_ocupado'
  | 'origen_invalido'
  | 'solo_plataforma'
  | 'desconocido';

export class ErrorAlCrearHotel extends Error {
  readonly motivo: FalloAlCrear;
  constructor(motivo: FalloAlCrear) {
    super(motivo);
    this.name = 'ErrorAlCrearHotel';
    this.motivo = motivo;
  }
}

const MOTIVOS: FalloAlCrear[] = [
  'codigo_invalido',
  'codigo_reservado',
  'codigo_ocupado',
  'origen_invalido',
  'solo_plataforma',
];

function motivoDe(mensaje: string | undefined): FalloAlCrear {
  const encontrado = MOTIVOS.find((m) => (mensaje ?? '').includes(m));
  return encontrado ?? 'desconocido';
}

/**
 * Si quien entró manda sobre todos los hoteles.
 *
 * NUNCA lanza, y falla cerrado: ante cualquier duda, no es de plataforma.
 * Esto lo llama el menú de Admin en cada carga, así que una excepción acá
 * tumbaría una pantalla entera por un enlace de más. Y fallar cerrado es lo
 * correcto además por seguridad: en la duda, no se ofrece el panel.
 */
export async function soyPlataforma(): Promise<boolean> {
  try {
    const db = await cliente();
    const { data, error } = await db.rpc('humaya_soy_plataforma');
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

export async function todosLosHoteles(): Promise<HotelDelPanel[]> {
  const db = await cliente();
  const { data, error } = await db.rpc('humaya_hoteles_todos');
  if (error) throw new Error('hoteles_no_se_pudieron_leer');
  return ((data ?? []) as Record<string, unknown>[]).map((f) => ({
    negocioId: String(f.negocio_id),
    codigo: String(f.codigo),
    nombre: String(f.nombre ?? ''),
    marcaHotel: String(f.marca_hotel ?? ''),
    marcaExperiencia: String(f.marca_experiencia ?? ''),
    correo: String(f.correo ?? ''),
    origen: (f.origen_reservas as OrigenReservas) ?? 'ninguno',
    esDemo: f.es_demo === true,
    activo: f.activo !== false,
    usuarios: Number(f.usuarios ?? 0),
    reservas: Number(f.reservas ?? 0),
  }));
}

export interface HotelNuevo {
  codigo: string;
  nombre: string;
  marcaHotel: string;
  marcaExperiencia: string;
  correo: string;
  origen: OrigenReservas;
}

export async function crearHotel(hotel: HotelNuevo): Promise<string> {
  const db = await cliente();
  const { data, error } = await db.rpc('humaya_crear_hotel', {
    p_codigo: hotel.codigo.trim().toLowerCase(),
    p_nombre: hotel.nombre.trim(),
    p_marca_hotel: hotel.marcaHotel.trim(),
    p_marca_experiencia: hotel.marcaExperiencia.trim(),
    p_correo: hotel.correo.trim(),
    p_origen: hotel.origen,
  });
  if (error) throw new ErrorAlCrearHotel(motivoDe(error.message));
  return String(data);
}

export async function cambiarOrigen(negocioId: string, origen: OrigenReservas): Promise<void> {
  const db = await cliente();
  const { error } = await db.rpc('humaya_cambiar_origen', {
    p_negocio: negocioId,
    p_origen: origen,
  });
  if (error) throw new Error('no_se_pudo_cambiar_el_origen');
}

export async function equipoDelHotel(negocioId: string): Promise<MiembroDelEquipo[]> {
  const db = await cliente();
  const { data, error } = await db.rpc('humaya_equipo_del_hotel', { p_negocio: negocioId });
  if (error) throw new Error('equipo_no_se_pudo_leer');
  return ((data ?? []) as Record<string, unknown>[]).map((f) => ({
    usuarioId: String(f.usuario_id),
    correo: String(f.email ?? ''),
    nombre: (f.nombre as string | null) ?? null,
    rol: (f.rol as string | null) ?? null,
    asignado: f.asignado === true,
  }));
}

export async function asignarAlHotel(
  negocioId: string,
  usuarioId: string,
  asignado: boolean,
): Promise<void> {
  const db = await cliente();
  const { error } = await db.rpc('humaya_asignar_al_hotel', {
    p_negocio: negocioId,
    p_usuario: usuarioId,
    p_asignado: asignado,
  });
  if (error) throw new Error('no_se_pudo_asignar');
}

/**
 * La dirección del huésped de un hotel, para poder copiarla y mandarla.
 *
 * Los hoteles nuevos viven en el dominio compartido, como pidió Tony: «debe
 * ser en lidera los hoteles nuevos».
 */
export function puertaDelHuesped(codigo: string, dominio: string): string {
  return `${dominio}/${codigo}`;
}
