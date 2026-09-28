export type SpaFacility = 'sauna' | 'cold_plunge';

export interface SpaSlot {
  facility: SpaFacility;
  start: string;
  durationMin: 45 | 20;
  /** Vacío = libre. */
  stayId?: string;
}

/** Una reserva ya resuelta con el nombre del huésped, para la agenda. */
export interface SpaBooking {
  stayId: string;
  guestName: string;
  villa: number;
}

/** Una hora de la agenda del día, con las dos instalaciones al lado. */
export interface SpaScheduleRow {
  time: string;
  sauna: SpaBooking | null;
  coldPlunge: SpaBooking | null;
}

export interface SpaSchedule {
  date: string;
  rows: SpaScheduleRow[];
}
