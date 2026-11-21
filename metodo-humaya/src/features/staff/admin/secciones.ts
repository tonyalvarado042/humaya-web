import { Image, LayoutGrid, MonitorPlay, Settings2, Sparkles, SprayCan } from 'lucide-react';

/**
 * Admin, separada por función.
 *
 * ── POR QUÉ DEJÓ DE SER UNA SOLA PANTALLA ───────────────────────────────
 * Tony, 20 de noviembre de 2026: «debes mejorar Admin y separar por función,
 * ejemplo: Admin - página TV, todo de TV».
 *
 * Tenía razón y se veía: /staff/admin era una sola columna con el interruptor
 * del demo, seis opciones de menú, el bot del Concierge con su llave y sus
 * respuestas guardadas, el catálogo de servicios con su formulario, y las
 * pantallas de los televisores. Para cambiarle el precio a un servicio había
 * que pasar de largo por la llave de la API; para colgar un televisor nuevo,
 * bajar por todo lo demás. Y cada vez que se cargaba, se cargaba todo.
 *
 * Ahora cada función es una dirección. Se puede mandar un enlace a
 * `/staff/admin/tv` y es lo único que esa persona ve.
 *
 * ── POR QUÉ LA LISTA VIVE ACÁ Y NO EN LA PANTALLA ───────────────────────
 * Porque la usan tres: el menú de arriba, la portada con las fichas, y el
 * título de cada sección. Tres lugares donde escribir lo mismo son tres
 * lugares para que se desincronicen.
 */
export interface SeccionAdmin {
  /** El pedazo de la dirección. Vacío es la portada. */
  ruta: string;
  titulo: string;
  /** Qué se hace acá, para la ficha de la portada. */
  cuerpo: string;
  Icon: typeof LayoutGrid;
  /** Si hace falta rol `administrador` para cambiar algo de esta sección. */
  soloAdmin: boolean;
}

export const SECCIONES_ADMIN: SeccionAdmin[] = [
  {
    ruta: 'marca',
    titulo: 'Marca',
    cuerpo:
      'Cómo se llama el hotel, a dónde escribe el huésped, y con qué colores y letras se ve la app.',
    Icon: Image,
    soloAdmin: true,
  },
  {
    ruta: 'menu',
    titulo: 'Menú del huésped',
    cuerpo:
      'Qué opciones ve el huésped en el Home y en la barra de abajo, y cómo se llama cada una en español y en inglés.',
    Icon: LayoutGrid,
    soloAdmin: true,
  },
  {
    ruta: 'servicios',
    titulo: 'Servicios',
    cuerpo: 'El catálogo que el huésped puede reservar: precio, con quién, duración y horario.',
    Icon: SprayCan,
    soloAdmin: true,
  },
  {
    ruta: 'concierge',
    titulo: 'Concierge',
    cuerpo: 'El bot que contesta de noche: su llave, lo que sabe y las respuestas guardadas.',
    Icon: Sparkles,
    soloAdmin: true,
  },
  {
    ruta: 'tv',
    titulo: 'Pantalla del TV',
    cuerpo: 'El televisor de cada villa: su nombre, su foto, su mensaje y su dirección.',
    Icon: MonitorPlay,
    soloAdmin: true,
  },
  {
    ruta: 'ajustes',
    titulo: 'Ajustes',
    cuerpo: 'Los datos de ejemplo de la demo, y lo que no es de ninguna de las otras secciones.',
    Icon: Settings2,
    soloAdmin: true,
  },
];

/** El título de la sección que corresponde a esta dirección, o null. */
export function seccionDe(pathname: string): SeccionAdmin | null {
  const resto = pathname.replace(/^.*\/staff\/admin\/?/, '').split('/')[0];
  return SECCIONES_ADMIN.find((seccion) => seccion.ruta === resto) ?? null;
}
