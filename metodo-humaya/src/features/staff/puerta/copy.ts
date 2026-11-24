/**
 * Los textos de la puerta de recepción, en los dos idiomas.
 *
 * ── POR QUÉ INGLÉS POR DEFECTO ──────────────────────────────────────────
 * Tony, 15 de noviembre de 2026, sobre staff.stayhumaya.com: «sería para
 * settings, concierge, ver info de huéspedes, todo en inglés en interno».
 *
 * Y un botón a español, porque el equipo de recepción es tico. Es el mismo
 * arreglo de /entrada: arranca en inglés, quien lo necesita lo cambia una vez
 * y el navegador lo recuerda. Nadie queda obligado a trabajar en un idioma
 * que no es el suyo, y nadie tiene que configurar nada para empezar.
 */

import { MARCA } from '@/marca';
import type { Idioma } from '@/hooks/useIdiomaElegido';

export interface PuertaTextos {
  eyebrow: string;
  area: string;
  title: string;
  description: string;
  correoLabel: string;
  correoPlaceholder: string;
  claveLabel: string;
  clavePlaceholder: string;
  submit: string;
  submitting: string;
  faltaCorreo: string;
  faltaClave: string;
  /** Un fallo por motivo, porque «algo salió mal» no ayuda a nadie. */
  errorCredenciales: string;
  errorSinConfirmar: string;
  errorMuchosIntentos: string;
  errorRed: string;
  /** Entró, pero el administrador todavía no le dio permiso. */
  sinRolTitle: string;
  sinRolBody: (correo: string) => string;
  sinRolHint: string;
  salir: string;
  revisando: string;
  /** El botón dice el idioma AL QUE lleva, no el que está puesto. */
  cambiarIdioma: string;
  /**
   * En el dominio compartido la dirección no dice de qué hotel es la
   * pantalla: lo dice la cuenta. Con más de uno hay que preguntar.
   */
  buscandoHoteles: string;
  elegirHotelTitle: string;
  elegirHotelBody: string;
  cambiarHotel: string;
  /** Tiene rol, pero nadie lo puso en ningún hotel. */
  sinHotelTitle: string;
  sinHotelBody: (correo: string) => string;
  sinHotelHint: string;
  /** La lista no se pudo leer. Esto SÍ puede ser la conexión. */
  hotelesFallaronTitle: string;
  hotelesFallaronBody: string;
  reintentar: string;
}

export const puertaCopy: Record<Idioma, PuertaTextos> = {
  en: {
    get eyebrow() {
      return MARCA.experiencia;
    },
    area: 'Front desk',
    title: 'Sign in',
    description: 'Use your CRM account — the same email and password.',
    correoLabel: 'Email',
    correoPlaceholder: 'you@stayhumaya.com',
    claveLabel: 'Password',
    clavePlaceholder: 'Your password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    faltaCorreo: 'Enter your email.',
    faltaClave: 'Enter your password.',
    errorCredenciales: "That email and password don't match an account.",
    errorSinConfirmar: 'This account still needs to confirm its email address.',
    errorMuchosIntentos: 'Too many attempts. Wait a minute and try again.',
    errorRed: "We couldn't reach the server. Check the connection and try again.",
    sinRolTitle: 'Your account has no access yet',
    sinRolBody: (correo) => `You're signed in as ${correo}, but no role has been assigned to it.`,
    sinRolHint: 'Ask an administrator to give your account a role in the CRM.',
    salir: 'Sign out',
    revisando: 'Checking your session…',
    cambiarIdioma: 'Español',
    buscandoHoteles: 'Looking up your hotels…',
    elegirHotelTitle: 'Which hotel?',
    elegirHotelBody: 'Your account works at more than one. Pick the one you are at.',
    cambiarHotel: 'Switch hotel',
    sinHotelTitle: 'Your account is not at any hotel',
    sinHotelBody: (correo) =>
      `You're signed in as ${correo} with a valid role, but no hotel has been assigned to it.`,
    sinHotelHint: 'Ask an administrator to add your account to a hotel.',
    hotelesFallaronTitle: "We couldn't load your hotels",
    hotelesFallaronBody: 'This one may be the connection. Try again in a moment.',
    reintentar: 'Try again',
  },
  es: {
    get eyebrow() {
      return MARCA.experiencia;
    },
    area: 'Recepción',
    title: 'Entrá',
    description: 'Con tu cuenta del CRM — el mismo correo y la misma clave.',
    correoLabel: 'Correo',
    correoPlaceholder: 'vos@stayhumaya.com',
    claveLabel: 'Clave',
    clavePlaceholder: 'Tu clave',
    submit: 'Entrar',
    submitting: 'Entrando…',
    faltaCorreo: 'Escribí tu correo.',
    faltaClave: 'Escribí tu clave.',
    errorCredenciales: 'Ese correo y esa clave no corresponden a una cuenta.',
    errorSinConfirmar: 'Esta cuenta todavía tiene que confirmar su correo.',
    errorMuchosIntentos: 'Demasiados intentos. Esperá un minuto y probá otra vez.',
    errorRed: 'No pudimos llegar al servidor. Revisá la conexión y probá otra vez.',
    sinRolTitle: 'Tu cuenta todavía no tiene acceso',
    sinRolBody: (correo) => `Entraste como ${correo}, pero nadie le asignó un rol a esa cuenta.`,
    sinRolHint: 'Pedile a un administrador que te dé un rol en el CRM.',
    salir: 'Salir',
    revisando: 'Revisando tu sesión…',
    cambiarIdioma: 'English',
    buscandoHoteles: 'Buscando tus hoteles…',
    elegirHotelTitle: '¿En cuál hotel?',
    elegirHotelBody: 'Tu cuenta trabaja en más de uno. Elegí en el que estás.',
    cambiarHotel: 'Cambiar de hotel',
    sinHotelTitle: 'Tu cuenta no está en ningún hotel',
    sinHotelBody: (correo) =>
      `Entraste como ${correo} y tenés rol, pero nadie asignó esa cuenta a un hotel.`,
    sinHotelHint: 'Pedile a un administrador que agregue tu cuenta a un hotel.',
    hotelesFallaronTitle: 'No pudimos cargar tus hoteles',
    hotelesFallaronBody: 'Esto sí puede ser la conexión. Probá de nuevo en un momento.',
    reintentar: 'Probar de nuevo',
  },
};
