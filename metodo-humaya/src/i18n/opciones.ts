import type { AdminOpcion, PorIdioma } from '@/types';
import type { GuestLanguage } from './localizedText';
import i18n from './index';

/**
 * Cómo se llama una opción del menú para ESTE huésped, en ESTE hotel.
 *
 * ── EL PROBLEMA QUE RESUELVE ────────────────────────────────────────────
 * `humaya_admin_opciones.etiqueta` se mostraba en /staff/admin como si fuera
 * configurable, y no lo era: la app hace `t('nav.' + clave, etiqueta)`, así
 * que para las seis opciones sembradas ganaba siempre la traducción del
 * archivo y la etiqueta de la base no se veía nunca. Un campo que se puede
 * cambiar y no cambia nada es peor que un campo que no existe.
 *
 * ── EL ORDEN, Y POR QUÉ ES ESE ──────────────────────────────────────────
 * 1. Lo que escribió el hotel EN EL IDIOMA DEL HUÉSPED. Es lo más específico
 *    que hay: este hotel, para esta persona.
 * 2. El texto por defecto. Lo decide quien llama: para una etiqueta es la
 *    traducción de la app, y para una descripción es la columna de siempre.
 * 3. Lo que escribió el hotel en el OTRO idioma.
 *
 * El 2 va antes del 3 a propósito, y lo encontró un test: un hotel que llenó
 * solo el español NO quiso que un huésped en inglés leyera español — quiso
 * dejar el inglés como estaba. Al revés, una descripción escrita solo en
 * inglés le tapaba al huésped en español la que ya tenía.
 *
 * El 3 existe para las opciones NUEVAS, que no tienen ni traducción ni
 * columna vieja: ahí leerlo en el otro idioma es mejor que no leer nada.
 */
export function textoPorIdioma(
  textos: PorIdioma,
  idioma: GuestLanguage,
  pordefecto: string | null,
): string | null {
  const mio = textos[idioma]?.trim();
  if (mio) return mio;

  const base = pordefecto?.trim();
  if (base) return base;

  const otro = idioma === 'es' ? textos.en?.trim() : textos.es?.trim();
  return otro ? otro : null;
}

/**
 * La traducción de la app para esta opción, o null si no tiene.
 *
 * `exists` y no `t` directo: `t('nav.sauna')` devuelve la llave misma cuando
 * no hay traducción, y «nav.sauna» en pantalla es peor que nada.
 */
function traduccionDe(clave: string, idioma: GuestLanguage): string | null {
  const llave = `nav.${clave}`;
  return i18n.exists(llave, { lng: idioma }) ? i18n.t(llave, { lng: idioma }) : null;
}

export function etiquetaDeOpcion(opcion: AdminOpcion, idioma: GuestLanguage): string {
  const pordefecto = traduccionDe(opcion.clave, idioma) ?? opcion.etiqueta;
  // El `?? opcion.clave` no debería pasar nunca —una opción sin ningún texto
  // no existe— pero la clave es legible y no deja una ficha sin nombre.
  return textoPorIdioma(opcion.etiquetas ?? {}, idioma, pordefecto) ?? opcion.clave;
}

/**
 * La línea de abajo de la ficha. Acá NO hay traducción de la app con la que
 * competir: las descripciones nunca estuvieron en los archivos de idioma, así
 * que el texto por defecto es la columna de siempre.
 */
export function descripcionDeOpcion(opcion: AdminOpcion, idioma: GuestLanguage): string | null {
  return textoPorIdioma(opcion.descripciones ?? {}, idioma, opcion.descripcion);
}
