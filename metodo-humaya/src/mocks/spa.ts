import type { SpaSlot } from '@/types';
import { daysFromToday } from './today';

/** Horarios que abre el spa, mañana y tarde. */
export const SPA_HOURS = [
  '06:00',
  '07:00',
  '08:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

export const DURATION = { sauna: 45, cold_plunge: 20 } as const;

const slot = (
  facility: 'sauna' | 'cold_plunge',
  date: string,
  time: string,
  stayId: string,
): SpaSlot => ({
  facility,
  start: `${date}T${time}:00-06:00`,
  durationMin: DURATION[facility],
  stayId,
});

/**
 * Reservas ya hechas.
 *
 * La agenda llena del prototipo cae MAÑANA —`daysFromToday(1)`—, con dos
 * correcciones: los turnos de las 6:00 eran de Luca Bianchi y Hannah Weber,
 * que ese día todavía no habían llegado. Pasan a los huéspedes que ya están
 * en casa.
 */
export const SEED_BOOKINGS: SpaSlot[] = [
  slot('sauna', daysFromToday(1), '06:00', 's-farah'),
  slot('cold_plunge', daysFromToday(1), '06:00', 's-zamora'),
  slot('cold_plunge', daysFromToday(1), '07:00', 's-mendez-rojas'),
  slot('sauna', daysFromToday(1), '08:00', 's-keller'),
  slot('sauna', daysFromToday(1), '17:00', 's-mendez-rojas'),
  slot('cold_plunge', daysFromToday(1), '17:00', 's-durand'),
  slot('sauna', daysFromToday(1), '18:00', 's-whitfield'),
  slot('cold_plunge', daysFromToday(1), '19:00', 's-bianchi'),
  slot('sauna', daysFromToday(1), '20:00', 's-morales'),

  slot('sauna', daysFromToday(0), '17:00', 's-lima'),
  slot('cold_plunge', daysFromToday(0), '18:00', 's-zamora'),

  slot('sauna', daysFromToday(2), '07:00', 's-keller'),
  slot('cold_plunge', daysFromToday(2), '16:00', 's-arias'),
  slot('sauna', daysFromToday(2), '19:00', 's-bianchi'),

  slot('cold_plunge', daysFromToday(3), '08:00', 's-arias'),
  slot('sauna', daysFromToday(3), '18:00', 's-keller'),
];
