/**
 * El único lugar donde vive "hoy" en los datos de ejemplo.
 * Sábado 14 de noviembre de 2026, como fija CLAUDE.md.
 */
export const TODAY = '2026-11-14';

/** Fecha ISO (solo el día) desplazada n días respecto de hoy. */
export function daysFromToday(days: number): string {
  const date = new Date(`${TODAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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
