/**
 * El único lugar donde vive "hoy" en los datos de ejemplo.
 *
 * ── POR QUÉ YA NO ES UNA FECHA FIJA ─────────────────────────────────────
 * Lo era: sábado 14 de noviembre de 2026. El 20 de noviembre, probando la app
 * desde un teléfono, se pudo **reservar entrenamiento personal para el 14** —
 * seis días atrás— y la reserva se guardó en la base. No era un fallo del
 * selector de días: era que toda la demo vivía esa semana y la semana ya
 * había pasado. Cada día que corría, la distancia crecía.
 *
 * Ahora "hoy" es hoy de verdad, y **todas las fechas de ejemplo son
 * desplazamientos respecto de él**: Valeria siempre llega hoy, los Beltrán
 * siempre salen hoy, la entrevista siempre se contestó hace cinco días. La
 * demo no vuelve a envejecer.
 *
 * ── POR QUÉ SE CALCULA UNA SOLA VEZ ─────────────────────────────────────
 * Es una constante de módulo a propósito. Si se recalculara en cada llamada,
 * una sesión abierta cruzando la medianoche vería cambiar las fechas debajo
 * de los pies, y una prueba podría empezar un día y terminar el siguiente.
 *
 * ── POR QUÉ EN HORA DE COSTA RICA ───────────────────────────────────────
 * Porque el hotel está en Costa Rica. Con el huso del navegador, a las 7 de
 * la noche en San José ya sería mañana en Europa y la demo mostraría el día
 * equivocado a quien la abra desde allá.
 */

const CALENDARIO = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Costa_Rica',
});

/** Hoy, en Costa Rica, como YYYY-MM-DD. `en-CA` da exactamente ese formato. */
export const TODAY: string = CALENDARIO.format(new Date());

/** Fecha ISO (solo el día) desplazada n días respecto de hoy. */
export function daysFromToday(days: number): string {
  const date = new Date(`${TODAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Hora oficial de Costa Rica. */
const CR = '-06:00';

/**
 * Un instante de la demo: n días desde hoy, a esa hora, en Costa Rica.
 *
 * Es el reemplazo de las fechas literales. `momentoDemo(0, '15:00')` es
 * "hoy a las 3 de la tarde" para siempre, y no "el 14 de noviembre de 2026".
 */
export function momentoDemo(days: number, time: string): string {
  return `${daysFromToday(days)}T${time}:00${CR}`;
}

/** Días que faltan entre hoy y una fecha ISO. Negativo si ya pasó. */
export function daysUntil(isoDate: string): number {
  const from = Date.parse(`${TODAY}T00:00:00Z`);
  const to = Date.parse(`${isoDate.slice(0, 10)}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

export function isToday(isoDate: string): boolean {
  return isoDate.slice(0, 10) === TODAY;
}
