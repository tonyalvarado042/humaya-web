import type { Hotel, Lado } from './services/hotel';
import { aplicarTema, type Tema } from './services/tema';

/**
 * La marca del hotel que está sirviendo esta pantalla.
 *
 * ── CÓMO LLEGA ACÁ ──────────────────────────────────────────────────────
 * La resuelve `resolverHotel()` antes de que la app pinte nada, y
 * `aplicarHotel()` la deja puesta. Las pantallas siguen leyendo `MARCA.hotel`
 * igual que siempre: ninguna cambió cuando esto dejó de salir de variables de
 * entorno.
 *
 * ── POR QUÉ YA NO SON VARIABLES DE ENTORNO ──────────────────────────────
 * Lo eran, fijadas al compilar. Con eso, «crear un hotel nuevo» significaba
 * un despliegue nuevo con otras variables — no era crearlo desde un panel.
 * Decisión de Tony del 20 de noviembre de 2026: un solo producto, como
 * vision.liderax10.com. Crear un hotel pasa a ser una fila.
 *
 * Las variables quedan como RESPALDO, para local, los previews y el momento
 * en que la base no contesta. Una app que no abre porque no pudo preguntar
 * la marca es mucho peor que una que abre con la marca por defecto.
 *
 * ── EL NOMBRE ───────────────────────────────────────────────────────────
 * Se llama **HUMAYA Experience**. Decisión de Tony del 11 de noviembre:
 *
 *   «Método Humaya… esa la veo como remedio.»
 *
 * Tenía razón: *método* nombra un sistema, y lo que hay que nombrar es algo
 * que la persona se lleva puesto. Además suena clínico, que es lo contrario
 * de lo que vende un hotel de bienestar.
 *
 * ⚠️ «Protocolo» queda PROHIBIDO por la misma razón — suena todavía más a
 * hospital. Donde haga falta esa idea se escribe «el orden» o «la secuencia».
 *
 * Es nombre propio: **no se traduce**. Va igual en inglés y en español, y por
 * eso entra en los archivos de traducción como la variable {{experiencia}}
 * en vez de estar escrito dos veces.
 */

const PORDEFECTO = {
  experiencia:
    (import.meta.env.VITE_MARCA_EXPERIENCIA as string | undefined) ?? 'HUMAYA Experience',
  hotel: (import.meta.env.VITE_MARCA_HOTEL as string | undefined) ?? 'HUMAYA',
  correo:
    (import.meta.env.VITE_MARCA_CORREO as string | undefined) ?? 'reservations@stayhumaya.com',
  dominioHuesped:
    (import.meta.env.VITE_DOMINIO_HUESPED as string | undefined) ??
    'https://experience.stayhumaya.com',
  dominioPersonal:
    (import.meta.env.VITE_DOMINIO_PERSONAL as string | undefined) ?? 'https://staff.stayhumaya.com',
};

let actual = { ...PORDEFECTO };
/** Los dominios que dio la base, o null mientras no haya contestado. */
let resueltos: { huesped: string | null; personal: string | null } = {
  huesped: null,
  personal: null,
};
let negocio: string | null = null;
let codigo: string | null = null;
let esDemo = false;
let portada: { titulo: string | null; bajada: string | null } = { titulo: null, bajada: null };
let tema: Tema | null = null;

/**
 * Los dos dominios de este juego, tal como los dio la base.
 *
 * ── POR QUÉ NO BASTA EL RESPALDO DEL ENTORNO ────────────────────────────
 * Porque el respaldo es el de HUMAYA. Mientras estos dominios salieron solo
 * del entorno, el botón «Recepción» de guestexp.liderax10.com/demo mandaba a
 * staff.stayhumaya.com — el dominio de otro hotel. Comprobado en vivo el 24
 * de noviembre de 2026: terminaba en «Esta dirección no existe».
 *
 * `aplicarHotel()` pisaba el nombre y el correo, pero no los dominios:
 * router.tsx ya lo tenía escrito como advertencia.
 *
 * ── POR QUÉ VIVEN APARTE DE `actual` ───────────────────────────────────
 * Porque `aplicarHotel()` reconstruye `actual` entero desde PORDEFECTO, y
 * volvería a dejar los de HUMAYA. Los dominios son del juego de direcciones,
 * no del hotel: en el dominio compartido los comparten todos, y se resuelven
 * una vez al arrancar, antes de saber siquiera qué hotel es.
 */
export function aplicarDominios(dominios: {
  huesped: string | null;
  personal: string | null;
}): void {
  resueltos = {
    huesped: dominios.huesped ? `https://${dominios.huesped}` : null,
    personal: dominios.personal ? `https://${dominios.personal}` : null,
  };
}

/** Deja puesto el hotel resuelto. Lo llama `main.tsx` antes de pintar. */
export function aplicarHotel(hotel: Hotel | null): void {
  if (!hotel) {
    actual = { ...PORDEFECTO };
    negocio = null;
    codigo = null;
    esDemo = false;
    portada = { titulo: null, bajada: null };
    tema = null;
    aplicarTema(null);
    void avisarALosTextos(PORDEFECTO.experiencia);
    return;
  }
  actual = {
    ...PORDEFECTO,
    experiencia: hotel.marcaExperiencia || PORDEFECTO.experiencia,
    hotel: hotel.marcaHotel || PORDEFECTO.hotel,
    correo: hotel.correo || PORDEFECTO.correo,
  };
  negocio = hotel.negocioId;
  codigo = hotel.codigo;
  esDemo = hotel.esDemo;
  portada = { titulo: hotel.portadaTitulo, bajada: hotel.portadaBajada };
  tema = hotel.tema;
  // Los colores se ponen acá, en el mismo momento que el nombre, y por la
  // misma razón: esto corre antes de pintar. Ponerlos después haría que el
  // huésped viera la paleta de OTRO hotel durante un instante.
  aplicarTema(tema);
  void avisarALosTextos(actual.experiencia);
}

/**
 * Los archivos de traducción usan `{{experiencia}}`, y esa variable se fija
 * al arrancar i18n — antes de que se sepa qué hotel es. Hay que volver a
 * ponerla.
 *
 * El import es dinámico para no atar `marca.ts` a i18n: lo usa también la
 * pantalla del TV, que no traduce nada.
 */
async function avisarALosTextos(experiencia: string): Promise<void> {
  try {
    const { aplicarMarcaEnTextos } = await import('@/i18n');
    aplicarMarcaEnTextos(experiencia);
  } catch {
    // Sin i18n cargado no hay textos que avisar.
  }
}

/**
 * De qué hotel son los datos que se van a leer y escribir.
 *
 * Null mientras no se haya resuelto. Quien escriba una fila tiene que
 * mandarlo: las tablas dejaron de tener HUMAYA como valor por defecto justo
 * para que una fila sin hotel se note en vez de caer callada en Humaya.
 */
export function negocioActual(): string | null {
  return negocio;
}

/** El titular de la portada que eligio este hotel, o null. */
export function portadaDelHotel(): { titulo: string | null; bajada: string | null } {
  return portada;
}

export function esHotelDeDemostracion(): boolean {
  return esDemo;
}

export function codigoActual(): string | null {
  return codigo;
}

/**
 * Los colores y las fuentes de este hotel, o null si usa la paleta de siempre.
 *
 * Lo lee el formulario de marca para nacer con lo que ya está guardado, en vez
 * de nacer vacío y borrar al guardar lo que nadie tocó.
 */
export function temaActual(): Tema | null {
  return tema;
}

/**
 * Deja puesto un tema recién guardado, sin recargar.
 *
 * Lo llama la pantalla de marca después de guardar: cambiar un color y tener
 * que recargar para verlo convierte elegir una paleta en adivinar.
 */
export function aplicarTemaNuevo(nuevo: Tema | null): void {
  tema = nuevo;
  aplicarTema(nuevo);
}

export const MARCA = {
  /** El marco de la estadía. Nombre propio, no se traduce. */
  get experiencia() {
    return actual.experiencia;
  },
  /** El hotel que sirve esta pantalla. */
  get hotel() {
    return actual.hotel;
  },
  /** De dónde sale el correo y a dónde escribe el huésped si algo falla. */
  get correo() {
    return actual.correo;
  },
  /**
   * Los dos dominios de este hotel. El huésped y el personal viven separados
   * a pedido de Tony (15 de noviembre de 2026).
   *
   * Sirven para mandar a cada quien a su casa: quien pida /staff en el
   * dominio del huésped sale para el del personal, y al revés.
   */
  get dominioHuesped() {
    return resueltos.huesped ?? actual.dominioHuesped;
  },
  get dominioPersonal() {
    return resueltos.personal ?? actual.dominioPersonal;
  },
  /**
   * ¿Se manda a cada quien a su dominio?
   *
   * Sí desde el 16 de noviembre de 2026, cuando staff.stayhumaya.com empezó
   * a resolver. Lo que protege los datos sigue siendo la puerta, no el
   * subdominio: /staff exige cuenta y clave del CRM en cualquiera de los dos.
   *
   * Para apagarlo: VITE_DOMINIOS_SEPARADOS=false.
   */
  get dominiosSeparados() {
    return import.meta.env.VITE_DOMINIOS_SEPARADOS !== 'false';
  },
};

export type { Lado };
export { ladoDe } from './services/hotel';
