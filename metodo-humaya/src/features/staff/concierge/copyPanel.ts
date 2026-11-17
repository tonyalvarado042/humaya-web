/** El texto de la ficha del huésped y de las notas internas. */
export const panelCopy = {
  escribeIngles: 'Escribe en inglés',
  escribeEspanol: 'Escribe en español',
  esperando: (cuanto: string) => `Esperando hace ${cuanto}`,
  recienAhora: 'un momento',
  minutos: (n: number) => (n === 1 ? '1 minuto' : `${n} minutos`),
  horas: (n: number) => (n === 1 ? '1 hora' : `${n} horas`),
  dias: (n: number) => (n === 1 ? '1 día' : `${n} días`),

  // ── El reloj de la estadía ──────────────────────────────────────────────
  llegaEnDias: (n: number) => (n === 1 ? 'Llega mañana' : `Llega en ${n} días`),
  llegaHoy: (hora: string) => `Llega hoy a las ${hora}`,
  diaDe: (dia: number, noches: number) =>
    `Día ${dia} de ${noches === 1 ? '1 noche' : `${noches} noches`}`,
  seVaManana: (hora: string) => `se va mañana a las ${hora}`,
  seVaHoy: (hora: string) => `Se va hoy a las ${hora}`,
  seFue: (n: number) => (n === 1 ? 'Se fue ayer' : `Se fue hace ${n} días`),

  // ── Quién es ────────────────────────────────────────────────────────────
  villa: 'Villa',
  personas: (n: number) => (n === 1 ? '1 persona' : `${n} personas`),
  con: 'Con:',

  // ── Lo que no se puede olvidar ──────────────────────────────────────────
  cuidado: 'Nunca olvidar',
  celebra: 'Está celebrando',
  presente: 'Tener presente',

  // ── En sus palabras ─────────────────────────────────────────────────────
  comoAtenderlo: 'Cómo pidió que lo atendamos',
  sinEntrevista: 'Todavía no completaron la entrevista.',

  // ── Lo que ya sabemos ───────────────────────────────────────────────────
  yaNosDijo: (n: number) => `Lo que ya nos dijo · ${n}`,
  yaNosDijoAyuda: 'Salió de su entrevista. Si está acá, no hay que volver a preguntarlo.',
  yaReservo: (n: number) => `Lo que ya reservó · ${n}`,
  sinReservas: 'Todavía no reservó nada.',
  fichaCompleta: 'Abrir la ficha completa',

  pilares: {
    move: 'Movimiento',
    nourish: 'Alimentación',
    connect: 'Vínculos',
    create: 'Crear',
    believe: 'Sentido',
  } as Record<string, string>,

  instalaciones: {
    sauna: 'Sauna',
    cold_plunge: 'Cold plunge',
    pool: 'Piscina',
    gym: 'Gimnasio',
  } as Record<string, string>,

  // ── Quién la atiende ────────────────────────────────────────────────────
  sinAsignar: 'Nadie la tomó todavía.',
  leToca: (quien: string) => `Le toca a ${quien}.`,
  tomar: 'Tomar esta conversación',
  soltar: 'Soltarla',
  noSePudo: 'No se pudo guardar. Probá de nuevo.',

  // ── Cuando la ficha no carga ────────────────────────────────────────────
  cargando: 'Cargando la ficha…',
  sinFichaTitulo: 'No pudimos cargar la ficha de este huésped.',
  sinFichaCuerpo:
    'Contestá si podés, pero sin ver sus alergias ni lo que ya nos dijo. Recargá la pantalla antes de prometer algo.',
  reintentar: 'Reintentar',

  // ── Notas del equipo ────────────────────────────────────────────────────
  notasTitulo: 'Notas del equipo',
  notasTitulo_: (n: number) => (n > 0 ? `Notas del equipo · ${n}` : 'Notas del equipo'),
  notasCuerpo: 'Solo las ve el equipo. El huésped nunca las lee: viven en otra tabla que su chat.',
  notasVacio: 'Todavía no hay notas sobre esta conversación.',
  notaLabel: 'Una nota para el equipo',
  notaPlaceholder: 'Ej.: pidió almohada extra, ya se la llevaron.',
  anotar: 'Anotar',
  borrar: 'Borrar',
  alguien: 'Alguien del equipo',
} as const;
