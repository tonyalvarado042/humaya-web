import { daysUntil as mockDaysUntil, TODAY } from '@/mocks';
import { ahora } from './reloj';

/**
 * La fecha que el sistema considera "hoy". Hoy sale de los datos de ejemplo;
 * cuando exista backend va a venir del servidor. Las pantallas y los hooks la
 * piden por acá para no tocar mocks/ directamente.
 */
export function getToday(): string {
  return TODAY;
}

/** Días que faltan entre hoy y una fecha ISO. Negativo si ya pasó. */
export function daysUntil(isoDate: string): number {
  return mockDaysUntil(isoDate);
}

const CALENDARIO = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'America/Costa_Rica',
});

/**
 * El día de verdad, en Costa Rica, como YYYY-MM-DD.
 *
 * ── POR QUÉ NO SIRVE getToday() ─────────────────────────────────────────
 * `getToday()` devuelve el "hoy" de los datos de ejemplo —el 14 de noviembre
 * de 2026— y eso es correcto para la demo: las dos estadías inventadas pasan
 * esa semana. Pero una agenda que lee reservas REALES de la base no puede
 * abrir en una fecha inventada: recepción vería el día vacío y concluiría que
 * nadie reservó nada.
 *
 * ── POR QUÉ `en-CA` ─────────────────────────────────────────────────────
 * Porque formatea exactamente YYYY-MM-DD, que es como guarda la fecha la
 * columna `fecha`. Armarlo a mano con getFullYear/getMonth daría el día del
 * navegador, que a las 11 de la noche en Costa Rica ya es mañana en UTC.
 *
 * La hora viene de `ahora()`, corregida contra el servidor: el reloj de la
 * máquina de Tony iba 4 minutos adelantado, y a las 23:58 eso cambia el día.
 */
export function hoyEnCostaRica(): string {
  return CALENDARIO.format(new Date(ahora()));
}

const RELOJ = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Costa_Rica',
});

/**
 * Ahora, en Costa Rica, como "YYYY-MM-DDTHH:MM".
 *
 * Se arma así para poder comparar con texto: la agenda guarda `fecha` y
 * `hora_inicio` en columnas separadas, y `"2026-11-17T14:00" > "2026-11-17T09:00"`
 * ordena igual que el tiempo. Construir un Date por reserva para compararlo
 * sería inventar un huso que la base no guarda.
 */
export function ahoraEnCostaRica(): string {
  const momento = new Date(ahora());
  return `${CALENDARIO.format(momento)}T${RELOJ.format(momento)}`;
}

/** El día siguiente de una fecha YYYY-MM-DD. Cuenta en UTC, sin husos. */
export function diaSiguiente(fecha: string): string {
  const dia = new Date(`${fecha}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + 1);
  return dia.toISOString().slice(0, 10);
}

/** `cuantos` días desde `desde`, inclusive. */
export function diasDesde(desde: string, cuantos: number): string[] {
  const dias: string[] = [];
  let cursor = desde;
  for (let i = 0; i < cuantos; i += 1) {
    dias.push(cursor);
    cursor = diaSiguiente(cursor);
  }
  return dias;
}
