import { cliente } from './sesion';
import { elNegocio } from './negocio';

/**
 * Las reservas de verdad, las que vienen de Cloudbeds.
 *
 * ── POR QUÉ LEE DIRECTO DE LA BASE Y NO POR UNA EDGE FUNCTION ───────────
 * Porque RLS ya hace el trabajo. Las políticas de `humaya_cloudbeds_reservas`
 * exigen un rol del CRM, y la vista `humaya_llegadas` las hereda
 * (security_invoker). Un anónimo con la llave publicable en la mano no saca ni
 * una fila — comprobado contra la API, no supuesto. Una función en el medio
 * solo agregaría un lugar donde equivocarse.
 *
 * ── LO QUE ESTA PANTALLA NO SABE ────────────────────────────────────────
 * Cloudbeds no guarda la entrevista, ni las alertas, ni los "wow". Esas
 * columnas existen en los datos de ejemplo de la demo y NO se rellenan acá con
 * nada inventado: lo que no tenemos, no se muestra.
 */

export type EstadoReserva = 'confirmed' | 'not_confirmed' | 'canceled' | string;

export interface Reserva {
  id: string;
  reservaId: string;
  huesped: string;
  /** Null cuando la OTA nunca nos dio un correo utilizable. */
  email: string | null;
  checkin: string;
  checkout: string;
  estado: EstadoReserva;
  /** De dónde vino: Airbnb, Expedia, Booking.com, el sitio… */
  fuente: string | null;
  /** El código que el huésped tiene en la mano, el de su OTA. */
  codigoOta: string | null;
  /** El nombre de habitación que manda Cloudbeds. Null si no asignaron. */
  villa: string | null;
  /** Adultos + niños. Null cuando no hay habitación asignada. */
  personas: number | null;
}

interface FilaLlegada {
  id: string;
  reserva_id: string;
  huesped: string;
  email: string | null;
  checkin: string;
  checkout: string;
  estado: string;
  fuente: string | null;
  confirmacion_ota: string | null;
  villa: string | null;
  personas: number | string | null;
}

function aReserva(fila: FilaLlegada): Reserva {
  return {
    id: fila.id,
    reservaId: fila.reserva_id,
    huesped: fila.huesped,
    email: fila.email,
    checkin: fila.checkin,
    checkout: fila.checkout,
    estado: fila.estado,
    fuente: fila.fuente,
    codigoOta: fila.confirmacion_ota,
    villa: fila.villa,
    // Postgres devuelve sum() como texto: viene de un bigint y en JavaScript
    // no siempre cabe. Acá sí cabe —son personas en una villa—, pero hay que
    // convertirlo igual o la pantalla sumaría cadenas.
    personas: fila.personas === null ? null : Number(fila.personas),
  };
}

export type FiltroReservas = 'proximas' | 'todas' | 'sin_correo';

/**
 * Las reservas para recepción, de la más próxima a la más lejana.
 *
 * `proximas` deja fuera las canceladas y lo que ya pasó, que es lo que recepción
 * mira el 99 % del tiempo. `sin_correo` es la lista de trabajo: a quién hay que
 * pedirle un correo para poder escribirle antes de que llegue.
 */
export async function getReservas(
  filtro: FiltroReservas = 'proximas',
  hoy: string = new Date().toISOString().slice(0, 10),
): Promise<Reserva[]> {
  const db = await cliente();
  let consulta = db.from('humaya_llegadas').select('*').eq('negocio_id', elNegocio());

  if (filtro !== 'todas') {
    consulta = consulta.neq('estado', 'canceled').gte('checkout', hoy);
  }
  if (filtro === 'sin_correo') {
    consulta = consulta.is('email', null);
  }

  const { data, error } = await consulta.order('checkin', { ascending: true });
  if (error) throw new Error(`reservas_${error.code ?? 'error'}`);

  return ((data ?? []) as FilaLlegada[]).map(aReserva);
}

export interface ResumenReservas {
  /** Reservas activas que todavía no terminaron. */
  proximas: number;
  /** De esas, cuántas no tienen un correo al que escribirles. */
  sinCorreo: number;
  /** Personas esperadas en esas reservas. */
  personas: number;
  /** La fecha de la próxima llegada, o null si no hay ninguna por delante. */
  primeraLlegada: string | null;
}

export function resumirReservas(reservas: Reserva[], hoy: string): ResumenReservas {
  const porDelante = reservas.filter(
    (reserva) => reserva.estado !== 'canceled' && reserva.checkout >= hoy,
  );
  const siguientes = porDelante
    .filter((reserva) => reserva.checkin >= hoy)
    .map((reserva) => reserva.checkin)
    .sort();

  return {
    proximas: porDelante.length,
    sinCorreo: porDelante.filter((reserva) => !reserva.email).length,
    personas: porDelante.reduce((suma, reserva) => suma + (reserva.personas ?? 0), 0),
    primeraLlegada: siguientes[0] ?? null,
  };
}
