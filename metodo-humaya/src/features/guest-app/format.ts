/** Formatos compartidos por las pantallas del huésped. */

/** "Villa 04" a partir del número de villa. */
export function villaName(villa: number): string {
  return `Villa ${String(villa).padStart(2, '0')}`;
}

/** "Sáb 14 nov" */
export function shortDate(iso: string, locale = 'es-CR'): string {
  const text = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Costa_Rica',
  }).format(new Date(iso));

  // Intl devuelve "sáb, 14 nov"; el prototipo no lleva coma ni punto.
  const clean = text.replace(/[.,]/g, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** "Dom" y "15 nov", para los botones de día de Reservas. */
export function dayParts(iso: string, locale = 'es-CR'): { weekday: string; day: string } {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00-06:00`);
  const weekday = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'America/Costa_Rica',
  }).format(date);

  const day = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Costa_Rica',
  }).format(date);

  return {
    weekday: (weekday.charAt(0).toUpperCase() + weekday.slice(1)).replace(/[.,]/g, ''),
    day: day.replace(/[.,]/g, ''),
  };
}

/** "17:00" a partir de un instante ISO. */
export function timeLabel(iso: string, locale = 'es-CR'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Costa_Rica',
  }).format(new Date(iso));
}

/** El nombre de pila, para el saludo. "Valeria Méndez y Andrés Rojas" da "Valeria". */
export function firstName(fullName: string): string {
  return fullName.split(' ')[0];
}
