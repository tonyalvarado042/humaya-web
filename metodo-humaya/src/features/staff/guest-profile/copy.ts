import type { Idioma } from '@/hooks/useIdiomaElegido';
import { MARCA } from '@/marca';

/** Textos de la pantalla Perfil del huésped. Desde la Fase 5 se mudan a src/i18n/. */
export interface ProfileTextos {
  back: string;
  summary: (villa: string, nights: number, people: number, locale: string) => string;

  conciergeUnread: string;

  careTitle: string;
  readonly methodTitle: string;
  notesLabel: string;
  notesPlaceholder: string;
  notesSaved: string;

  wowTitle: string;
  wowSubtitle: string;
  wowWhy: string;
  wowEmptyTitle: string;
  wowEmptyBody: string;
  wowCargando: string;

  statusSuggested: string;
  statusPlanned: string;
  statusDone: string;
  actionPlan: string;
  actionDone: string;
  actionFinished: string;

  answersTitle: string;
  answersEmpty: string;
  noPillars: string;

  notFoundTitle: string;
  notFoundBody: string;
  loading: string;

  /**
   * Los cuatro hitos. El servicio manda los HECHOS —cuántas respuestas, qué
   * día de los siete— y la frase se arma acá, porque la frase tiene idioma y
   * el hecho no. Antes `timelineFor()` devolvía «Preparación pre-llegada» ya
   * escrito: con recepción en inglés, la línea de tiempo quedaba en español
   * en medio de una pantalla traducida.
   */
  hitoEntrevistaCompleta: string;
  hitoEntrevistaParcial: (respondidas: number, total: number) => string;
  hitoPreparacion: string;
  hitoLlegada: string;
  hitoSeguimiento: string;
  cuandoSinEmpezar: string;
  cuandoDiaDeSiete: (dia: number) => string;
  cuandoNada: string;
  hitoCumplido: string;
  hitoPendiente: string;

  localeNames: Record<string, string>;
  pillarNames: Record<string, string>;
}

/**
 * Los nombres de los idiomas van en su propio idioma —Español, English,
 * Deutsch— así que son los mismos en las dos versiones. Y los pilares son
 * nombre propio del método: no se traducen. Ver `copyPanel.ts`.
 */
const IDIOMAS: Record<string, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};

const PILARES: Record<string, string> = {
  move: 'Move',
  nourish: 'Nourish',
  connect: 'Connect',
  create: 'Create',
  believe: 'Believe',
};

export const profileCopy: Record<Idioma, ProfileTextos> = {
  es: {
    back: '← Llegadas',
    summary: (villa, nights, people, locale) =>
      `${villa} · ${nights} ${nights === 1 ? 'noche' : 'noches'} · ${people} ${
        people === 1 ? 'persona' : 'personas'
      } · ${locale}`,

    conciergeUnread: 'Le escribió al Concierge y todavía no se leyó',

    careTitle: 'Cómo quieren que los atendamos',
    get methodTitle() {
      return MARCA.experiencia;
    },
    notesLabel: 'Notas del equipo',
    notesPlaceholder: 'Ej.: llegaron cansados del vuelo, ofrecer la cena en la villa.',
    notesSaved: 'Notas guardadas',

    wowTitle: 'Experiencias WOW',
    wowSubtitle: 'Sugeridas por IA a partir de la entrevista',
    wowWhy: 'Por qué:',
    wowEmptyTitle: 'Todavía no hay sugerencias',
    wowEmptyBody: 'Cuando complete la entrevista vamos a proponer experiencias a su medida.',
    wowCargando: 'Cargando las experiencias sugeridas…',

    statusSuggested: 'Sugerida',
    statusPlanned: 'Planificada',
    statusDone: 'Hecha',
    actionPlan: 'Planificar',
    actionDone: 'Marcar como hecha',
    actionFinished: 'Lista',

    answersTitle: 'Respuestas de la entrevista',
    answersEmpty: 'Todavía no respondió ninguna pregunta.',
    noPillars: 'Sin respuestas todavía: cuando complete la entrevista, acá va su perfil por pilar.',

    notFoundTitle: 'No encontramos a ese huésped',
    notFoundBody: 'Puede que el enlace esté viejo. Volvé a Llegadas y elegí de la lista.',
    loading: 'el perfil del huésped',

    hitoEntrevistaCompleta: 'Entrevista completa',
    hitoEntrevistaParcial: (respondidas, total) => `Entrevista ${respondidas} de ${total}`,
    hitoPreparacion: 'Preparación pre-llegada',
    hitoLlegada: 'Llegada',
    hitoSeguimiento: 'Seguimiento',
    cuandoSinEmpezar: 'Sin empezar',
    cuandoDiaDeSiete: (dia) => `día ${dia} de 7`,
    cuandoNada: '—',
    hitoCumplido: '· cumplido',
    hitoPendiente: '· pendiente',

    localeNames: IDIOMAS,
    pillarNames: PILARES,
  },

  en: {
    back: '← Arrivals',
    summary: (villa, nights, people, locale) =>
      `${villa} · ${nights} ${nights === 1 ? 'night' : 'nights'} · ${people} ${
        people === 1 ? 'guest' : 'guests'
      } · ${locale}`,

    conciergeUnread: 'They wrote to the Concierge and it has not been read yet',

    careTitle: 'How they want to be treated',
    get methodTitle() {
      return MARCA.experiencia;
    },
    notesLabel: 'Team notes',
    notesPlaceholder: 'E.g.: arrived tired from the flight, offer dinner in the villa.',
    notesSaved: 'Notes saved',

    wowTitle: 'WOW experiences',
    wowSubtitle: 'Suggested by AI from the interview',
    wowWhy: 'Why:',
    wowEmptyTitle: 'No suggestions yet',
    wowEmptyBody: 'Once they complete the interview we will propose experiences made for them.',
    wowCargando: 'Loading the suggested experiences…',

    statusSuggested: 'Suggested',
    statusPlanned: 'Planned',
    statusDone: 'Done',
    actionPlan: 'Plan it',
    actionDone: 'Mark as done',
    actionFinished: 'Ready',

    answersTitle: 'Interview answers',
    answersEmpty: 'They have not answered any question yet.',
    noPillars:
      'No answers yet: once they complete the interview, their profile by pillar goes here.',

    notFoundTitle: 'We could not find that guest',
    notFoundBody: 'The link may be old. Go back to Arrivals and pick from the list.',
    loading: 'the guest profile',

    hitoEntrevistaCompleta: 'Interview complete',
    hitoEntrevistaParcial: (respondidas, total) => `Interview ${respondidas} of ${total}`,
    hitoPreparacion: 'Pre-arrival prep',
    hitoLlegada: 'Arrival',
    hitoSeguimiento: 'Follow-up',
    cuandoSinEmpezar: 'Not started',
    cuandoDiaDeSiete: (dia) => `day ${dia} of 7`,
    cuandoNada: '—',
    hitoCumplido: '· done',
    hitoPendiente: '· pending',

    localeNames: IDIOMAS,
    pillarNames: PILARES,
  },
};
