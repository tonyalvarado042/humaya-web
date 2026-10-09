/** Textos de la pantalla Llegadas. Desde la Fase 5 se mudan a src/i18n/. */
export const arrivalsCopy = {
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
  ofArrivals: (total: number) => `de ${total}`,

  colGuest: 'Huésped',
  colVilla: 'Villa',
  colArrival: 'Llegada',
  colPeople: 'Personas',
  colInterview: 'Entrevista',
  colAlerts: 'A tener en cuenta',

  seeProfile: 'Ver perfil',
  people: (count: number) => (count === 1 ? '1 persona' : `${count} personas`),

  conciergeUnread: (count: number) =>
    count === 1
      ? '1 mensaje sin leer en el Concierge'
      : `${count} mensajes sin leer en el Concierge`,

  interviewComplete: 'Completa',
  interviewPending: 'Pendiente',
  interviewInProgress: (answered: number, total: number) => `En curso · ${answered}/${total}`,

  villasTitle: 'Villas',
  prepareTitle: 'Preparar hoy',
  prepareEmpty: 'No queda nada por preparar hoy.',

  emptyTitle: 'No hay llegadas en este período',
  emptyBody: 'Probá con otro filtro: mañana o el resto de la semana.',
  loading: 'las llegadas',
  tableLabel: 'Llegadas del período',
};
