/** Textos de la pantalla Perfil del huésped. Desde la Fase 5 se mudan a src/i18n/. */
export const profileCopy = {
  back: '← Llegadas',
  summary: (villa: string, nights: number, people: number, locale: string) =>
    `${villa} · ${nights} ${nights === 1 ? 'noche' : 'noches'} · ${people} ${
      people === 1 ? 'persona' : 'personas'
    } · ${locale}`,

  careTitle: 'Cómo quieren que los atendamos',
  methodTitle: 'Método Humaya',
  notesLabel: 'Notas del equipo',
  notesPlaceholder: 'Ej.: llegaron cansados del vuelo, ofrecer la cena en la villa.',
  notesSaved: 'Notas guardadas',

  wowTitle: 'Experiencias WOW',
  wowSubtitle: 'Sugeridas por IA a partir de la entrevista',
  wowWhy: 'Por qué:',
  wowEmptyTitle: 'Todavía no hay sugerencias',
  wowEmptyBody: 'Cuando complete la entrevista vamos a proponer experiencias a su medida.',

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

  localeNames: {
    es: 'Español',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
  } as Record<string, string>,

  pillarNames: {
    move: 'Move',
    nourish: 'Nourish',
    connect: 'Connect',
    create: 'Create',
    believe: 'Believe',
  } as Record<string, string>,
};
