import type { Hotel } from './hotel';
import { cliente } from './sesion';
import { comoTema } from './tema';

/**
 * Los hoteles que puede ver quien entró a recepción.
 *
 * ── POR QUÉ EXISTE ──────────────────────────────────────────────────────
 * En el dominio del huésped el hotel lo dice la ruta: `/demo/app` es el
 * hotel `demo`. En el dominio de recepción no hay nada que lo diga —
 * `hotelexp.liderax10.com/staff` es la misma dirección para todos los
 * hoteles—, así que tiene que decirlo la cuenta.
 *
 * `src/services/hotel.ts` ya lo anunciaba: «del lado de recepción lo dice la
 * cuenta, y eso se resuelve después de entrar». Nunca se escribió. El
 * resultado, comprobado entrando el 24 de noviembre de 2026: `elNegocio()`
 * lanzaba `sin_hotel_resuelto` y TODAS las pantallas de recepción mostraban
 * «No pudimos cargar esta pantalla · Puede ser un problema de conexión».
 *
 * Esa pantalla mentía dos veces: no era un problema de conexión, y no era
 * pasajero. No había ni una petición a la base — fallaba antes de pedir
 * nada. Reintentar no podía arreglarlo nunca.
 *
 * ── POR QUÉ ESTO NO VIVE EN hotel.ts ────────────────────────────────────
 * Porque `hotel.ts` evita a propósito el cliente de Supabase: el huésped
 * entra sin cuenta y no tiene por qué descargar el SDK de Auth. Esto sí lo
 * necesita —la respuesta depende de quién sos— y solo lo llama recepción,
 * que ya lo tiene cargado.
 *
 * ── QUIÉN VE QUÉ ────────────────────────────────────────────────────────
 * Lo decide la base, no esta pantalla: `humaya_hoteles_de_la_cuenta()` es
 * `security definer` y filtra por `auth.uid()`. Un súper admin
 * (`es_plataforma`) ve todos; los demás, los suyos en
 * `cta_usuario_negocios`. Probado contra la API: un anónimo recibe `[]`.
 */

interface FilaHotel {
  negocio_id: string;
  codigo: string;
  marca_experiencia: string | null;
  marca_hotel: string | null;
  correo: string | null;
  tema: unknown;
  es_demo: boolean | null;
}

/** Dónde se recuerda el hotel elegido, para no preguntarlo en cada visita. */
export const LLAVE_HOTEL = 'humaya.recepcion.hotel';

export async function misHoteles(): Promise<Hotel[]> {
  const db = await cliente();
  const { data, error } = await db.rpc('humaya_hoteles_de_la_cuenta');
  if (error) throw new Error('hoteles_no_se_pudieron_leer');
  return ((data ?? []) as FilaHotel[]).map((f) => ({
    negocioId: f.negocio_id,
    codigo: f.codigo,
    marcaExperiencia: f.marca_experiencia ?? '',
    marcaHotel: f.marca_hotel ?? '',
    correo: f.correo ?? '',
    tema: comoTema(f.tema),
    esDemo: f.es_demo ?? false,
  }));
}

/** El código del hotel que esta persona eligió la vez pasada, si lo hizo. */
export function hotelRecordado(): string | null {
  try {
    return localStorage.getItem(LLAVE_HOTEL);
  } catch {
    // Ventana privada o almacenamiento bloqueado: se vuelve a preguntar.
    return null;
  }
}

export function recordarHotel(codigo: string): void {
  try {
    localStorage.setItem(LLAVE_HOTEL, codigo);
  } catch {
    // Sin almacenamiento recepción sirve igual; solo pregunta cada vez.
  }
}

export function olvidarHotel(): void {
  try {
    localStorage.removeItem(LLAVE_HOTEL);
  } catch {
    // Nada que hacer: si no se pudo borrar, tampoco se pudo guardar.
  }
}

/**
 * Cuál de los hoteles se abre.
 *
 * Uno solo: ese, sin preguntar. Varios: el recordado, si todavía está en la
 * lista. Si el recordado ya no está —le quitaron el acceso, o el hotel se
 * fue— se devuelve null y se vuelve a preguntar, en vez de abrir el de otro.
 */
export function cualAbrir(hoteles: Hotel[], recordado: string | null): Hotel | null {
  if (hoteles.length === 1) return hoteles[0]!;
  if (!recordado) return null;
  return hoteles.find((h) => h.codigo === recordado) ?? null;
}
