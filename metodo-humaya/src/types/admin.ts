/**
 * Un texto escrito por el hotel en los idiomas que quiso.
 *
 * Parcial a propósito: un hotel puede renombrar algo solo en español y dejar
 * que el inglés siga saliendo de la traducción de la app.
 */
export type PorIdioma = Partial<Record<'es' | 'en', string>>;

/** Una opción del Home/menú del huésped, configurable desde /staff/admin. */
export interface AdminOpcion {
  id: string;
  clave: string;
  etiqueta: string;
  descripcion: string | null;
  icono: string | null;
  habilitada: boolean;
  orden: number;
  /**
   * El nombre que este hotel le da a la opción, por idioma.
   *
   * Existe desde el 20 de noviembre de 2026. Antes `etiqueta` era
   * configurable solo en apariencia: la app del huésped hace
   * `t('nav.' + clave, etiqueta)`, y para las seis opciones sembradas gana
   * siempre la traducción del archivo — cambiar la etiqueta no hacía nada.
   */
  etiquetas: PorIdioma;
  /** La línea de abajo de la ficha del Home, por idioma. */
  descripciones: PorIdioma;
}

/** Un servicio reservable del catálogo, más allá de Sauna/Cold Plunge. */
export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  proveedor: string | null;
  precioUsd: number | null;
  unidadPrecio: string;
  duracionMin: number;
  horaInicio: string;
  horaFin: string;
  habilitado: boolean;
  orden: number;
}

export interface ServicioSlot {
  start: string;
  taken: boolean;
}
