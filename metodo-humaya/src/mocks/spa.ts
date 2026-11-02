import type { SpaSlot } from '@/types';

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
 * El 15 de noviembre es la agenda que muestra el prototipo de recepción, con dos
 * correcciones: los turnos de las 6:00 eran de Luca Bianchi y Hannah Weber, que
 * ese día todavía no habían llegado. Pasan a los huéspedes que ya están en casa.
 */
export const SEED_BOOKINGS: SpaSlot[] = [
  slot('sauna', '2026-11-15', '06:00', 's-farah'),
  slot('cold_plunge', '2026-11-15', '06:00', 's-zamora'),
  slot('cold_plunge', '2026-11-15', '07:00', 's-mendez-rojas'),
  slot('sauna', '2026-11-15', '08:00', 's-keller'),
  slot('sauna', '2026-11-15', '17:00', 's-mendez-rojas'),
  slot('cold_plunge', '2026-11-15', '17:00', 's-durand'),
  slot('sauna', '2026-11-15', '18:00', 's-whitfield'),
  slot('cold_plunge', '2026-11-15', '19:00', 's-bianchi'),
  slot('sauna', '2026-11-15', '20:00', 's-morales'),

  slot('sauna', '2026-11-14', '17:00', 's-lima'),
  slot('cold_plunge', '2026-11-14', '18:00', 's-zamora'),

  slot('sauna', '2026-11-16', '07:00', 's-keller'),
  slot('cold_plunge', '2026-11-16', '16:00', 's-arias'),
  slot('sauna', '2026-11-16', '19:00', 's-bianchi'),

  slot('cold_plunge', '2026-11-17', '08:00', 's-arias'),
  slot('sauna', '2026-11-17', '18:00', 's-keller'),
];
