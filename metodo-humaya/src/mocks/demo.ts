/**
 * Qué estadía mira la app del huésped. No hay login: la Fase 3 va a poner un
 * selector para pasar de una a otra durante la demo.
 *
 * Las dos cuentan historias distintas a propósito: Valeria ya llega hoy y con
 * la entrevista completa; Hannah llega en 5 días y la tiene a medias, que es el
 * estado que muestra el prototipo de Inicio.
 */
export const DEFAULT_STAY_ID = 's-mendez-rojas';

export interface DemoStay {
  stayId: string;
  guestName: string;
  arrivalOffsetDays: number;
}

export const DEMO_STAYS: DemoStay[] = [
  { stayId: 's-mendez-rojas', guestName: 'Valeria', arrivalOffsetDays: 0 },
  { stayId: 's-weber', guestName: 'Hannah', arrivalOffsetDays: 5 },
];
