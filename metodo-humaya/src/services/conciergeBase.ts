import { cabeceraDeRecepcion, cliente } from './sesion';

/**
 * Lo que el Concierge sabe, y lo que cuesta.
 *
 * ── POR QUÉ EXISTE ESTA TABLA ───────────────────────────────────────────
 * Comprobado el 16 de noviembre de 2026 contra el modelo real: se le preguntó
 * «¿a qué hora es el desayuno? si no lo sabés, decilo», sin darle un solo dato
 * del hotel, y contestó «de 7:00 a 10:00 hrs». Se lo inventó, con la
 * instrucción de no hacerlo delante.
 *
 * Por eso el bot no contesta de lo que sabe: contesta de lo que está en
 * `humaya_concierge_base`. Lo que no esté ahí se pasa al equipo.
 *
 * ── POR QUÉ LOS TEMAS VAN DIRECTO A LA TABLA ────────────────────────────
 * Escribirlos es de administrador y lo hace cumplir RLS
 * (`humaya_concierge_base_admin`), igual que los servicios y el interruptor
 * del demo. Una comprobación en la base no se puede olvidar en el camino.
 *
 * El estado del bot (si está encendido, qué modelo, si hay llave, cuánto va
 * gastando) sí pasa por la función: necesita la llave de servicio para leer
 * el consumo y para probar la llave sin que nadie la vea.
 */

const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';
const CONCIERGE_URL = `${FN_BASE}/humaya-concierge`;

export interface TemaBase {
  id: string;
  tema: string;
  contenido: string;
  activo: boolean;
  orden: number;
}

interface TemaRow {
  id: string;
  tema: string;
  contenido: string;
  activo: boolean;
  orden: number;
}

export async function getTemas(): Promise<TemaBase[]> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_base')
    .select('id,tema,contenido,activo,orden')
    .order('orden', { ascending: true });

  if (error) throw new Error(`base_${error.code ?? 'error'}`);
  return ((data ?? []) as TemaRow[]).map((fila) => ({ ...fila }));
}

export interface CambiosTema {
  tema?: string;
  contenido?: string;
  activo?: boolean;
  orden?: number;
}

export async function editarTema(id: string, cambios: CambiosTema): Promise<void> {
  const db = await cliente();
  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  if (cambios.tema !== undefined) fila.tema = cambios.tema;
  if (cambios.contenido !== undefined) fila.contenido = cambios.contenido;
  if (cambios.activo !== undefined) fila.activo = cambios.activo;
  if (cambios.orden !== undefined) fila.orden = cambios.orden;

  // `select()` después del update no es decorativo: sin él, una fila que RLS
  // no deja tocar devuelve éxito con cero filas y la pantalla diría que
  // guardó algo que no guardó.
  const { data, error } = await db
    .from('humaya_concierge_base')
    .update(fila)
    .eq('id', id)
    .select('id');

  if (error) throw new Error(`base_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('base_sin_permiso');
}

export async function crearTema(tema: string, contenido: string): Promise<TemaBase> {
  const db = await cliente();

  // El tema nuevo entra al final: si entrara con orden 0 se colaría delante
  // de las reglas de marca, que son las que mandan cuando hay que recortar.
  const { data: ultimos } = await db
    .from('humaya_concierge_base')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1);
  const orden = ((ultimos?.[0] as { orden?: number } | undefined)?.orden ?? 0) + 10;

  const { data, error } = await db
    .from('humaya_concierge_base')
    // Nace apagado a propósito: un texto que nadie leyó todavía no puede
    // salir por boca del hotel.
    .insert({ tema, contenido, activo: false, orden })
    .select('id,tema,contenido,activo,orden')
    .single();

  if (error) throw new Error(`base_${error.code ?? 'error'}`);
  return data as TemaBase;
}

export async function borrarTema(id: string): Promise<void> {
  const db = await cliente();
  const { data, error } = await db.from('humaya_concierge_base').delete().eq('id', id).select('id');

  if (error) throw new Error(`base_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('base_sin_permiso');
}

/** Lo que la pantalla de Admin muestra sobre el bot. */
export interface EstadoBot {
  encendido: boolean;
  modelo: string;
  /** Si existe la llave de Anthropic. Nunca viaja la llave, solo si está. */
  hayLlave: boolean;
  /** Dónde se encontró: en los secretos de la función o en la bóveda. */
  llaveDesde: string | null;
  /** Resultado de una llamada de prueba real, o el error tal cual vino. */
  prueba: { ok: boolean; detalle: string } | null;
  temasActivos: number;
  gasto: {
    /** Tarifas en dólares por millón de tokens. null = sin poner. */
    precioEntrada: number | null;
    precioSalida: number | null;
    mes: { llamadas: number; tokensEntrada: number; tokensSalida: number; usd: number | null };
    total: { llamadas: number; tokensEntrada: number; tokensSalida: number; usd: number | null };
  };
}

/**
 * El estado del bot, probando la llave de verdad.
 *
 * `probar: true` hace una llamada real al modelo y cuesta unos pocos tokens.
 * Se pide solo cuando alguien toca «Probar», no en cada carga de la pantalla:
 * un diagnóstico que se cobra solo cada vez que mirás no es un diagnóstico,
 * es una fuga.
 */
export async function getEstadoBot(probar = false): Promise<EstadoBot> {
  const response = await fetch(`${CONCIERGE_URL}?que=estado${probar ? '&probar=1' : ''}`, {
    headers: { 'Content-Type': 'application/json', ...(await cabeceraDeRecepcion()) },
  });
  if (!response.ok) throw new Error(`estado_http_${response.status}`);
  return (await response.json()) as EstadoBot;
}

export interface AjustesBot {
  encendido?: boolean;
  modelo?: string;
  precioEntrada?: number | null;
  precioSalida?: number | null;
}

/** Guarda los ajustes del bot. Es de administrador: lo exige RLS. */
export async function guardarAjustesBot(ajustes: AjustesBot): Promise<void> {
  const db = await cliente();

  const { data: propiedades } = await db.from('humaya_propiedades').select('negocio_id');
  const negocios = [
    ...new Set(((propiedades ?? []) as { negocio_id: string }[]).map((p) => p.negocio_id)),
  ];
  if (negocios.length === 0) throw new Error('bot_sin_hotel');

  const claves: Record<string, unknown> = {};
  if (ajustes.encendido !== undefined) claves.bot_encendido = ajustes.encendido;
  if (ajustes.modelo !== undefined) claves.bot_modelo = ajustes.modelo;
  if (ajustes.precioEntrada !== undefined) claves.bot_precio_entrada = ajustes.precioEntrada;
  if (ajustes.precioSalida !== undefined) claves.bot_precio_salida = ajustes.precioSalida;

  const filas = negocios.flatMap((negocioId) =>
    Object.entries(claves).map(([clave, valor]) => ({
      negocio_id: negocioId,
      clave,
      valor,
      actualizado_en: new Date().toISOString(),
    })),
  );

  const { data, error } = await db
    .from('humaya_ajustes')
    .upsert(filas, { onConflict: 'negocio_id,clave' })
    .select('clave');

  if (error) throw new Error(`bot_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('bot_sin_permiso');
}

/**
 * La llave del modelo, puesta desde settings.
 *
 * ── POR QUE ACA Y NO EN EL PANEL DE SUPABASE ────────────────────────────
 * Tony, 16 de noviembre de 2026: «dejalo todo en settings». Mandarlo al panel
 * de Supabase a pegar una llave no es «todo en settings».
 *
 * ── POR QUE SE PUEDE HACER DESDE EL NAVEGADOR ───────────────────────────
 * No se escribe en ninguna tabla: se llama a `cta_guardar_secreto`, que ya
 * existia en el CRM y que guarda en la boveda cifrada. Esa funcion exige rol
 * `administrador` y solo acepta llaves de una lista blanca, asi que el
 * navegador no puede guardar cualquier cosa con cualquier nombre.
 *
 * ── LA LLAVE NO VUELVE NUNCA ────────────────────────────────────────────
 * `cta_estado_secreto` devuelve si esta puesta, cuando, y los ULTIMOS CUATRO
 * caracteres. Nada mas. No hay forma de leerla de vuelta desde la pantalla,
 * que es justo lo que se quiere de una llave.
 */
export interface EstadoLlave {
  puesta: boolean;
  actualizadoEl: string | null;
  terminaEn: string | null;
}

export async function getEstadoLlave(): Promise<EstadoLlave> {
  const db = await cliente();
  const { data, error } = await db.rpc('cta_estado_secreto', {
    p_nombre: 'ANTHROPIC_API_KEY',
  });
  if (error) throw new Error(`llave_${error.code ?? 'error'}`);

  const fila = (Array.isArray(data) ? data[0] : data) as
    { puesta?: boolean; actualizado_el?: string | null; termina_en?: string | null } | undefined;

  return {
    puesta: fila?.puesta === true,
    actualizadoEl: fila?.actualizado_el ?? null,
    terminaEn: fila?.termina_en ?? null,
  };
}

export async function guardarLlave(valor: string): Promise<void> {
  const db = await cliente();
  const { error } = await db.rpc('cta_guardar_secreto', {
    p_nombre: 'ANTHROPIC_API_KEY',
    p_valor: valor,
  });
  // El mensaje del servidor se pasa tal cual: dice si fue por permiso, por
  // nombre no permitido o porque venia vacia. Un «no se pudo» generico manda
  // a buscar el problema donde no esta.
  if (error) throw new Error(error.message || 'llave_error');
}
