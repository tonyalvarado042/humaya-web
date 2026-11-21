import type { Locale, LocalizedText, Pillar } from './common';
import type { InterviewAnswer } from './interview';
import type { Stay } from './stay';

export interface Companion {
  name: string;
  relation?: string;
  age?: number;
}

export interface Guest {
  id: string;
  fullName: string;
  companions: Companion[];
  locale: Locale;
  source: 'waitlist' | 'direct' | 'ota';
  consent: {
    privacyAcceptedAt?: string;
    whatsappOptIn: boolean;
  };
}

export type AlertKind = 'allergy' | 'celebration' | 'info';

export interface GuestAlert {
  kind: AlertKind;
  label: LocalizedText;
}

/** Lo que el equipo sabe de un pilar, a partir de la entrevista. */
export interface PillarSummary {
  pillar: Pillar;
  text: string;
}

/** Un hito del HUMAYA Experience en la línea de tiempo del perfil. */
/**
 * Un hito de la linea de tiempo del HUMAYA Experience.
 *
 * Trae los HECHOS, no la frase: el texto lo arma la pantalla en su idioma.
 * Tenia `label` y `when` ya escritos —«Preparacion pre-llegada», «dia 7 de
 * 7»—, siempre en espanol, y con recepcion en ingles la linea de tiempo
 * quedaba en espanol en medio de una pantalla traducida.
 */
export interface TimelineEvent {
  id: string;
  done: boolean;
  /** La fecha ISO del hito, o null cuando todavia no hay. */
  date: string | null;
  /** Solo la entrevista: cuantas respondio de cuantas. */
  interview?: { answered: number; total: number; complete: boolean };
  /** Solo la preparacion: en que dia de los siete va. */
  prepDay?: number | null;
}

/** Todo lo que la pantalla Perfil del huésped necesita, en una sola llamada. */
export interface GuestProfile {
  stayId: string;
  guest: Guest;
  stay: Stay;
  alerts: GuestAlert[];
  /** Cómo pidió que lo atendamos, en sus palabras. */
  preferredCare: string;
  pillars: PillarSummary[];
  timeline: TimelineEvent[];
  answers: InterviewAnswer[];
  teamNotes: string;
}
