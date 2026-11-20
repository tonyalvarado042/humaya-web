/**
 * Textos de /entrada, en los dos idiomas.
 *
 * ── POR QUÉ INGLÉS POR DEFECTO ──────────────────────────────────────────
 * Tony, 15 de noviembre de 2026: «sí deben ir en inglés con opción a español».
 * Y los datos lo respaldan: de las 62 reservas reales, 53 entraron por Airbnb,
 * Expedia y Booking.com, casi todas de afuera. El huésped que reserva en el
 * sitio en español es la minoría.
 *
 * ── POR QUÉ NO USA i18n ─────────────────────────────────────────────────
 * El resto de la app traduce con react-i18next leyendo la preferencia de la
 * estadía. Acá todavía no hay estadía —esa es justamente la pantalla que la
 * encuentra—, así que no hay de dónde sacar la preferencia. Se elige a mano y
 * se recuerda en el navegador.
 */

import { MARCA } from '@/marca';

export type Idioma = 'en' | 'es';

export interface EntradaTextos {
  eyebrow: string;
  title: string;
  description: string;
  /** El ejemplo cambia por idioma: un código de Airbnb no se lee igual en los dos. */
  codigoLabel: string;
  codigoHelp: string;
  codigoPlaceholder: string;
  apellidoLabel: string;
  apellidoPlaceholder: string;
  submit: string;
  submitting: string;
  faltaCodigo: string;
  faltaApellido: string;
  foundTitle: (quien: string) => string;
  /**
   * Lo que pasa DESPUES, dicho sin prometer de mas.
   *
   * Hasta el 20 de noviembre de 2026 decia «vamos a dejarte los dias listos»
   * y la pantalla se acababa ahi: ni un boton, ni un enlace, nada. El huesped
   * se identificaba y quedaba viendo una promesa sin cumplir. Ahora dice lo
   * que de verdad pasa —su reserva esta en el sistema y recepcion la ve— y
   * le deja a mano por donde escribir.
   */
  foundBody: string;
  foundContacto: string;
  fechas: (entrada: string, salida: string) => string;
  notFoundTitle: string;
  notFoundBody: string;
  contactEmail: string;
  contactWhatsapp: string;
  whatsappHref: string;
  tryAgain: string;
  error: string;
  /** El botón que cambia de idioma dice el idioma AL QUE lleva, no el actual:
   *  quien lo necesita no está leyendo el que está puesto. */
  cambiarIdioma: string;
}

export const entradaCopy: Record<Idioma, EntradaTextos> = {
  en: {
    eyebrow: MARCA.experiencia,
    title: 'Find your stay',
    description: 'So we can get everything ready before you arrive. It takes a moment.',
    codigoLabel: 'Confirmation code or email',
    codigoHelp:
      'The code your booking site gave you — Airbnb, Expedia, Booking.com — or the email you booked with.',
    codigoPlaceholder: 'HMMS93AC2K',
    apellidoLabel: 'Last name',
    apellidoPlaceholder: 'Galloway',
    submit: 'Continue',
    submitting: 'Looking…',
    faltaCodigo: 'Enter your confirmation code or the email you booked with.',
    faltaApellido: 'Enter the last name on the booking.',
    foundTitle: (quien) => (quien ? `Found you, ${quien}.` : 'Found you.'),
    foundBody:
      'Your stay is already with us, and the front desk can see it. ' +
      'Nothing else to do right now.',
    foundContacto: 'Want anything ready before you arrive? Write to us:',
    fechas: (entrada, salida) => `${entrada} → ${salida}`,
    notFoundTitle: 'We couldn’t find it',
    notFoundBody:
      'Check the code and the last name — they have to be from the same booking. If it still doesn’t work, write to us and we’ll sort it out.',
    contactEmail: MARCA.correo,
    contactWhatsapp: 'WhatsApp',
    whatsappHref: 'https://wa.me/50664417187?text=Hi%2C%20I%20can%27t%20find%20my%20reservation.',
    tryAgain: 'Try again',
    error: 'Something broke on our side. Try again in a moment.',
    cambiarIdioma: 'Español',
  },
  es: {
    eyebrow: MARCA.experiencia,
    title: 'Encontrá tu estadía',
    description: 'Para dejarte todo listo antes de que llegués. Es un momento.',
    codigoLabel: 'Código de confirmación o correo',
    codigoHelp:
      'El código que te dio Airbnb, Expedia o Booking.com — o el correo con el que reservaste.',
    codigoPlaceholder: 'HMMS93AC2K',
    apellidoLabel: 'Apellido',
    apellidoPlaceholder: 'Galloway',
    submit: 'Continuar',
    submitting: 'Buscando…',
    faltaCodigo: 'Escribí tu código de confirmación o el correo con el que reservaste.',
    faltaApellido: 'Escribí el apellido de la reserva.',
    foundTitle: (quien) => (quien ? `¡Te encontramos, ${quien}!` : '¡Te encontramos!'),
    foundBody:
      'Tu estadía ya está con nosotros y recepción la ve. ' +
      'No tenés que hacer nada más por ahora.',
    foundContacto: '¿Querés dejar algo listo antes de llegar? Escribinos:',
    fechas: (entrada, salida) => `${entrada} → ${salida}`,
    notFoundTitle: 'No la encontramos',
    notFoundBody:
      'Revisá el código y el apellido — tienen que ser de la misma reserva. Si aun así no sale, escribinos y lo resolvemos.',
    contactEmail: MARCA.correo,
    contactWhatsapp: 'WhatsApp',
    whatsappHref: 'https://wa.me/50664417187?text=Hola%2C%20no%20encuentro%20mi%20reserva.',
    tryAgain: 'Probar de nuevo',
    error: 'Algo falló de nuestro lado. Probá de nuevo en un momento.',
    cambiarIdioma: 'English',
  },
};
