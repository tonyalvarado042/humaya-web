import { elNegocio } from './negocio';
import { comoTema, type Tema } from './tema';

/**
 * La marca del hotel: cómo se llama, a dónde escribe el huésped, y con qué
 * colores y letras se ve.
 *
 * ── POR QUÉ VA DIRECTO A LA TABLA Y NO POR LA FUNCIÓN ───────────────────
 * Igual que editar un servicio. Quién puede cambiar esto lo decide RLS: la
 * política `humaya_hoteles_admin` exige rol `administrador`, y
 * `humaya_hoteles_equipo` deja LEER a todo recepción. Que lo haga cumplir la
 * base es más seguro que una comprobación en el camino que se puede olvidar.
 *
 * ── POR QUÉ EL TEMA NO SE PISA ENTERO SI NO SE MANDA ────────────────────
 * `tema` es una sola columna `jsonb`. Mandar la mitad de los campos borraría
 * la otra mitad. Así que el formulario manda SIEMPRE el objeto completo —lo
 * leyó al abrir— y acá se guarda tal cual. Un campo vacío se saca del objeto
 * en vez de guardarse como cadena vacía: un `''` haría que `esColor()` lo
 * rechace cada vez, pero quedaría ahí para siempre ensuciando la fila.
 */

export interface MarcaDelHotel {
  marcaExperiencia: string;
  marcaHotel: string;
  correo: string;
  tema: Tema | null;
}

interface FilaHotel {
  marca_experiencia: string | null;
  marca_hotel: string | null;
  correo: string | null;
  tema: unknown;
}

export async function getMarcaDelHotel(): Promise<MarcaDelHotel> {
  const { cliente } = await import('./sesion');
  const db = await cliente();

  const { data, error } = await db
    .from('humaya_hoteles')
    .select('marca_experiencia,marca_hotel,correo,tema')
    .eq('negocio_id', elNegocio())
    .maybeSingle<FilaHotel>();

  if (error) throw new Error(`marca_${error.code ?? 'error'}`);
  // Sin fila no se devuelve una marca inventada: esta pantalla existe para
  // editar la del hotel, y si no hay hotel no hay nada que editar.
  if (!data) throw new Error('marca_sin_hotel');

  return {
    marcaExperiencia: data.marca_experiencia ?? '',
    marcaHotel: data.marca_hotel ?? '',
    correo: data.correo ?? '',
    tema: comoTema(data.tema),
  };
}

/** Lo que el formulario deja cambiar. Un `undefined` no pisa lo que hay. */
export interface CambiosDeMarca {
  marcaExperiencia?: string;
  marcaHotel?: string;
  correo?: string;
  tema?: Tema | null;
}

/**
 * Saca los campos vacíos: una cadena vacía guardada es basura que queda.
 *
 * Se recorta ANTES de decidir, no después. Lo encontró un test: un campo con
 * solo espacios no era `''` al comprobarlo, así que pasaba el filtro, y
 * recién al guardarlo se convertía en cadena vacía — justo lo que este filtro
 * existe para evitar.
 */
export function temaLimpio(tema: Tema | null): Tema | null {
  if (!tema) return null;
  const limpio: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(tema)) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (typeof valor === 'string') {
      const texto = valor.trim();
      if (!texto) continue;
      limpio[campo] = texto;
      continue;
    }
    limpio[campo] = valor;
  }
  return Object.keys(limpio).length > 0 ? (limpio as Tema) : null;
}

export async function guardarMarcaDelHotel(cambios: CambiosDeMarca): Promise<void> {
  const { cliente } = await import('./sesion');
  const db = await cliente();

  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  if (cambios.marcaExperiencia !== undefined) fila.marca_experiencia = cambios.marcaExperiencia;
  if (cambios.marcaHotel !== undefined) fila.marca_hotel = cambios.marcaHotel;
  if (cambios.correo !== undefined) fila.correo = cambios.correo;
  // `{}` y no null: la columna es `not null default '{}'`, y además `{}`
  // significa exactamente «este hotel usa la paleta de siempre».
  if (cambios.tema !== undefined) fila.tema = temaLimpio(cambios.tema) ?? {};

  // `select()` después del update no es decorativo: sin él, una fila que RLS
  // no deja tocar devuelve éxito con cero filas, y la pantalla diría que
  // guardó algo que no guardó.
  const { data, error } = await db
    .from('humaya_hoteles')
    .update(fila)
    .eq('negocio_id', elNegocio())
    .select('negocio_id');

  if (error) throw new Error(`marca_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('marca_sin_permiso');
}
