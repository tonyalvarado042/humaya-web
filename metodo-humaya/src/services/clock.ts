import { daysUntil as mockDaysUntil, TODAY } from '@/mocks';

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
