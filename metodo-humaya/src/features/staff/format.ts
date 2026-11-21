import type { Idioma } from '@/hooks/useIdiomaElegido';

/** Formatos compartidos por las pantallas de recepción. */

/**
 * El locale que le toca a cada idioma de recepción.
 *
 * ── POR QUÉ EXISTE, EN VEZ DE UN TERNARIO EN CADA PANTALLA ──────────────
 * Porque estaba escrito a mano, pantalla por pantalla, y una se lo olvidó:
 * Huéspedes pedía la fecha sin idioma el 21 de noviembre de 2026 y salía
 * «SÁBADO 21 DE NOVIEMBRE» arriba de una pantalla en inglés. Con una sola
 * función, cambiar un locale es un cambio en un lugar.
 */
export function localeDe(idioma: Idioma): string {
  return idioma === 'es' ? 'es-CR' : 'en-US';
}

/** "Villa 04" a partir del número de villa. */
export function villaName(villa: number): string {
  return `Villa ${String(villa).padStart(2, '0')}`;
}

/**
 * "Sábado 14 de noviembre, 2026" — el formato del prototipo.
 *
 * Se arma por partes a propósito: `Intl` con todo junto devuelve
 * "sábado, 14 de noviembre de 2026", con la coma en otro lugar.
 *
 * ── POR QUÉ EL LOCALE ES OBLIGATORIO ────────────────────────────────────
 * Tenía `locale = 'es-CR'` por omisión, y una fecha en español nunca se ve
 * «rota»: se ve como una fecha. Así pasó inadvertido que Huéspedes la pedía
 * sin idioma y la pantalla en inglés mostraba el día en español. Sin valor
 * por omisión, al que se le olvide no le compila — que es justo cuándo hay
 * que enterarse.
 */
export function longDate(iso: string, locale: string): string {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00-06:00`);
  const timeZone = 'America/Costa_Rica';

  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }).format(date);
  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(date);
  const year = new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format(date);

  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dayMonth}, ${year}`;
}

/** "3:00 p.m." — como lo escribe el prototipo. Mismo motivo: sin omisión. */
export function timeLabel(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Costa_Rica',
  }).format(new Date(iso));
}

/** "VA" a partir de "Valeria Méndez y Andrés Rojas". */
export function initials(fullName: string): string {
  const words = fullName.split(' ').filter((word) => word.length > 2 && word !== 'y');
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}
