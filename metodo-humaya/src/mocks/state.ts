import type { InterviewAnswer, SpaSlot, WowExperience } from '@/types';
import { SEED_ANSWERS } from './interview';
import { PROFILES } from './profiles';
import { SEED_BOOKINGS } from './spa';
import { SEED_WOWS } from './wow';

/**
 * Estado mutable de los datos de ejemplo. Vive en memoria mientras dura la
 * sesión: por eso una reserva hecha en /app aparece en la agenda de /staff.
 *
 * Solo services/ toca esto. Los tests lo devuelven a cero con resetMockState().
 */
interface MockState {
  answers: Record<string, InterviewAnswer[]>;
  wows: WowExperience[];
  bookings: SpaSlot[];
  teamNotes: Record<string, string>;
  /** Consentimientos dados durante la sesión, por estadía. */
  privacyAcceptedAt: Record<string, string>;
}

function seed(): MockState {
  return {
    answers: structuredClone(SEED_ANSWERS),
    wows: structuredClone(SEED_WOWS),
    bookings: structuredClone(SEED_BOOKINGS),
    teamNotes: Object.fromEntries(
      Object.entries(PROFILES).map(([stayId, profile]) => [stayId, profile.teamNotes]),
    ),
    privacyAcceptedAt: {},
  };
}

export const state: MockState = seed();

/** Devuelve los datos de ejemplo a su estado inicial. Lo usan los tests. */
export function resetMockState(): void {
  Object.assign(state, seed());
}
