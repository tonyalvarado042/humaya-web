import type { ReservaDeServicio, ServicioConReservas } from '@/types';
import { cliente } from './sesion';

/**
 * La agenda real de servicios reservados.
 *
 * ── POR QUÉ ESTE ARCHIVO EXISTE ─────────────────────────────────────────
 * Comprobado el 17 de noviembre de 2026: la app del huésped ya reserva de
 * verdad —escribe en `humaya_servicio_reservas`— y recepción no tenía NINGUNA
 * pantalla que leyera esa tabla. `/staff/spa` mostraba la agenda de ejemplo
 * del 15 de noviembre, con nombres inventados. Una reserva de verdad entraba
 * y nadie se enteraba.
 *
 * ── POR QUÉ NO PASA POR LA EDGE FUNCTION ────────────────────────────────
 * Va directo a la tabla con la llave publicable, como `editarServicio`. Quien
 * decide si se puede leer es RLS: la política `humaya_servicio_reservas_equipo`
 * exige un rol del CRM. Una función que use la llave de servicio tendría que
 * volver a comprobar a mano lo que la base ya comprueba sola.
 *
 * ── POR QUÉ UNA SOLA FUNCIÓN DE LECTURA ─────────────────────────────────
 * La pantalla tiene dos vistas —por hora y por servicio— y las dos salen de
 * los mismos datos. Dos consultas distintas podrían contestar distinto por
 * una reserva que entró en el medio, y entonces la misma pantalla se
 * contradiría sola. Se lee una vez y se ordena acá abajo, con funciones
 * puras que se pueden probar sin navegador.
 */

interface FilaReserva {
  id: string;
  servicio_id: string;
  stay_id: string;
  guest_name: string;
  fecha: string;
  hora_inicio: string;
}

interface FilaServicio {
  id: string;
  nombre: string;
  proveedor: string | null;
  duracion_min: number;
  habilitado: boolean;
  orden: number;
}

/** La columna guarda HH:MM:SS a veces y HH:MM otras; se muestra HH:MM. */
const soloHoraYMinuto = (hora: string) => hora.slice(0, 5);

/** Para comparar y ordenar: "2026-11-17T14:00". */
export const cuando = (reserva: ReservaDeServicio) => `${reserva.fecha}T${reserva.horaInicio}`;

async function leerCatalogo(): Promise<FilaServicio[]> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_servicios')
    .select('id,nombre,proveedor,duracion_min,habilitado,orden')
    .order('orden', { ascending: true });

  if (error) throw new Error(`agenda_catalogo_${error.code ?? 'error'}`);
  return (data ?? []) as unknown as FilaServicio[];
}

async function leerReservas(
  desde: string,
  hasta: string,
  catalogo: FilaServicio[],
): Promise<ReservaDeServicio[]> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_servicio_reservas')
    .select('id,servicio_id,stay_id,guest_name,fecha,hora_inicio')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  if (error) throw new Error(`agenda_reservas_${error.code ?? 'error'}`);

  const porId = new Map(catalogo.map((servicio) => [servicio.id, servicio]));

  return ((data ?? []) as unknown as FilaReserva[]).map((fila) => {
    const servicio = porId.get(fila.servicio_id);
    return {
      id: fila.id,
      servicioId: fila.servicio_id,
      servicioNombre: servicio?.nombre ?? null,
      proveedor: servicio?.proveedor ?? null,
      duracionMin: servicio?.duracion_min ?? null,
      stayId: fila.stay_id,
      guestName: fila.guest_name,
      fecha: fila.fecha.slice(0, 10),
      horaInicio: soloHoraYMinuto(fila.hora_inicio),
    };
  });
}

/**
 * El catálogo con las reservas de cada servicio, entre dos fechas inclusive.
 *
 * Incluye los servicios SIN reservas: que el entrenador no tenga a nadie
 * mañana es información, no una fila que sobra. Y al final, los servicios que
 * ya no están en el catálogo pero tienen gente anotada — porque esa persona
 * va a llegar a su hora aunque alguien haya borrado la fila. Un join interno
 * la escondería, que es la peor forma de fallar: en silencio.
 */
export async function agendaPorServicio(
  desde: string,
  hasta: string,
): Promise<ServicioConReservas[]> {
  const catalogo = await leerCatalogo();
  const reservas = await leerReservas(desde, hasta, catalogo);
  return agrupar(catalogo, reservas);
}

function agrupar(catalogo: FilaServicio[], reservas: ReservaDeServicio[]): ServicioConReservas[] {
  const ordenadas = [...reservas].sort((a, b) => cuando(a).localeCompare(cuando(b)));

  const grupos: ServicioConReservas[] = catalogo.map((servicio) => ({
    servicioId: servicio.id,
    nombre: servicio.nombre,
    proveedor: servicio.proveedor,
    habilitado: servicio.habilitado,
    reservas: ordenadas.filter((reserva) => reserva.servicioId === servicio.id),
  }));

  const conocidos = new Set(catalogo.map((servicio) => servicio.id));
  for (const reserva of ordenadas.filter((r) => !conocidos.has(r.servicioId))) {
    const ya = grupos.find((grupo) => grupo.servicioId === reserva.servicioId);
    if (ya) {
      ya.reservas.push(reserva);
      continue;
    }
    grupos.push({
      servicioId: reserva.servicioId,
      nombre: reserva.servicioNombre ?? '',
      proveedor: null,
      habilitado: false,
      reservas: [reserva],
    });
  }

  return grupos;
}

/** Todas las reservas de la agenda, en el orden en que tocan. */
export function enOrdenDeHora(grupos: ServicioConReservas[]): ReservaDeServicio[] {
  return grupos
    .flatMap((grupo) => grupo.reservas)
    .sort((a, b) => cuando(a).localeCompare(cuando(b)));
}

/**
 * La primera que todavía no empezó, o null si ya pasaron todas.
 *
 * `momento` es "YYYY-MM-DDTHH:MM" en hora de Costa Rica. Se compara como
 * texto: con ese formato, el orden alfabético ES el orden del tiempo.
 */
export function laProxima(
  reservas: ReservaDeServicio[],
  momento: string,
): ReservaDeServicio | null {
  return reservas.find((reserva) => cuando(reserva) >= momento) ?? null;
}
