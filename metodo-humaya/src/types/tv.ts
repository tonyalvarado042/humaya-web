/** Una villa en la pantalla de su televisor. */
/** Quién está en la villa según Cloudbeds. */
export interface ReservaDeVilla {
  huesped: string;
  llegada: string | null;
  salida: string | null;
}

export interface VillaTv {
  id: string;
  /**
   * La clave que va en la direccion del televisor.
   *
   * No es una contraseña de persona: es lo que impide que cualquiera que
   * adivine `?home=v4-bruma` lea el nombre del huésped que duerme ahí esta
   * noche. Se escribe una vez, al colgar el televisor.
   */
  clave: string;
  nombre: string;
  tipo: string | null;
  anfitrion: string | null;

  wifiSsid: string | null;
  wifiClave: string | null;
  /** El código del Wi-Fi queda en pantalla también entre huéspedes. */
  wifiSiempre: boolean;

  /**
   * Lo escrito A MANO. Es el respaldo, no la fuente: si hay reserva, manda
   * `reserva`. Sirve para una entrada que todavía no está en Cloudbeds.
   */
  huesped: string | null;
  /** YYYY-MM-DD, o null si la villa está vacía. */
  llegada: string | null;
  salida: string | null;
  /**
   * Quién está en la villa SEGÚN LAS RESERVAS, que es de donde tiene que
   * salir. Tony, 21 de noviembre de 2026: «todo debe ser automatizado, tú
   * tienes las reservas, ¿por qué me pides agregar nombre de huésped?».
   */
  reserva?: ReservaDeVilla | null;
  checkin: string;
  checkout: string;

  bienvenida: string | null;
  notaTitulo: string | null;
  notaTexto: string | null;

  /** Nombre del objeto en el bucket, sin extensión. Null = la foto que trae el Worker. */
  foto: string | null;
  /** Dónde va el reloj, para no taparle el logo a la foto. */
  relojPosicion: 'centro' | 'izquierda' | 'derecha';

  habilitada: boolean;
  orden: number;
}

/** Lo que se puede cambiar de una villa. Lo que no viene, no se toca. */
export interface CambiosVillaTv {
  nombre?: string;
  tipo?: string | null;
  anfitrion?: string | null;
  wifiSsid?: string | null;
  wifiClave?: string | null;
  wifiSiempre?: boolean;
  huesped?: string | null;
  llegada?: string | null;
  salida?: string | null;
  checkin?: string;
  checkout?: string;
  bienvenida?: string | null;
  notaTitulo?: string | null;
  notaTexto?: string | null;
  foto?: string | null;
  relojPosicion?: VillaTv['relojPosicion'];
  habilitada?: boolean;
}
