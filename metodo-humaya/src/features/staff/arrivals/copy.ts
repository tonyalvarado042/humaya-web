/**
 * Los textos de Llegadas, en los dos idiomas.
 *
 * Tony, 15 de noviembre de 2026, sobre el dominio del personal: «todo en inglés
 * en interno». Y un botón a español en el menú, porque el equipo es tico.
 *
 * ── LO QUE CAMBIÓ EN ESTA PANTALLA ──────────────────────────────────────
 * Hasta hoy mostraba las dos estadías de ejemplo de la demo, con progreso de
 * entrevista, alertas y "wows" inventados. Ahora muestra las reservas de
 * Cloudbeds: 48 activas, la primera el 17 de diciembre de 2026.
 *
 * Las columnas de la demo que Cloudbeds no tiene —entrevista, alertas— NO se
 * rellenan con nada: no se muestran. Vuelven cuando existan de verdad.
 */

import type { Idioma } from '@/hooks/useIdiomaElegido';

export interface ArrivalsTextos {
  title: string;
  loading: string;
  /** El filtro de arriba. */
  rangeLabel: string;
  proximas: string;
  todas: string;
  sinCorreo: string;
  /** La vista de datos de ejemplo, mientras Admin la deje encendida. */
  demo: string;
  demoAviso: string;
  /** Los cuatro indicadores. */
  statProximas: string;
  statPersonas: string;
  statSinCorreo: string;
  statPrimera: string;
  sinFecha: string;
  /** Las columnas de la tabla. */
  colHuesped: string;
  colFechas: string;
  colVilla: string;
  colPersonas: string;
  colFuente: string;
  colCodigo: string;
  colEstado: string;
  /** Valores que faltan. */
  sinVilla: string;
  sinCorreoFila: string;
  sinCodigo: string;
  /** Los estados que manda Cloudbeds. */
  estadoConfirmada: string;
  estadoSinConfirmar: string;
  estadoCancelada: string;
  /** Cuando no hay nada que mostrar. */
  vacioTitulo: string;
  vacioCuerpo: string;
  vacioSinCorreo: string;
  /** Pie de pantalla. */
  fuenteDatos: string;
}

export const arrivalsCopy: Record<Idioma, ArrivalsTextos> = {
  en: {
    title: 'Bookings',
    loading: 'bookings',
    rangeLabel: 'Filter',
    proximas: 'Upcoming',
    todas: 'All',
    sinCorreo: 'No email',
    demo: 'Demo',
    demoAviso: 'Sample data — two made-up stays. Turn it off in Admin when you go live.',
    statProximas: 'Upcoming bookings',
    statPersonas: 'Guests expected',
    statSinCorreo: 'Without an email',
    statPrimera: 'First arrival',
    sinFecha: '—',
    colHuesped: 'Guest',
    colFechas: 'Stay',
    colVilla: 'Room',
    colPersonas: 'Guests',
    colFuente: 'Booked through',
    colCodigo: 'Confirmation',
    colEstado: 'Status',
    sinVilla: 'Not assigned',
    sinCorreoFila: 'No email',
    sinCodigo: '—',
    estadoConfirmada: 'Confirmed',
    estadoSinConfirmar: 'Not confirmed',
    estadoCancelada: 'Cancelled',
    vacioTitulo: 'Nothing here yet',
    vacioCuerpo: 'No bookings match this filter.',
    vacioSinCorreo: 'Every upcoming booking has an email address. Nothing to chase.',
    fuenteDatos: 'Live from Cloudbeds.',
  },
  es: {
    title: 'Reservas',
    loading: 'las reservas',
    rangeLabel: 'Filtro',
    proximas: 'Próximas',
    todas: 'Todas',
    sinCorreo: 'Sin correo',
    demo: 'Demo',
    demoAviso: 'Datos de ejemplo: dos estadías inventadas. Se apaga en Admin cuando publiques.',
    statProximas: 'Reservas próximas',
    statPersonas: 'Personas esperadas',
    statSinCorreo: 'Sin correo',
    statPrimera: 'Primera llegada',
    sinFecha: '—',
    colHuesped: 'Huésped',
    colFechas: 'Estadía',
    colVilla: 'Habitación',
    colPersonas: 'Personas',
    colFuente: 'Reservó por',
    colCodigo: 'Confirmación',
    colEstado: 'Estado',
    sinVilla: 'Sin asignar',
    sinCorreoFila: 'Sin correo',
    sinCodigo: '—',
    estadoConfirmada: 'Confirmada',
    estadoSinConfirmar: 'Sin confirmar',
    estadoCancelada: 'Cancelada',
    vacioTitulo: 'Todavía no hay nada',
    vacioCuerpo: 'Ninguna reserva calza con este filtro.',
    vacioSinCorreo: 'Todas las reservas próximas tienen correo. No hay nada que perseguir.',
    fuenteDatos: 'En vivo desde Cloudbeds.',
  },
};
