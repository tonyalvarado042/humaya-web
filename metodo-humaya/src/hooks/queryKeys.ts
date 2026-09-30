import type { ArrivalRange, InterviewDepth, SpaFacility } from '@/types';

/**
 * Todas las claves de TanStack Query en un solo lugar, como pide ARCHITECTURE.md.
 * Las mutaciones invalidan usando estas mismas funciones, nunca cadenas sueltas.
 */
export const queryKeys = {
  arrivals: (range: ArrivalRange) => ['arrivals', range] as const,
  stay: (stayId: string) => ['stay', stayId] as const,
  villaStatus: (date: string) => ['villa-status', date] as const,

  guestProfile: (stayId: string) => ['guest-profile', stayId] as const,
  alerts: (stayId: string) => ['alerts', stayId] as const,
  privacyConsent: (stayId: string) => ['privacy-consent', stayId] as const,

  interviewQuestions: (depth: InterviewDepth) => ['interview-questions', depth] as const,
  interviewAnswers: (stayId: string) => ['interview-answers', stayId] as const,
  interviewProgress: (stayId: string, depth: InterviewDepth) =>
    ['interview-progress', stayId, depth] as const,

  wows: (stayId: string) => ['wows', stayId] as const,
  wowsDueBy: (date: string) => ['wows-due-by', date] as const,
  pendingWowCount: (date: string) => ['wows-pending-count', date] as const,

  spaSlots: (facility: SpaFacility, date: string) => ['spa-slots', facility, date] as const,
  spaSchedule: (date: string) => ['spa-schedule', date] as const,
  stayBookings: (stayId: string) => ['spa-stay-bookings', stayId] as const,

  villaInfo: (stayId: string) => ['villa-info', stayId] as const,
  protocolTips: (stayId: string) => ['protocol-tips', stayId] as const,
  conciergeMessages: () => ['concierge-messages'] as const,

  weeklyProgram: () => ['weekly-program'] as const,
  workoutSession: (sessionId: string) => ['workout-session', sessionId] as const,
};

/** Prefijos que hay que invalidar cuando cambia algo del spa. */
export const spaPrefixes = [['spa-slots'], ['spa-schedule'], ['spa-stay-bookings']] as const;
