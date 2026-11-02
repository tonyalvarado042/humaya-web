/** Formatos compartidos por las pantallas de recepción. */

/** "Villa 04" a partir del número de villa. */
export function villaName(villa: number): string {
  return `Villa ${String(villa).padStart(2, '0')}`;
}

/**
 * "Sábado 14 de noviembre, 2026" — el formato del prototipo.
 *
 * Se arma por partes a propósito: `Intl` con todo junto devuelve
 * "sábado, 14 de noviembre de 2026", con la coma en otro lugar.
 */
export function longDate(iso: string, locale = 'es-CR'): string {
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

/** "3:00 p.m." — como lo escribe el prototipo. */
export function timeLabel(iso: string, locale = 'es-CR'): string {
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
