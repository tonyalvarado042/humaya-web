import { codigoActual } from '@/marca';
import { cabeceraDeRecepcion, cliente } from './sesion';
import { elNegocio } from './negocio';

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
    .eq('negocio_id', elNegocio())
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
    .eq('negocio_id', elNegocio())
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
    .eq('negocio_id', elNegocio())
    .order('orden', { ascending: false })
    .limit(1);
  const orden = ((ultimos?.[0] as { orden?: number } | undefined)?.orden ?? 0) + 10;

  const { data, error } = await db
    .from('humaya_concierge_base')
    // Nace apagado a propósito: un texto que nadie leyó todavía no puede
    // salir por boca del hotel.
    .insert({ negocio_id: elNegocio(), tema, contenido, activo: false, orden })
    .select('id,tema,contenido,activo,orden')
    .single();

  if (error) throw new Error(`base_${error.code ?? 'error'}`);
  return data as TemaBase;
}

export async function borrarTema(id: string): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_base')
    .delete()
    .eq('negocio_id', elNegocio())
    .eq('id', id)
    .select('id');

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
  // El hotel viaja en la direccion: sin el, la funcion contaba los temas, los
  // servicios y el gasto de TODOS los hoteles juntos.
  const codigo = codigoActual();
  if (!codigo) throw new Error('concierge_sin_hotel');
  const direccion =
    `${CONCIERGE_URL}?que=estado&hotel=${encodeURIComponent(codigo)}` + (probar ? '&probar=1' : '');
  const response = await fetch(direccion, {
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

  const claves: Record<string, unknown> = {};
  if (ajustes.encendido !== undefined) claves.bot_encendido = ajustes.encendido;
  if (ajustes.modelo !== undefined) claves.bot_modelo = ajustes.modelo;
  if (ajustes.precioEntrada !== undefined) claves.bot_precio_entrada = ajustes.precioEntrada;
  if (ajustes.precioSalida !== undefined) claves.bot_precio_salida = ajustes.precioSalida;

  // UN hotel: el de esta pantalla.
  //
  // Antes esto leía TODAS las propiedades y escribía el ajuste en TODOS los
  // hoteles. Comprobado en vivo el 21 de noviembre de 2026: estando en la
  // pantalla del hotel demo, apretar «Encender el bot» le escribió el ajuste
  // a HUMAYA y dejó el del demo como estaba. Desde la pantalla de un hotel
  // se le podía encender y apagar el Concierge a otro.
  const negocio = elNegocio();
  const filas = Object.entries(claves).map(([clave, valor]) => ({
    negocio_id: negocio,
    clave,
    valor,
    actualizado_en: new Date().toISOString(),
  }));

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

/**
 * Respuestas guardadas: los textos que recepcion manda una y otra vez.
 *
 * No es lo mismo que la base del bot. La base es lo que el BOT puede afirmar
 * y entra en un prompt; esto son mensajes enteros que una PERSONA manda tal
 * cual, o toca para tenerlos en el cuadro y editarlos antes de enviar. No
 * pasan por ningun modelo, asi que salen exactamente como se escribieron.
 */
export interface RespuestaGuardada {
  id: string;
  titulo: string;
  texto: string;
  textoEn: string | null;
  activo: boolean;
  orden: number;
}

interface RespuestaRow {
  id: string;
  titulo: string;
  texto: string;
  texto_en: string | null;
  activo: boolean;
  orden: number;
}

function aRespuesta(fila: RespuestaRow): RespuestaGuardada {
  return {
    id: fila.id,
    titulo: fila.titulo,
    texto: fila.texto,
    textoEn: fila.texto_en,
    activo: fila.activo,
    orden: fila.orden,
  };
}

/** `soloActivas` es para el hilo: ahi no sirve ofrecer una respuesta apagada. */
export async function getRespuestas(soloActivas = false): Promise<RespuestaGuardada[]> {
  const db = await cliente();
  let consulta = db
    .from('humaya_concierge_respuestas')
    .select('id,titulo,texto,texto_en,activo,orden')
    .eq('negocio_id', elNegocio())
    .order('orden', { ascending: true });
  if (soloActivas) consulta = consulta.eq('activo', true);

  const { data, error } = await consulta;
  if (error) throw new Error(`respuestas_${error.code ?? 'error'}`);
  return ((data ?? []) as RespuestaRow[]).map(aRespuesta);
}

export interface CambiosRespuesta {
  titulo?: string;
  texto?: string;
  textoEn?: string | null;
  activo?: boolean;
}

export async function editarRespuesta(id: string, cambios: CambiosRespuesta): Promise<void> {
  const db = await cliente();
  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  if (cambios.titulo !== undefined) fila.titulo = cambios.titulo;
  if (cambios.texto !== undefined) fila.texto = cambios.texto;
  if (cambios.textoEn !== undefined) fila.texto_en = cambios.textoEn;
  if (cambios.activo !== undefined) fila.activo = cambios.activo;

  // Sin `select()`, una fila que RLS no deja tocar devuelve exito con cero
  // filas y la pantalla diria que guardo algo que no guardo.
  const { data, error } = await db
    .from('humaya_concierge_respuestas')
    .update(fila)
    .eq('negocio_id', elNegocio())
    .eq('id', id)
    .select('id');

  if (error) throw new Error(`respuestas_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('respuestas_sin_permiso');
}

export async function crearRespuesta(titulo: string, texto: string): Promise<RespuestaGuardada> {
  const db = await cliente();
  const { data: ultimas } = await db
    .from('humaya_concierge_respuestas')
    .select('orden')
    .eq('negocio_id', elNegocio())
    .order('orden', { ascending: false })
    .limit(1);
  const orden = ((ultimas?.[0] as { orden?: number } | undefined)?.orden ?? 0) + 10;

  const { data, error } = await db
    .from('humaya_concierge_respuestas')
    // Esta SI nace encendida: la escribio una persona para mandarla, a
    // diferencia de un tema de la base, que el bot va a afirmar solo.
    .insert({ negocio_id: elNegocio(), titulo, texto, activo: true, orden })
    .select('id,titulo,texto,texto_en,activo,orden')
    .single();

  if (error) throw new Error(`respuestas_${error.code ?? 'error'}`);
  return aRespuesta(data as RespuestaRow);
}

export async function borrarRespuesta(id: string): Promise<void> {
  const db = await cliente();
  const { data, error } = await db
    .from('humaya_concierge_respuestas')
    .delete()
    .eq('negocio_id', elNegocio())
    .eq('id', id)
    .select('id');

  if (error) throw new Error(`respuestas_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('respuestas_sin_permiso');
}
