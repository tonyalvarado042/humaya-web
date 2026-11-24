import { SUPABASE_KEY, SUPABASE_URL } from './sesion';
import { comoTema, type Tema } from './tema';

/**
 * De qué hotel es esta pantalla.
 *
 * ── POR QUÉ ESTO EXISTE ─────────────────────────────────────────────────
 * Hasta el 20 de noviembre de 2026 la marca y los dominios salían de
 * variables de entorno fijadas AL COMPILAR. Con eso, «crear un hotel nuevo»
 * significaba un despliegue nuevo, dominios nuevos y variables nuevas — no
 * era crearlo desde un panel.
 *
 * Decisión de Tony ese día: un solo producto, como vision.liderax10.com.
 * Recepción en `hotelexp.liderax10.com`, el huésped en
 * `guestexp.liderax10.com`. Ahora el hotel se resuelve al arrancar y crear
 * uno es una fila, no un despliegue.
 *
 * ── POR QUÉ NO USA EL CLIENTE DE SUPABASE ───────────────────────────────
 * Porque `cliente()` descarga el SDK de Auth, y el huésped entra desde el
 * teléfono sin cuenta: no tiene por qué bajarse eso para ver el nombre del
 * hotel. Dos `fetch` contra la API REST alcanzan.
 *
 * ── POR QUÉ DOS FUNCIONES EN LA BASE Y NO LAS TABLAS ABIERTAS ───────────
 * Una política `using (true)` dejaría descargar la lista completa de hoteles
 * y sus dominios, que es la lista de clientes. Las funciones contestan por
 * UN dominio o UN código a la vez, y hay que saberlo de antemano.
 */

export interface Hotel {
  negocioId: string;
  codigo: string;
  marcaExperiencia: string;
  marcaHotel: string;
  correo: string;
  /** Colores y tipografia propios, o null para la paleta de siempre. */
  tema: Tema | null;
  /**
   * Hotel de demostracion. La portada del dominio compartido lo dice y
   * avisa que los datos son ficticios; en un hotel de verdad eso seria
   * mentira, y ademas el huesped la lee.
   */
  esDemo: boolean;
}

export type Lado = 'huesped' | 'personal' | 'ambos';

export interface Resolucion {
  lado: Lado;
  /** Null cuando el dominio es compartido y la dirección no dice qué hotel. */
  hotel: Hotel | null;
  /**
   * El prefijo que llevan todas las rutas. Vacío en el dominio propio de un
   * hotel; `/humaya` en el dominio compartido.
   */
  base: string;
  /** Si el dominio es del producto y no de un hotel en particular. */
  compartido: boolean;
  /**
   * Los dos dominios de ESTE juego: el del huésped y el de recepción, o null
   * cuando la base no los conoce.
   *
   * Salían de variables de entorno fijadas al compilar, y por eso un hotel
   * del dominio compartido mandaba su recepción al dominio de HUMAYA.
   */
  dominios: { huesped: string | null; personal: string | null };
}

/**
 * Cuanto se espera antes de abrir con la marca de respaldo.
 *
 * Esta consulta corre ANTES de pintar nada: sin tope, una base lenta deja al
 * huesped mirando una pantalla en blanco sin fin. Tres segundos es mucho mas
 * de lo que tarda, y mucho menos de lo que aguanta alguien parado en la
 * recepcion de un hotel.
 */
const ESPERA_MAX_MS = 3000;

async function rpc<T>(nombre: string, cuerpo: Record<string, string>): Promise<T[]> {
  const corte = AbortSignal.timeout(ESPERA_MAX_MS);
  const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nombre}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cuerpo),
    signal: corte,
  });
  if (!respuesta.ok) throw new Error(`hotel_http_${respuesta.status}`);
  return (await respuesta.json()) as T[];
}

interface FilaDominio {
  lado: Lado;
  compartido: boolean;
  negocio_id: string | null;
  codigo: string | null;
  marca_experiencia: string | null;
  marca_hotel: string | null;
  correo: string | null;
  tema: unknown;
  es_demo: boolean | null;
  dominio_huesped: string | null;
  dominio_personal: string | null;
}

/** Sin fila o sin red: no se inventa ningun dominio. */
const SIN_DOMINIOS = { huesped: null, personal: null } as const;

interface FilaCodigo {
  negocio_id: string;
  codigo: string;
  marca_experiencia: string;
  marca_hotel: string;
  correo: string;
  tema: unknown;
  es_demo?: boolean;
}

const aHotel = (f: FilaCodigo): Hotel => ({
  negocioId: f.negocio_id,
  codigo: f.codigo,
  marcaExperiencia: f.marca_experiencia,
  marcaHotel: f.marca_hotel,
  correo: f.correo,
  tema: comoTema(f.tema),
  esDemo: f.es_demo ?? false,
});

/**
 * El primer pedazo de la ruta, si parece un código de hotel.
 *
 * `/humaya/app` → `humaya`. `/app` → null, porque `app` es una ruta nuestra
 * y no el código de nadie: sin esta lista, entrar a `/app` en el dominio
 * compartido buscaría un hotel llamado «app».
 */
const RUTAS_NUESTRAS = new Set(['app', 'staff', 'entrada', 'dev', 'assets']);

export function codigoDeLaRuta(pathname: string): string | null {
  const primero = pathname.split('/').filter(Boolean)[0] ?? '';
  if (!primero || RUTAS_NUESTRAS.has(primero)) return null;
  return /^[a-z0-9][a-z0-9-]{0,39}$/.test(primero) ? primero : null;
}

/**
 * Qué lado sirve un dominio que la base no conoce: local, un preview, o un
 * dominio recién agregado que todavía no tiene fila.
 *
 * Mira el prefijo y no el dominio entero, para que siga valiendo cuando los
 * dominios sean otros.
 */
export function ladoDe(hostname: string): Lado {
  if (hostname.startsWith('staff.') || hostname.startsWith('hotelexp.')) return 'personal';
  if (hostname.startsWith('experience.') || hostname.startsWith('guestexp.')) return 'huesped';
  return 'ambos';
}

/**
 * Resuelve el hotel de esta pantalla.
 *
 * Nunca lanza: si la base no contesta, se devuelve lo que se pueda deducir
 * del dominio. Una app que no abre porque no pudo preguntar la marca es
 * mucho peor que una app que abre con la marca por defecto.
 */
export async function resolverHotel(hostname: string, pathname: string): Promise<Resolucion> {
  const lado = ladoDe(hostname);

  let fila: FilaDominio | undefined;
  try {
    [fila] = await rpc<FilaDominio>('humaya_hotel_de_dominio', { p_dominio: hostname });
  } catch {
    return { lado, hotel: null, base: '', compartido: false, dominios: { ...SIN_DOMINIOS } };
  }

  // Dominio propio de un hotel: la dirección ya dice quién es.
  if (fila && !fila.compartido && fila.negocio_id && fila.codigo) {
    return {
      lado: fila.lado,
      hotel: aHotel({
        negocio_id: fila.negocio_id,
        codigo: fila.codigo,
        marca_experiencia: fila.marca_experiencia ?? '',
        marca_hotel: fila.marca_hotel ?? '',
        correo: fila.correo ?? '',
        tema: fila.tema,
        es_demo: fila.es_demo ?? false,
      }),
      base: '',
      compartido: false,
      dominios: { huesped: fila.dominio_huesped, personal: fila.dominio_personal },
    };
  }

  const compartido = fila?.compartido ?? false;
  const ladoFinal = fila?.lado ?? lado;
  const dominios = {
    huesped: fila?.dominio_huesped ?? null,
    personal: fila?.dominio_personal ?? null,
  };

  // Dominio compartido: del lado del huésped el hotel lo dice la ruta. Del
  // lado de recepción lo dice la cuenta, y eso se resuelve después de entrar.
  const codigo = codigoDeLaRuta(pathname);
  if (compartido && ladoFinal === 'huesped' && codigo) {
    try {
      const [hotel] = await rpc<FilaCodigo>('humaya_hotel_de_codigo', { p_codigo: codigo });
      if (hotel) {
        return { lado: ladoFinal, hotel: aHotel(hotel), base: `/${codigo}`, compartido, dominios };
      }
    } catch {
      // Sin red se sigue sin hotel; la pantalla lo dice.
    }
  }

  return { lado: ladoFinal, hotel: null, base: '', compartido, dominios };
}
