import { cliente } from './sesion';
import { elNegocio } from './negocio';

/**
 * Lo que recepción necesita alrededor del chat: a quién le toca y qué se
 * dicen entre ellos.
 *
 * ── POR QUÉ LAS NOTAS VIVEN EN SU PROPIA TABLA ──────────────────────────
 * Porque una nota interna que se filtre al huésped no se puede deshacer. Si
 * viviera en `humaya_concierge_mensajes` con un remitente distinto, bastaría
 * con que UNA consulta se olvidara de filtrarla. En su propia tabla eso no
 * puede pasar: el endpoint del huésped no la lee.
 *
 * ── POR QUÉ «TOMAR» Y NO «ASIGNARLE A OTRO» ─────────────────────────────
 * Porque asignarle trabajo a alguien que no está mirando no hace que lo haga.
 * Quien abre la conversación la toma, y queda claro para el resto. Si hace
 * falta un repartidor de tareas, eso es otra cosa y se diseña aparte.
 */

export interface NotaInterna {
  id: string;
  texto: string;
  autor: string | null;
  creadoEn: string;
}

interface NotaRow {
  id: string;
  texto: string;
  autor: string | null;
  creado_en: string;
}

export async function getNotas(stayId: string): Promise<NotaInterna[]> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_notas')
    .select('id,texto,autor,creado_en')
    .eq('negocio_id', elNegocio())
    .eq('stay_id', stayId)
    .order('creado_en', { ascending: false });

  if (error) throw new Error(`notas_${error.code ?? 'error'}`);
  return ((data ?? []) as NotaRow[]).map((fila) => ({
    id: fila.id,
    texto: fila.texto,
    autor: fila.autor,
    creadoEn: fila.creado_en,
  }));
}

export async function crearNota(
  stayId: string,
  texto: string,
  autor: { id: string; nombre: string | null },
): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_notas')
    .insert({
      negocio_id: elNegocio(),
      stay_id: stayId,
      texto,
      autor_id: autor.id,
      autor: autor.nombre,
    })
    .select('id');

  if (error) throw new Error(`notas_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('notas_sin_permiso');
}

export async function borrarNota(id: string): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_notas')
    .delete()
    .eq('negocio_id', elNegocio())
    .eq('id', id)
    .select('id');

  if (error) throw new Error(`notas_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('notas_sin_permiso');
}

export interface Asignacion {
  /** Null = no la tomó nadie todavía. */
  asignadoId: string | null;
  asignado: string | null;
  actualizadoEn: string | null;
}

export async function getAsignacion(stayId: string): Promise<Asignacion> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_estado')
    .select('asignado_id,asignado,actualizado_en')
    .eq('negocio_id', elNegocio())
    .eq('stay_id', stayId)
    .maybeSingle();

  if (error) throw new Error(`asignacion_${error.code ?? 'error'}`);
  const fila = data as {
    asignado_id: string | null;
    asignado: string | null;
    actualizado_en: string;
  } | null;

  return {
    asignadoId: fila?.asignado_id ?? null,
    asignado: fila?.asignado ?? null,
    actualizadoEn: fila?.actualizado_en ?? null,
  };
}

/** `quien = null` la suelta. */
export async function asignar(
  stayId: string,
  quien: { id: string; nombre: string | null } | null,
): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_estado')
    .upsert(
      {
        negocio_id: elNegocio(),
        stay_id: stayId,
        asignado_id: quien?.id ?? null,
        asignado: quien?.nombre ?? null,
        actualizado_en: new Date().toISOString(),
      },
      // La llave primaria paso a ser (negocio_id, stay_id): dos hoteles con
      // una estadia del mismo codigo se pisaban la asignacion.
      { onConflict: 'negocio_id,stay_id' },
    )
    .select('stay_id');

  if (error) throw new Error(`asignacion_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('asignacion_sin_permiso');
}
