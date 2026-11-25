import type { ArrivalRange, InterviewDepth, SpaFacility } from '@/types';

/**
 * Todas las claves de TanStack Query en un solo lugar, como pide ARCHITECTURE.md.
 * Las mutaciones invalidan usando estas mismas funciones, nunca cadenas sueltas.
 */
export const queryKeys = {
  arrivals: (range: ArrivalRange) => ['arrivals', range] as const,
  /** Los ajustes del hotel: hoy, el interruptor del demo. */
  ajustes: () => ['ajustes'] as const,
  /** La marca del hotel: nombres, colores y letras. */
  marcaDelHotel: () => ['marca-del-hotel'] as const,
  /** Las reservas reales de Cloudbeds, no las llegadas de la demo. */
  reservas: (filtro: string, hoy: string) => ['reservas', filtro, hoy] as const,
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
  conciergeMessages: (stayId: string) => ['concierge-messages', stayId] as const,
  conciergeConversations: () => ['concierge-conversations'] as const,

  weeklyProgram: () => ['weekly-program'] as const,
  workoutSession: (sessionId: string) => ['workout-session', sessionId] as const,

  adminOpciones: (onlyEnabled: boolean) => ['admin-opciones', onlyEnabled] as const,
  adminServicios: (onlyEnabled: boolean) => ['admin-servicios', onlyEnabled] as const,
  servicioSlots: (servicioId: string, fecha: string) =>
    ['servicio-slots', servicioId, fecha] as const,

  /** La portada interna del hotel: los enlaces que usa su equipo. */
  enlaces: (soloHabilitados: boolean) => ['enlaces', soloHabilitados] as const,

  /** Las pantallas de los televisores de las villas. */
  villasTv: () => ['villas-tv'] as const,
  ajustesTv: () => ['ajustes-tv'] as const,
  alrededorTv: () => ['alrededor-tv'] as const,

  /** La agenda real de recepción: lo que hay reservado entre dos fechas. */
  agendaPorServicio: (desde: string, hasta: string) =>
    ['agenda-por-servicio', desde, hasta] as const,
};

/** Prefijos que hay que invalidar cuando cambia algo del spa. */
export const spaPrefixes = [['spa-slots'], ['spa-schedule'], ['spa-stay-bookings']] as const;
