import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * Textos de la agenda de servicios. Desde la Fase 5 se mudan a src/i18n/.
 *
 * ── POR QUÉ YA NO SE LLAMA «SPA Y BIENESTAR» ────────────────────────────
 * Porque dejó de ser la agenda del spa. Lee `humaya_servicio_reservas`, que
 * es donde cae TODO lo que un huésped reserva desde la app: el entrenador
 * personal de hoy y lo que se agregue mañana en Admin. Un título que hablara
 * solo del spa enseñaría a recepción a no buscar lo demás acá.
 *
 * ── POR QUÉ AHORA ESTÁ EN LOS DOS IDIOMAS ───────────────────────────────
 * Tony, 21 de noviembre de 2026: recepción entera en los dos idiomas. Hasta
 * ese día el botón del menú prometía inglés y esta pantalla seguía en
 * español: el título decía «Agenda de servicios» debajo de un menú que decía
 * «Sign out». Un recepcionista que no lee español no podía usar su turno.
 */
export interface SpaTextos {
  title: string;
  subtitulo: string;

  cuandoLabel: string;
  hoy: string;
  manana: string;
  semana: string;
  comoLabel: string;
  porHora: string;
  porServicio: string;

  statReservas: string;
  statProxima: string;
  statServicios: string;
  nada: string;
  yaPasaron: string;

  colCuando: string;
  colHuesped: string;
  colServicio: string;
  tableLabel: string;
  minutos: (cuantos: number) => string;
  con: (quien: string) => string;
  servicioBorrado: string;
  apagado: string;
  sinNadie: string;

  vacioTitulo: string;
  vacioCuerpo: string;
  cargando: string;

  sinCatalogoTitulo: string;
  sinCatalogoCuerpo: string;

  faltaSaunaTitulo: string;
  faltaSaunaCuerpo: string;
}

export const spaCopy: Record<Idioma, SpaTextos> = {
  es: {
    title: 'Agenda de servicios',
    subtitulo: 'Lo que los huéspedes tienen reservado.',

    // ── Las vistas ────────────────────────────────────────────────────
    cuandoLabel: 'Qué días mirar',
    hoy: 'Hoy',
    manana: 'Mañana',
    semana: '7 días',
    comoLabel: 'Cómo verlo',
    porHora: 'Por hora',
    porServicio: 'Por servicio',

    // ── Los números de arriba ─────────────────────────────────────────
    statReservas: 'Reservas',
    statProxima: 'La próxima',
    statServicios: 'Servicios activos',
    nada: '—',
    yaPasaron: 'ya pasaron todas',

    // ── La lista ──────────────────────────────────────────────────────
    colCuando: 'Cuándo',
    colHuesped: 'Huésped',
    colServicio: 'Servicio',
    tableLabel: 'Reservas del rango elegido',
    minutos: (cuantos) => `${cuantos} min`,
    con: (quien) => `Con ${quien}`,
    servicioBorrado: 'Este servicio ya no está en el catálogo',
    apagado: 'Deshabilitado',
    sinNadie: 'Nadie anotado en estos días.',

    vacioTitulo: 'No hay nada reservado en estos días',
    vacioCuerpo:
      'Cuando un huésped reserve un servicio desde la app, aparece acá sin que nadie tenga que avisar.',
    cargando: 'la agenda de servicios',

    sinCatalogoTitulo: 'No hay servicios en el catálogo',
    sinCatalogoCuerpo:
      'Mientras no haya ninguno, el huésped no tiene nada que reservar. Se agregan en Admin, en «Servicios».',

    // ── Lo que esta pantalla NO puede mostrar, dicho antes de que lo
    //    busquen. Callarlo haría que recepción crea que nadie usa el sauna.
    faltaSaunaTitulo: 'Sauna y cold plunge no salen acá',
    faltaSaunaCuerpo:
      'Son las dos instalaciones fijas de la app y todavía no se guardan en la base: una reserva de sauna vive solo en el teléfono donde se hizo y no llega a ninguna pantalla de recepción. Para que lleguen, hay que darles de alta como servicios en Admin, con su precio y sus horas.',
  },

  en: {
    title: 'Service schedule',
    subtitulo: 'What guests have booked.',

    cuandoLabel: 'Which days',
    hoy: 'Today',
    manana: 'Tomorrow',
    semana: '7 days',
    comoLabel: 'How to see it',
    porHora: 'By time',
    porServicio: 'By service',

    statReservas: 'Bookings',
    statProxima: 'Next one',
    statServicios: 'Active services',
    nada: '—',
    yaPasaron: 'all of them already passed',

    colCuando: 'When',
    colHuesped: 'Guest',
    colServicio: 'Service',
    tableLabel: 'Bookings in the selected range',
    minutos: (cuantos) => `${cuantos} min`,
    con: (quien) => `With ${quien}`,
    servicioBorrado: 'This service is no longer in the catalog',
    apagado: 'Disabled',
    sinNadie: 'Nobody booked on these days.',

    vacioTitulo: 'Nothing booked for these days',
    vacioCuerpo:
      'When a guest books a service from the app, it shows up here without anyone having to tell you.',
    cargando: 'the service schedule',

    sinCatalogoTitulo: 'There are no services in the catalog',
    sinCatalogoCuerpo:
      'While there are none, the guest has nothing to book. You add them in Admin, under “Services”.',

    faltaSaunaTitulo: 'Sauna and cold plunge do not show up here',
    faltaSaunaCuerpo:
      'They are the two fixed facilities in the app and they are still not stored in the database: a sauna booking lives only on the phone where it was made and never reaches a front-desk screen. To make them arrive, add them as services in Admin, with their price and their hours.',
  },
};
