import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * Los textos de la vista DEMO de Llegadas: las dos estadías de ejemplo, con su
 * progreso de entrevista, sus alertas y el tablero de las diez villas.
 *
 * Tony, 15 de noviembre de 2026: «el demo debería quedar como opción temporal
 * hasta que yo lo publique o en settings lo quite». Así que esto no se borra:
 * vive detrás del interruptor `demo_visible` de Admin.
 *
 * ── POR QUÉ YA NO «QUEDA EN ESPAÑOL» ────────────────────────────────────
 * Acá decía: «Queda en español, que es como nació. Lo que se tradujo al
 * inglés es la vista real». Tenía una falla de bulto: el demo no es otra
 * pantalla, es una PESTAÑA MÁS de Llegadas. Con recepción en inglés, apretar
 * «Demo» cambiaba el idioma de la mitad de abajo y dejaba las pestañas y los
 * números en inglés. Tony, 21 de noviembre de 2026: recepción entera en los
 * dos idiomas.
 */
export interface DemoTextos {
  title: string;
  rangeLabel: string;
  today: string;
  tomorrow: string;
  week: string;

  statArrivals: string;
  statOccupancy: string;
  statInterviews: string;
  statWows: string;
  ofTen: string;
  ofArrivals: (total: number) => string;

  colGuest: string;
  colVilla: string;
  colArrival: string;
  colPeople: string;
  colInterview: string;
  colAlerts: string;

  seeProfile: string;
  people: (count: number) => string;

  conciergeUnread: (count: number) => string;

  interviewComplete: string;
  interviewPending: string;
  interviewInProgress: (answered: number, total: number) => string;

  villasTitle: string;
  prepareTitle: string;
  prepareEmpty: string;
  /** Estaba escrito dentro del JSX, en español, fuera de este archivo. */
  antesDeLas: (hora: string) => string;

  emptyTitle: string;
  emptyBody: string;
  loading: string;
  tableLabel: string;
}

export const demoCopy: Record<Idioma, DemoTextos> = {
  es: {
    title: 'Llegadas',
    rangeLabel: 'Periodo',
    today: 'Hoy',
    tomorrow: 'Mañana',
    week: 'Esta semana',

    statArrivals: 'Llegadas hoy',
    statOccupancy: 'Ocupación esta noche',
    statInterviews: 'Entrevistas completas',
    statWows: 'Experiencias WOW por preparar',
    ofTen: 'de 10',
    ofArrivals: (total) => `de ${total}`,

    colGuest: 'Huésped',
    colVilla: 'Villa',
    colArrival: 'Llegada',
    colPeople: 'Personas',
    colInterview: 'Entrevista',
    colAlerts: 'A tener en cuenta',

    seeProfile: 'Ver perfil',
    people: (count) => (count === 1 ? '1 persona' : `${count} personas`),

    conciergeUnread: (count) =>
      count === 1
        ? '1 mensaje sin leer en el Concierge'
        : `${count} mensajes sin leer en el Concierge`,

    interviewComplete: 'Completa',
    interviewPending: 'Pendiente',
    interviewInProgress: (answered, total) => `En curso · ${answered}/${total}`,

    villasTitle: 'Villas',
    prepareTitle: 'Preparar hoy',
    prepareEmpty: 'No queda nada por preparar hoy.',
    antesDeLas: (hora) => `antes de las ${hora}`,

    emptyTitle: 'No hay llegadas en este período',
    emptyBody: 'Probá con otro filtro: mañana o el resto de la semana.',
    loading: 'las llegadas',
    tableLabel: 'Llegadas del período',
  },

  en: {
    title: 'Arrivals',
    rangeLabel: 'Period',
    today: 'Today',
    tomorrow: 'Tomorrow',
    week: 'This week',

    statArrivals: 'Arrivals today',
    statOccupancy: 'Occupancy tonight',
    statInterviews: 'Interviews complete',
    statWows: 'WOW experiences to prepare',
    ofTen: 'of 10',
    ofArrivals: (total) => `of ${total}`,

    colGuest: 'Guest',
    colVilla: 'Villa',
    colArrival: 'Arrival',
    colPeople: 'People',
    colInterview: 'Interview',
    colAlerts: 'Keep in mind',

    seeProfile: 'View profile',
    people: (count) => (count === 1 ? '1 person' : `${count} people`),

    conciergeUnread: (count) =>
      count === 1
        ? '1 unread message in the Concierge'
        : `${count} unread messages in the Concierge`,

    interviewComplete: 'Complete',
    interviewPending: 'Pending',
    interviewInProgress: (answered, total) => `In progress · ${answered}/${total}`,

    villasTitle: 'Villas',
    prepareTitle: 'Prepare today',
    prepareEmpty: 'Nothing left to prepare today.',
    antesDeLas: (hora) => `before ${hora}`,

    emptyTitle: 'There are no arrivals in this period',
    emptyBody: 'Try another filter: tomorrow, or the rest of the week.',
    loading: 'the arrivals',
    tableLabel: 'Arrivals in the period',
  },
};
