/**
 * Textos de la agenda de servicios. Desde la Fase 5 se mudan a src/i18n/.
 *
 * ── POR QUÉ YA NO SE LLAMA «SPA Y BIENESTAR» ────────────────────────────
 * Porque dejó de ser la agenda del spa. Lee `humaya_servicio_reservas`, que
 * es donde cae TODO lo que un huésped reserva desde la app: el entrenador
 * personal de hoy y lo que se agregue mañana en Admin. Un título que hablara
 * solo del spa enseñaría a recepción a no buscar lo demás acá.
 */
export const spaCopy = {
  title: 'Agenda de servicios',
  subtitulo: 'Lo que los huéspedes tienen reservado.',

  // ── Las vistas ──────────────────────────────────────────────────────
  cuandoLabel: 'Qué días mirar',
  hoy: 'Hoy',
  manana: 'Mañana',
  semana: '7 días',
  comoLabel: 'Cómo verlo',
  porHora: 'Por hora',
  porServicio: 'Por servicio',

  // ── Los números de arriba ───────────────────────────────────────────
  statReservas: 'Reservas',
  statProxima: 'La próxima',
  statServicios: 'Servicios activos',
  nada: '—',
  yaPasaron: 'ya pasaron todas',

  // ── La lista ────────────────────────────────────────────────────────
  colCuando: 'Cuándo',
  colHuesped: 'Huésped',
  colServicio: 'Servicio',
  tableLabel: 'Reservas del rango elegido',
  minutos: (cuantos: number) => `${cuantos} min`,
  con: (quien: string) => `Con ${quien}`,
  servicioBorrado: 'Este servicio ya no está en el catálogo',
  apagado: 'Deshabilitado',
  sinNadie: 'Nadie anotado en estos días.',

  vacioTitulo: 'No hay nada reservado en estos días',
  vacioCuerpo:
    'Cuando un huésped reserve un servicio desde la app, aparece acá sin que nadie tenga que avisar.',
  cargando: 'la agenda de servicios',

  sinCatalogoTitulo: 'No hay servicios en el catálogo',
  sinCatalogoCuerpo:
    'Mientras no haya ninguno, el huésped no tiene nada que reservar. Se agregan en Admin, en «Servicios de Reservas».',

  // ── Lo que esta pantalla NO puede mostrar, dicho antes de que lo
  //    busquen. Callarlo haría que recepción crea que nadie usa el sauna.
  faltaSaunaTitulo: 'Sauna y cold plunge no salen acá',
  faltaSaunaCuerpo:
    'Son las dos instalaciones fijas de la app y todavía no se guardan en la base: una reserva de sauna vive solo en el teléfono donde se hizo y no llega a ninguna pantalla de recepción. Para que lleguen, hay que darles de alta como servicios en Admin, con su precio y sus horas.',
} as const;
