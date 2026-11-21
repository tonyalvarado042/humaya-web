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
  /** Cuando este telefono ya encontro la estadia antes. */
  volvisteTitle: (quien: string) => string;
  volvisteBody: string;
  noSoyYo: string;
  /** Mientras se abre la llave que venia en el QR del televisor. */
  conLlaveBuscando: string;
  /** Cuando esa llave ya no sirve: la estadia termino, o la foto del
   *  televisor es de otro huesped. No es un error del huesped. */
  llaveVencida: string;
  /** Que es HUMAYA Experience, dicho al huesped. */
  queEsTitulo: string;
  queEsCuerpo: string;
  queEsPersona: string;
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

/**
 * OJO: los campos que leen MARCA van como GETTER, no como valor.
 *
 * Este objeto se construye al CARGAR el modulo, y el hotel se resuelve
 * despues —hace falta una consulta—. Con un valor normal, el texto se
 * congelaba con la marca por defecto: comprobado el 20 de noviembre de 2026,
 * /demo/entrada decia "HUMAYA EXPERIENCE" en el hotel demo.
 */
export const entradaCopy: Record<Idioma, EntradaTextos> = {
  en: {
    get eyebrow() {
      return MARCA.experiencia;
    },
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
    volvisteTitle: (quien) => (quien ? `Welcome back, ${quien}.` : 'Welcome back.'),
    volvisteBody:
      'We remembered your stay on this phone, so you do not have to look for your code again.',
    noSoyYo: 'Not you? Look up another booking',
    conLlaveBuscando: 'Opening your stay…',
    llaveVencida: 'That link is no longer open. Look up your stay here.',
    get queEsTitulo() {
      return MARCA.experiencia;
    },
    queEsCuerpo:
      'Your stay, on the television in your villa and here on your phone. It is not here to replace anyone: it is here so that when we talk, we already know what you need.',
    queEsPersona: 'Whatever you ask, a person answers.',
    foundBody:
      'Your stay is already with us, and the front desk can see it. ' +
      'Nothing else to do right now.',
    foundContacto: 'Want anything ready before you arrive? Write to us:',
    fechas: (entrada, salida) => `${entrada} → ${salida}`,
    notFoundTitle: 'We couldn’t find it',
    notFoundBody:
      'Check the code and the last name — they have to be from the same booking. If it still doesn’t work, write to us and we’ll sort it out.',
    get contactEmail() {
      return MARCA.correo;
    },
    contactWhatsapp: 'WhatsApp',
    whatsappHref: 'https://wa.me/50664417187?text=Hi%2C%20I%20can%27t%20find%20my%20reservation.',
    tryAgain: 'Try again',
    error: 'Something broke on our side. Try again in a moment.',
    cambiarIdioma: 'Español',
  },
  es: {
    get eyebrow() {
      return MARCA.experiencia;
    },
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
    volvisteTitle: (quien) => (quien ? `Qué bueno verte, ${quien}.` : 'Qué bueno verte.'),
    volvisteBody:
      'Nos acordamos de tu estadía en este teléfono, así que no tenés que volver a buscar tu código.',
    noSoyYo: '¿No sos vos? Buscar otra reserva',
    conLlaveBuscando: 'Abriendo tu estadía…',
    llaveVencida: 'Ese enlace ya no está abierto. Buscá tu estadía acá.',
    get queEsTitulo() {
      return MARCA.experiencia;
    },
    queEsCuerpo:
      'Tu estadía, en el televisor de tu villa y acá en tu teléfono. No está para reemplazar a nadie: está para que, cuando hablemos, ya sepamos qué necesitás.',
    queEsPersona: 'Lo que pidas, lo contesta una persona.',
    foundBody:
      'Tu estadía ya está con nosotros y recepción la ve. ' +
      'No tenés que hacer nada más por ahora.',
    foundContacto: '¿Querés dejar algo listo antes de llegar? Escribinos:',
    fechas: (entrada, salida) => `${entrada} → ${salida}`,
    notFoundTitle: 'No la encontramos',
    notFoundBody:
      'Revisá el código y el apellido — tienen que ser de la misma reserva. Si aun así no sale, escribinos y lo resolvemos.',
    get contactEmail() {
      return MARCA.correo;
    },
    contactWhatsapp: 'WhatsApp',
    whatsappHref: 'https://wa.me/50664417187?text=Hola%2C%20no%20encuentro%20mi%20reserva.',
    tryAgain: 'Probar de nuevo',
    error: 'Algo falló de nuestro lado. Probá de nuevo en un momento.',
    cambiarIdioma: 'English',
  },
};
