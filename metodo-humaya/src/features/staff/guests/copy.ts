/**
 * Textos de la lista de huéspedes, en los dos idiomas de recepción.
 *
 * ── POR QUÉ ESTA PANTALLA NO ES «RESERVAS» OTRA VEZ ─────────────────────
 * Reservas mira el libro: quién llega, de qué OTA, con qué código, a quién le
 * falta correo. Mira hacia adelante. Huéspedes mira a las personas que están
 * en la casa AHORA, que es lo que necesita quien atiende el mostrador: en qué
 * noche va cada uno, quién se va mañana, en qué villa está.
 */
export interface GuestsTextos {
  title: string;
  subtitulo: string;

  cuandoLabel: string;
  enCasa: string;
  lleganHoy: string;
  seVanHoy: string;

  statPersonas: string;
  statVillas: string;
  statSeVanManana: string;

  colHuesped: string;
  colVilla: string;
  colMomento: string;
  tablaLabel: string;

  sinVilla: string;
  personas: (cuantas: number) => string;
  noche: (dia: number, noches: number) => string;
  llegaHoy: string;
  seVaHoy: string;
  seVaManana: string;

  vacioEnCasa: string;
  vacioLleganHoy: string;
  vacioSeVanHoy: string;
  vacioCuerpo: string;
  cargando: string;

  sinFichaPorQue: string;
}

export const guestsCopy: Record<'es' | 'en', GuestsTextos> = {
  es: {
    title: 'Huéspedes',
    subtitulo: 'Quiénes están en la casa, y en qué momento de su estadía van.',

    cuandoLabel: 'A quiénes mirar',
    enCasa: 'En casa',
    lleganHoy: 'Llegan hoy',
    seVanHoy: 'Se van hoy',

    statPersonas: 'Personas',
    statVillas: 'Villas ocupadas',
    statSeVanManana: 'Se van mañana',

    colHuesped: 'Huésped',
    colVilla: 'Villa',
    colMomento: 'En qué va',
    tablaLabel: 'Huéspedes',

    sinVilla: 'sin villa asignada',
    personas: (cuantas) => (cuantas === 1 ? '1 persona' : `${cuantas} personas`),
    noche: (dia, noches) => `Noche ${dia} de ${noches}`,
    llegaHoy: 'Llega hoy',
    seVaHoy: 'Se va hoy',
    seVaManana: 'Se va mañana',

    vacioEnCasa: 'No hay nadie en la casa hoy',
    vacioLleganHoy: 'Hoy no llega nadie',
    vacioSeVanHoy: 'Hoy no se va nadie',
    vacioCuerpo: 'Esto sale de las reservas reales de Cloudbeds, no de la demo.',
    cargando: 'los huéspedes',

    sinFichaPorQue:
      'La ficha del huésped —alergias, entrevista, celebraciones— todavía solo existe para las dos estadías de la demo. Para una reserva real de Cloudbeds no hay nada que abrir, y por eso no se ofrece el botón.',
  },
  en: {
    title: 'Guests',
    subtitulo: 'Who is in the house, and where they are in their stay.',

    cuandoLabel: 'Who to look at',
    enCasa: 'In house',
    lleganHoy: 'Arriving today',
    seVanHoy: 'Leaving today',

    statPersonas: 'People',
    statVillas: 'Villas in use',
    statSeVanManana: 'Leaving tomorrow',

    colHuesped: 'Guest',
    colVilla: 'Villa',
    colMomento: 'Where they are',
    tablaLabel: 'Guests',

    sinVilla: 'no villa assigned',
    personas: (cuantas) => (cuantas === 1 ? '1 person' : `${cuantas} people`),
    noche: (dia, noches) => `Night ${dia} of ${noches}`,
    llegaHoy: 'Arrives today',
    seVaHoy: 'Leaves today',
    seVaManana: 'Leaves tomorrow',

    vacioEnCasa: 'Nobody is in the house today',
    vacioLleganHoy: 'Nobody arrives today',
    vacioSeVanHoy: 'Nobody leaves today',
    vacioCuerpo: 'This comes from the real Cloudbeds bookings, not from the demo.',
    cargando: 'guests',

    sinFichaPorQue:
      'The guest profile — allergies, interview, celebrations — still only exists for the two demo stays. There is nothing to open for a real Cloudbeds booking, which is why the button is not offered.',
  },
};
