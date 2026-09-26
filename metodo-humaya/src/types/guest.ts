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

/** Un hito del Método Humaya en la línea de tiempo del perfil. */
export interface TimelineEvent {
  id: string;
  label: string;
  when: string;
  done: boolean;
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
