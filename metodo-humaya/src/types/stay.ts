import type { GuestAlert } from './guest';
import type { InterviewProgress } from './interview';
import type { Locale } from './common';

export type StayStatus = 'upcoming' | 'in_house' | 'checked_out';

export interface Stay {
  id: string;
  guestId: string;
  /** Número de villa, del 1 al 10. */
  villa: number;
  checkIn: string;
  checkOut: string;
  partySize: number;
  status: StayStatus;
  /** Día del protocolo de 7 días previo a la llegada. */
  prepDay?: number;
}

export type ArrivalRange = 'today' | 'tomorrow' | 'week';

/** Fila de la tabla de Llegadas, ya armada para la pantalla. */
export interface Arrival {
  stayId: string;
  guestName: string;
  locale: Locale;
  villa: number;
  checkIn: string;
  partySize: number;
  interview: InterviewProgress;
  alerts: GuestAlert[];
}

export type VillaState = 'arriving' | 'occupied' | 'departing' | 'free';

/** Estado de una villa en una fecha, para el tablero de recepción. */
export interface VillaStatus {
  villa: number;
  state: VillaState;
  label: string;
  stayId?: string;
}
