/** El texto del panel de contexto y de las notas internas. */
export const panelCopy = {
  escribeIngles: 'Escribe en inglés',
  escribeEspanol: 'Escribe en español',
  esperando: (cuanto: string) => `Esperando hace ${cuanto}`,
  reciexn: 'un momento',
  minutos: (n: number) => (n === 1 ? '1 minuto' : `${n} minutos`),
  horas: (n: number) => (n === 1 ? '1 hora' : `${n} horas`),
  dias: (n: number) => (n === 1 ? '1 día' : `${n} días`),

  villa: 'Villa',
  personas: (n: number) => (n === 1 ? '1 persona' : `${n} personas`),
  con: 'Con:',
  alergias: 'Alergias:',

  sinAsignar: 'Nadie la tomó todavía.',
  leToca: (quien: string) => `Le toca a ${quien}.`,
  tomar: 'Tomar esta conversación',
  soltar: 'Soltarla',
  noSePudo: 'No se pudo guardar. Probá de nuevo.',

  notasTitulo: 'Notas del equipo',
  notasCuerpo: 'Solo las ve el equipo. El huésped nunca las lee: viven en otra tabla que su chat.',
  notasVacio: 'Todavía no hay notas sobre esta conversación.',
  notaLabel: 'Una nota para el equipo',
  notaPlaceholder: 'Ej.: pidió almohada extra, ya se la llevaron.',
  anotar: 'Anotar',
  borrar: 'Borrar',
  alguien: 'Alguien del equipo',
} as const;
