import type { Stay } from '@/types';

/** Hora oficial de Costa Rica. */
const CR = '-06:00';

const at = (isoDate: string, time: string) => `${isoDate}T${time}:00${CR}`;

/**
 * Las 9 estadías del prototipo más las 5 que explican el tablero de villas:
 * los Beltrán salen hoy de la 01 y las otras cuatro son las villas que el
 * dashboard marca como ocupadas esta noche.
 */
export const STAYS: Stay[] = [
  {
    id: 's-mendez-rojas',
    guestId: 'g-mendez-rojas',
    villa: 4,
    checkIn: at('2026-11-14', '15:00'),
    checkOut: at('2026-11-17', '11:00'),
    partySize: 2,
    status: 'upcoming',
    prepDay: 7,
  },
  {
    id: 's-keller',
    guestId: 'g-keller',
    villa: 7,
    checkIn: at('2026-11-14', '16:30'),
    checkOut: at('2026-11-19', '11:00'),
    partySize: 4,
    status: 'upcoming',
    prepDay: 7,
  },
  {
    id: 's-durand',
    guestId: 'g-durand',
    villa: 2,
    checkIn: at('2026-11-14', '17:00'),
    checkOut: at('2026-11-18', '11:00'),
    partySize: 1,
    status: 'upcoming',
    prepDay: 7,
  },
  {
    id: 's-whitfield',
    guestId: 'g-whitfield',
    villa: 9,
    checkIn: at('2026-11-14', '19:30'),
    checkOut: at('2026-11-16', '11:00'),
    partySize: 2,
    status: 'upcoming',
    prepDay: 7,
  },
  {
    id: 's-arias',
    guestId: 'g-arias',
    villa: 1,
    checkIn: at('2026-11-15', '14:00'),
    checkOut: at('2026-11-18', '11:00'),
    partySize: 2,
    status: 'upcoming',
    prepDay: 6,
  },
  {
    id: 's-bianchi',
    guestId: 'g-bianchi',
    villa: 5,
    checkIn: at('2026-11-15', '15:30'),
    checkOut: at('2026-11-17', '11:00'),
    partySize: 1,
    status: 'upcoming',
    prepDay: 6,
  },
  {
    id: 's-morales',
    guestId: 'g-morales',
    villa: 10,
    checkIn: at('2026-11-15', '16:00'),
    checkOut: at('2026-11-17', '11:00'),
    partySize: 3,
    status: 'upcoming',
    prepDay: 6,
  },
  {
    id: 's-weber',
    guestId: 'g-weber',
    villa: 3,
    checkIn: at('2026-11-19', '14:00'),
    checkOut: at('2026-11-22', '11:00'),
    partySize: 1,
    status: 'upcoming',
    prepDay: 5,
  },
  {
    id: 's-solis',
    guestId: 'g-solis',
    villa: 6,
    checkIn: at('2026-11-20', '15:00'),
    checkOut: at('2026-11-23', '11:00'),
    partySize: 2,
    status: 'upcoming',
    prepDay: 4,
  },
  {
    id: 's-beltran',
    guestId: 'g-beltran',
    villa: 1,
    checkIn: at('2026-11-11', '15:00'),
    checkOut: at('2026-11-14', '11:00'),
    partySize: 2,
    status: 'in_house',
  },
  {
    id: 's-zamora',
    guestId: 'g-zamora',
    villa: 3,
    checkIn: at('2026-11-11', '15:00'),
    checkOut: at('2026-11-16', '11:00'),
    partySize: 2,
    status: 'in_house',
  },
  {
    id: 's-farah',
    guestId: 'g-farah',
    villa: 5,
    checkIn: at('2026-11-10', '15:00'),
    checkOut: at('2026-11-15', '11:00'),
    partySize: 2,
    status: 'in_house',
  },
  {
    id: 's-lima',
    guestId: 'g-lima',
    villa: 8,
    checkIn: at('2026-11-12', '15:00'),
    checkOut: at('2026-11-17', '11:00'),
    partySize: 1,
    status: 'in_house',
  },
  {
    id: 's-lindqvist',
    guestId: 'g-lindqvist',
    villa: 10,
    checkIn: at('2026-11-12', '15:00'),
    checkOut: at('2026-11-15', '11:00'),
    partySize: 2,
    status: 'in_house',
  },
];

/** Las 10 villas del hotel. */
export const VILLA_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
