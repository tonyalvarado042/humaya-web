import { elNegocio } from './negocio';
import { cliente } from './sesion';

/**
 * La portada interna del hotel: los enlaces que usa su equipo.
 *
 * ── DE DÓNDE SALE ───────────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026: «generé una landing configurable para cada
 * hotel desde admin con todos links… Visión x10, Panel guest, Panel
 * recepción, Cloud beds, Sitio web. Algo bonito y llamativo para uso
 * interno. Debe ser para cada hotel que se cree».
 *
 * Hasta hoy cada persona del equipo se guardaba esas direcciones en los
 * favoritos de su navegador, y nadie podía mandarle a un hotel nuevo «entrá
 * acá y de ahí sale todo».
 *
 * ── POR QUÉ ES UNA TABLA Y NO UNA LISTA EN EL CÓDIGO ────────────────────
 * Porque cada hotel tiene otras herramientas. HUMAYA trabaja con Cloudbeds y
 * tiene sitio web; otro hotel puede usar otro PMS, o tener un panel de
 * contabilidad, o no tener sitio. Una lista en el código serviría a UN hotel
 * y obligaría a desplegar para cambiarle un enlace a cualquiera.
 *
 * Un hotel nuevo nace con los suyos: ver `humaya_sembrar_hotel` en
 * `supabase/migraciones-aplicadas/2026-11-24-hotel-nuevo-nace-completo.sql`.
 *
 * ── POR QUÉ NO SE LEEN SIN SESIÓN ───────────────────────────────────────
 * Porque la lista de herramientas internas de un hotel dice con qué PMS
 * trabaja y qué dominios usa. Por eso la tabla no le dio permiso a `anon`,
 * al revés que las otras `humaya_*`, que el huésped lee a través de una
 * función con llave de servicio.
 */

export interface Enlace {
  id: string;
  /**
   * Los sembrados la llevan (`recepcion`, `guest`, `vision`, `cloudbeds`,
   * `sitio`); los que agregue el hotel van en null. No se muestra: existe
   * para que sembrar dos veces no duplique.
   */
  clave: string | null;
  etiqueta: string;
  descripcion: string | null;
  url: string;
  icono: string | null;
  orden: number;
  habilitado: boolean;
}

export interface NuevoEnlace {
  etiqueta: string;
  url: string;
  descripcion?: string;
  icono?: string;
}

export interface CambiosEnlace {
  etiqueta?: string;
  url?: string;
  descripcion?: string | null;
  icono?: string | null;
}

/**
 * Los íconos que la portada sabe dibujar.
 *
 * Es una lista cerrada a propósito: la base guarda un nombre, y un nombre
 * que la pantalla no reconozca se dibuja como un enlace genérico en vez de
 * dejar la ficha en blanco. Quien elige, elige de acá.
 */
export const ICONOS_DE_ENLACE = [
  'concierge-bell',
  'smartphone',
  'gauge',
  'calendar-check',
  'globe',
  'monitor-play',
  'mail',
  'message-circle',
  'credit-card',
  'chart-column',
  'book-open',
  'key-round',
  'wifi',
  'map-pin',
  'users',
  'wrench',
  'link',
] as const;

export type IconoDeEnlace = (typeof ICONOS_DE_ENLACE)[number];

const COLUMNAS = 'id,clave,etiqueta,descripcion,url,icono,orden,habilitado';

interface Fila {
  id: string;
  clave: string | null;
  etiqueta: string;
  descripcion: string | null;
  url: string;
  icono: string | null;
  orden: number;
  habilitado: boolean;
}

const aEnlace = (f: Fila): Enlace => ({
  id: f.id,
  clave: f.clave,
  etiqueta: f.etiqueta,
  descripcion: f.descripcion,
  url: f.url,
  icono: f.icono,
  orden: f.orden,
  habilitado: f.habilitado,
});

/**
 * Deja una dirección lista para poner en un `href`, o devuelve null.
 *
 * ── POR QUÉ ESTO NO ES COSMÉTICO ────────────────────────────────────────
 * Esta dirección la escribe una persona y termina dentro de un `<a href>`
 * que ve todo el equipo del hotel. Sin este filtro, un `javascript:…`
 * guardado acá correría código en la sesión de recepción de cualquiera que
 * toque la ficha. Se aceptan `http` y `https` y nada más.
 *
 * Y se le pone `https://` a lo que venga pelado, porque nadie escribe el
 * protocolo: un `liderax10.com` sin él se interpretaría como ruta relativa y
 * el enlace llevaría a `/staff/liderax10.com`.
 */
export function direccionLimpia(texto: string): string | null {
  const crudo = texto.trim();
  if (!crudo) return null;
  const conProtocolo = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(crudo) ? crudo : `https://${crudo}`;
  let url: URL;
  try {
    url = new URL(conProtocolo);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  return url.toString();
}

export async function getEnlaces(soloHabilitados = false): Promise<Enlace[]> {
  const db = await cliente();
  let consulta = db
    .from('humaya_enlaces')
    .select(COLUMNAS)
    .eq('negocio_id', elNegocio())
    .order('orden', { ascending: true });
  if (soloHabilitados) consulta = consulta.eq('habilitado', true);

  const { data, error } = await consulta;
  if (error) throw new Error(`enlaces_${error.code ?? 'error'}`);
  return ((data ?? []) as Fila[]).map(aEnlace);
}

export async function crearEnlace(nuevo: NuevoEnlace): Promise<Enlace> {
  const url = direccionLimpia(nuevo.url);
  if (!url) throw new Error('enlace_direccion_invalida');
  const etiqueta = nuevo.etiqueta.trim();
  if (!etiqueta) throw new Error('enlace_sin_nombre');

  const db = await cliente();

  // Entra al final. Si naciera con orden 0 se colaría delante de recepción,
  // que es el enlace que el equipo usa todos los días.
  const { data: ultimos } = await db
    .from('humaya_enlaces')
    .select('orden')
    .eq('negocio_id', elNegocio())
    .order('orden', { ascending: false })
    .limit(1);
  const orden = ((ultimos?.[0] as { orden?: number } | undefined)?.orden ?? 0) + 1;

  const { data, error } = await db
    .from('humaya_enlaces')
    .insert({
      negocio_id: elNegocio(),
      etiqueta,
      url,
      descripcion: nuevo.descripcion?.trim() || null,
      icono: nuevo.icono || 'link',
      orden,
    })
    .select(COLUMNAS)
    .single();

  if (error) throw new Error(`enlaces_${error.code ?? 'error'}`);
  return aEnlace(data as Fila);
}

export async function editarEnlace(id: string, cambios: CambiosEnlace): Promise<void> {
  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };

  if (cambios.etiqueta !== undefined) {
    const etiqueta = cambios.etiqueta.trim();
    if (!etiqueta) throw new Error('enlace_sin_nombre');
    fila.etiqueta = etiqueta;
  }
  if (cambios.url !== undefined) {
    const url = direccionLimpia(cambios.url);
    if (!url) throw new Error('enlace_direccion_invalida');
    fila.url = url;
  }
  if (cambios.descripcion !== undefined) {
    fila.descripcion = cambios.descripcion?.trim() || null;
  }
  if (cambios.icono !== undefined) fila.icono = cambios.icono;

  await escribir(id, fila);
}

export async function toggleEnlace(id: string, habilitado: boolean): Promise<void> {
  await escribir(id, { habilitado, actualizado_en: new Date().toISOString() });
}

/**
 * Subir o bajar una ficha, intercambiando el orden con su vecina.
 *
 * Se le pasa la lista que la pantalla ya tiene en la mano, porque el vecino
 * se decide sobre lo que se está viendo. Devuelve si hizo algo: la primera
 * no sube y la última no baja, y la pantalla no ofrece ese botón.
 */
export async function moverEnlace(
  lista: Enlace[],
  id: string,
  hacia: 'arriba' | 'abajo',
): Promise<boolean> {
  const desde = lista.findIndex((enlace) => enlace.id === id);
  if (desde < 0) return false;
  const hasta = hacia === 'arriba' ? desde - 1 : desde + 1;
  if (hasta < 0 || hasta >= lista.length) return false;

  const uno = lista[desde];
  const otro = lista[hasta];

  // Dos órdenes iguales dejarían el empate a decidir por la base, que no
  // promete ningún desempate. Cuando empatan se reescriben las dos con la
  // posición que les toca, no se intercambian.
  const [ordenUno, ordenOtro] =
    uno.orden === otro.orden ? [hasta + 1, desde + 1] : [otro.orden, uno.orden];

  await escribir(uno.id, { orden: ordenUno, actualizado_en: new Date().toISOString() });
  await escribir(otro.id, { orden: ordenOtro, actualizado_en: new Date().toISOString() });
  return true;
}

export async function borrarEnlace(id: string): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_enlaces')
    .delete()
    .eq('negocio_id', elNegocio())
    .eq('id', id)
    .select('id');

  if (error) throw new Error(`enlaces_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('enlaces_sin_permiso');
}

/**
 * `select()` después de escribir no es decoración: sin él, una fila que RLS
 * no deja tocar devuelve éxito con cero filas, y la pantalla diría que
 * guardó algo que no guardó.
 */
async function escribir(id: string, fila: Record<string, unknown>): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_enlaces')
    .update(fila)
    .eq('id', id)
    .eq('negocio_id', elNegocio())
    .select('id');

  if (error) throw new Error(`enlaces_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('enlaces_sin_permiso');
}
