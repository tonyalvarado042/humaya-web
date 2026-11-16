/**
 * Los textos de la vista DEMO de Llegadas: las dos estadías de ejemplo, con su
 * progreso de entrevista, sus alertas y el tablero de las diez villas.
 *
 * Tony, 15 de noviembre de 2026: «el demo debería quedar como opción temporal
 * hasta que yo lo publique o en settings lo quite». Así que esto no se borra:
 * vive detrás del interruptor `demo_visible` de Admin.
 *
 * Queda en español, que es como nació. Lo que se tradujo al inglés es la vista
 * real —las reservas de Cloudbeds—, que es la que va a usar recepción.
 */
export const demoCopy = {
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
