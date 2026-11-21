import type { Idioma } from '@/hooks/useIdiomaElegido';

/** El texto de la ficha del huésped y de las notas internas. */
export interface PanelTextos {
  escribeIngles: string;
  escribeEspanol: string;
  esperando: (cuanto: string) => string;
  recienAhora: string;
  minutos: (n: number) => string;
  horas: (n: number) => string;
  dias: (n: number) => string;

  llegaEnDias: (n: number) => string;
  llegaHoy: (hora: string) => string;
  diaDe: (dia: number, noches: number) => string;
  seVaManana: (hora: string) => string;
  seVaHoy: (hora: string) => string;
  seFue: (n: number) => string;

  villa: string;
  personas: (n: number) => string;
  con: string;

  cuidado: string;
  celebra: string;
  presente: string;

  comoAtenderlo: string;
  sinEntrevista: string;

  yaNosDijo: (n: number) => string;
  yaNosDijoAyuda: string;
  yaReservo: (n: number) => string;
  sinReservas: string;
  reservasNoCargaron: string;
  fichaCompleta: string;

  pilares: Record<string, string>;
  instalaciones: Record<string, string>;

  sinAsignar: string;
  leToca: (quien: string) => string;
  tomar: string;
  soltar: string;
  noSePudo: string;

  cargando: string;
  sinFichaTitulo: string;
  sinFichaCuerpo: string;
  reintentar: string;

  notasTitulo: string;
  notasTitulo_: (n: number) => string;
  notasCuerpo: string;
  notasVacio: string;
  notaLabel: string;
  notaPlaceholder: string;
  anotar: string;
  borrar: string;
  alguien: string;
}

/**
 * Los nombres de los pilares del método NO se traducen.
 *
 * Son nombre propio, igual que «HUMAYA Experience»: van iguales en inglés y
 * en español en la ficha completa, en las experiencias WOW y acá. Traducirlos
 * en una sola pantalla le daría al equipo dos vocabularios para lo mismo.
 */
const PILARES: Record<string, string> = {
  move: 'Move',
  nourish: 'Nourish',
  connect: 'Connect',
  create: 'Create',
  believe: 'Believe',
};

export const panelCopy: Record<Idioma, PanelTextos> = {
  es: {
    escribeIngles: 'Escribe en inglés',
    escribeEspanol: 'Escribe en español',
    esperando: (cuanto) => `Esperando hace ${cuanto}`,
    recienAhora: 'un momento',
    minutos: (n) => (n === 1 ? '1 minuto' : `${n} minutos`),
    horas: (n) => (n === 1 ? '1 hora' : `${n} horas`),
    dias: (n) => (n === 1 ? '1 día' : `${n} días`),

    // ── El reloj de la estadía ────────────────────────────────────────
    llegaEnDias: (n) => (n === 1 ? 'Llega mañana' : `Llega en ${n} días`),
    llegaHoy: (hora) => `Llega hoy a las ${hora}`,
    diaDe: (dia, noches) => `Día ${dia} de ${noches === 1 ? '1 noche' : `${noches} noches`}`,
    seVaManana: (hora) => `se va mañana a las ${hora}`,
    seVaHoy: (hora) => `Se va hoy a las ${hora}`,
    seFue: (n) => (n === 1 ? 'Se fue ayer' : `Se fue hace ${n} días`),

    // ── Quién es ──────────────────────────────────────────────────────
    villa: 'Villa',
    personas: (n) => (n === 1 ? '1 persona' : `${n} personas`),
    con: 'Con:',

    // ── Lo que no se puede olvidar ────────────────────────────────────
    cuidado: 'Nunca olvidar',
    celebra: 'Está celebrando',
    presente: 'Tener presente',

    // ── En sus palabras ───────────────────────────────────────────────
    comoAtenderlo: 'Cómo pidió que lo atendamos',
    sinEntrevista: 'Todavía no completaron la entrevista.',

    // ── Lo que ya sabemos ─────────────────────────────────────────────
    yaNosDijo: (n) => `Lo que ya nos dijo · ${n}`,
    yaNosDijoAyuda: 'Salió de su entrevista. Si está acá, no hay que volver a preguntarlo.',
    yaReservo: (n) => `Lo que ya reservó · ${n}`,
    sinReservas: 'Todavía no reservó nada.',
    reservasNoCargaron: 'No pudimos leer sus reservas. No es que no tenga: no lo sabemos.',
    fichaCompleta: 'Abrir la ficha completa',

    pilares: PILARES,
    instalaciones: {
      sauna: 'Sauna',
      cold_plunge: 'Cold plunge',
      pool: 'Piscina',
      gym: 'Gimnasio',
    },

    // ── Quién la atiende ──────────────────────────────────────────────
    sinAsignar: 'Nadie la tomó todavía.',
    leToca: (quien) => `Le toca a ${quien}.`,
    tomar: 'Tomar esta conversación',
    soltar: 'Soltarla',
    noSePudo: 'No se pudo guardar. Probá de nuevo.',

    // ── Cuando la ficha no carga ──────────────────────────────────────
    cargando: 'Cargando la ficha…',
    sinFichaTitulo: 'No pudimos cargar la ficha de este huésped.',
    sinFichaCuerpo:
      'Contestá si podés, pero sin ver sus alergias ni lo que ya nos dijo. Recargá la pantalla antes de prometer algo.',
    reintentar: 'Reintentar',

    // ── Notas del equipo ──────────────────────────────────────────────
    notasTitulo: 'Notas del equipo',
    notasTitulo_: (n) => (n > 0 ? `Notas del equipo · ${n}` : 'Notas del equipo'),
    notasCuerpo:
      'Solo las ve el equipo. El huésped nunca las lee: viven en otra tabla que su chat.',
    notasVacio: 'Todavía no hay notas sobre esta conversación.',
    notaLabel: 'Una nota para el equipo',
    notaPlaceholder: 'Ej.: pidió almohada extra, ya se la llevaron.',
    anotar: 'Anotar',
    borrar: 'Borrar',
    alguien: 'Alguien del equipo',
  },

  en: {
    escribeIngles: 'Writes in English',
    escribeEspanol: 'Writes in Spanish',
    esperando: (cuanto) => `Waiting for ${cuanto}`,
    recienAhora: 'a moment',
    minutos: (n) => (n === 1 ? '1 minute' : `${n} minutes`),
    horas: (n) => (n === 1 ? '1 hour' : `${n} hours`),
    dias: (n) => (n === 1 ? '1 day' : `${n} days`),

    llegaEnDias: (n) => (n === 1 ? 'Arrives tomorrow' : `Arrives in ${n} days`),
    llegaHoy: (hora) => `Arrives today at ${hora}`,
    diaDe: (dia, noches) => `Day ${dia} of ${noches === 1 ? '1 night' : `${noches} nights`}`,
    seVaManana: (hora) => `leaves tomorrow at ${hora}`,
    seVaHoy: (hora) => `Leaves today at ${hora}`,
    seFue: (n) => (n === 1 ? 'Left yesterday' : `Left ${n} days ago`),

    villa: 'Villa',
    personas: (n) => (n === 1 ? '1 person' : `${n} people`),
    con: 'With:',

    cuidado: 'Never forget',
    celebra: 'They are celebrating',
    presente: 'Keep in mind',

    comoAtenderlo: 'How they asked to be treated',
    sinEntrevista: 'They have not completed the interview yet.',

    yaNosDijo: (n) => `What they already told us · ${n}`,
    yaNosDijoAyuda: 'This came from their interview. If it is here, do not ask again.',
    yaReservo: (n) => `What they already booked · ${n}`,
    sinReservas: 'They have not booked anything yet.',
    reservasNoCargaron:
      'We could not read their bookings. It is not that they have none: we do not know.',
    fichaCompleta: 'Open the full profile',

    pilares: PILARES,
    instalaciones: {
      sauna: 'Sauna',
      cold_plunge: 'Cold plunge',
      pool: 'Pool',
      gym: 'Gym',
    },

    sinAsignar: 'Nobody has taken it yet.',
    leToca: (quien) => `${quien} is on it.`,
    tomar: 'Take this conversation',
    soltar: 'Let it go',
    noSePudo: 'It could not be saved. Try again.',

    cargando: 'Loading the profile…',
    sinFichaTitulo: 'We could not load this guest’s profile.',
    sinFichaCuerpo:
      'Answer if you can, but without seeing their allergies or what they already told us. Reload the screen before promising anything.',
    reintentar: 'Try again',

    notasTitulo: 'Team notes',
    notasTitulo_: (n) => (n > 0 ? `Team notes · ${n}` : 'Team notes'),
    notasCuerpo:
      'Only the team sees these. The guest never reads them: they live in a different table from their chat.',
    notasVacio: 'There are no notes on this conversation yet.',
    notaLabel: 'A note for the team',
    notaPlaceholder: 'E.g.: asked for an extra pillow, already delivered.',
    anotar: 'Add note',
    borrar: 'Delete',
    alguien: 'Someone on the team',
  },
};
