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

/**
 * El ejemplo que va dentro del campo de correo, con el dominio DEL HOTEL.
 *
 * ── POR QUÉ NO ESTÁ ESCRITO A MANO ────────────────────────────
 * Porque lo estaba: decía `you@stayhumaya.com` SIEMPRE. Visto el 25 de
 * noviembre de 2026 abriendo `hotelexp.liderax10.com/bikeandbed/staff`, la
 * puerta de Bike & Bed le proponía a su recepción el correo de otra empresa.
 * Es el mismo fallo del logo y del título de la pestaña: un texto de HUMAYA
 * que se cuela en la pantalla de un hotel que compró la app.
 *
 * ── POR QUÉ VACÍO Y NO UNO INVENTADO ──────────────────────────
 * Sin dominio no hay ejemplo que dar, y un `you@example.com` sería enseñarle
 * una dirección falsa a quien va a escribir la suya. El campo ya dice
 * «Correo» y es `type="email"`: sin ejemplo se entiende igual.
 *
 * Hoy esa rama no se usa: `MARCA.correo` nunca queda vacío porque un hotel
 * sin correo propio cae al de respaldo (`marca.ts`). Eso es un problema
 * aparte —y de fondo—: el respaldo es el de HUMAYA, así que un hotel sin
 * correo cargado mostraría el de otra empresa, acá y en `/entrada`. Los tres
 * hoteles de hoy tienen el suyo, así que no se ve en vivo. Esto no lo tapa:
 * lo deja listo para cuando se arregle donde corresponde.
 */
function ejemploDeCorreo(usuario: string): string {
  const dominio = MARCA.correo.split('@')[1]?.trim();
  return dominio ? `${usuario}@${dominio}` : '';
}

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
    get correoPlaceholder() {
      return ejemploDeCorreo('you');
    },
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
    get correoPlaceholder() {
      return ejemploDeCorreo('vos');
    },
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
