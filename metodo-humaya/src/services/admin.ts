import type { AdminOpcion, PorIdioma, Servicio, ServicioSlot } from '@/types';
// Las tres acciones que cambian lo que ve el huesped mandan la sesion de
// recepcion. Las lecturas y reservarServicio no: las usa la app del huesped,
// que entra por codigo de confirmacion y no tiene cuenta.
import { codigoActual } from '@/marca';
import { elNegocio } from './negocio';
import { cabeceraDeRecepcion } from './sesion';

/**
 * Lo que se configura desde /staff/admin: qué opciones se ven en el Home/menú
 * del huésped, y el catálogo de servicios reservables más allá de Sauna/Cold
 * Plunge. Real desde el día uno, como el Concierge y /entrada.
 */
const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';
const ADMIN_URL = `${FN_BASE}/humaya-admin`;

/**
 * De que hotel se esta preguntando.
 *
 * ── POR QUE VIAJA EN CADA LLAMADA ───────────────────────────────────────
 * Comprobado el 20 de noviembre de 2026, con el hotel demo recien creado:
 * `?que=servicios` devolvia los servicios de LOS DOS hoteles. Un huesped de
 * HUMAYA habria visto "Masaje de prueba" en sus reservas, y 12 opciones de
 * menu en vez de 6.
 *
 * Con un solo hotel en la base esto nunca se iba a notar: la consulta sin
 * filtro devolvia lo correcto por casualidad.
 *
 * Va el CODIGO y no el uuid: es lo que ya tiene el navegador, y un codigo
 * equivocado no revela nada. La funcion lo traduce.
 */
function conHotel(url: string): string {
  const codigo = codigoActual();
  if (!codigo) throw new Error('admin_sin_hotel');
  return `${url}${url.includes('?') ? '&' : '?'}hotel=${encodeURIComponent(codigo)}`;
}

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`admin_http_${response.status}`);
  }
  return response.json() as Promise<T>;
}

interface OpcionRow {
  id: string;
  clave: string;
  etiqueta: string;
  descripcion: string | null;
  icono: string | null;
  habilitada: boolean;
  orden: number;
  etiquetas?: unknown;
  descripciones?: unknown;
}

/**
 * Las columnas nuevas son `jsonb`: pueden traer un objeto, `{}`, o —si alguien
 * escribe a mano— cualquier cosa. Y una fila guardada antes del 20 de
 * noviembre de 2026 no las trae. Lo que no sea un objeto con textos se trata
 * como «no hay nada escrito», que es lo que quiere decir.
 */
function porIdioma(valor: unknown): PorIdioma {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return {};
  const salida: PorIdioma = {};
  for (const idioma of ['es', 'en'] as const) {
    const texto = (valor as Record<string, unknown>)[idioma];
    if (typeof texto === 'string' && texto.trim()) salida[idioma] = texto;
  }
  return salida;
}

function toOpcion(row: OpcionRow): AdminOpcion {
  return {
    id: row.id,
    clave: row.clave,
    etiqueta: row.etiqueta,
    descripcion: row.descripcion,
    icono: row.icono,
    habilitada: row.habilitada,
    orden: row.orden,
    etiquetas: porIdioma(row.etiquetas),
    descripciones: porIdioma(row.descripciones),
  };
}

interface ServicioRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  proveedor: string | null;
  precio_usd: number | null;
  unidad_precio: string;
  duracion_min: number;
  hora_inicio: string;
  hora_fin: string;
  habilitado: boolean;
  orden: number;
}

function toServicio(row: ServicioRow): Servicio {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    proveedor: row.proveedor,
    precioUsd: row.precio_usd,
    unidadPrecio: row.unidad_precio,
    duracionMin: row.duracion_min,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    habilitado: row.habilitado,
    orden: row.orden,
  };
}

export async function getOpciones(onlyEnabled = false): Promise<AdminOpcion[]> {
  const query = onlyEnabled ? '&habilitadas=1' : '';
  const data = await call<{ opciones: OpcionRow[] }>(conHotel(`${ADMIN_URL}?que=opciones${query}`));
  return data.opciones.map(toOpcion);
}

export async function toggleOpcion(id: string, habilitada: boolean): Promise<void> {
  await call<{ ok: true }>(ADMIN_URL, {
    method: 'POST',
    headers: await cabeceraDeRecepcion(),
    body: JSON.stringify({ hotel: codigoActual(), action: 'toggle_opcion', id, habilitada }),
  });
}

/**
 * Cambiarle el nombre a una opcion del menu, en los idiomas que haga falta.
 *
 * ── POR QUE NO PASA POR LA FUNCION ──────────────────────────────────────
 * Igual que editar un servicio: va directo a la tabla y quien decide si se
 * puede es RLS. La politica `humaya_admin_opciones_admin` exige rol
 * `administrador`. Hacerlo cumplir en la base es mas seguro que una
 * comprobacion en el camino que se puede olvidar.
 *
 * ── POR QUE EL OBJETO VIAJA COMPLETO ────────────────────────────────────
 * `etiquetas` es UNA columna jsonb. Mandar solo el espanol borraria el
 * ingles. El formulario lo leyo entero al abrir y lo manda entero.
 */
export interface CambiosOpcion {
  etiquetas?: PorIdioma;
  descripciones?: PorIdioma;
}

/** Saca los idiomas en blanco: un `''` guardado es basura que queda. */
function sinVacios(textos: PorIdioma): PorIdioma {
  const limpio: PorIdioma = {};
  for (const idioma of ['es', 'en'] as const) {
    const texto = textos[idioma]?.trim();
    if (texto) limpio[idioma] = texto;
  }
  return limpio;
}

export async function editarOpcion(id: string, cambios: CambiosOpcion): Promise<void> {
  const { cliente } = await import('./sesion');
  const db = await cliente();

  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  if (cambios.etiquetas !== undefined) fila.etiquetas = sinVacios(cambios.etiquetas);
  if (cambios.descripciones !== undefined) fila.descripciones = sinVacios(cambios.descripciones);

  // `select()` para contar lo que de verdad cambio: sin el, una fila que RLS
  // no deja tocar devuelve exito con cero filas y la pantalla diria que
  // guardo algo que no guardo.
  const { data, error } = await db
    .from('humaya_admin_opciones')
    .update(fila)
    .eq('id', id)
    .eq('negocio_id', elNegocio())
    .select('id');

  if (error) throw new Error(`opcion_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('opcion_sin_permiso');
}

export async function getServicios(onlyEnabled = false): Promise<Servicio[]> {
  const query = onlyEnabled ? '&habilitados=1' : '';
  const data = await call<{ servicios: ServicioRow[] }>(
    conHotel(`${ADMIN_URL}?que=servicios${query}`),
  );
  return data.servicios.map(toServicio);
}

export async function toggleServicio(id: string, habilitado: boolean): Promise<void> {
  await call<{ ok: true }>(ADMIN_URL, {
    method: 'POST',
    headers: await cabeceraDeRecepcion(),
    body: JSON.stringify({ hotel: codigoActual(), action: 'toggle_servicio', id, habilitado }),
  });
}

/**
 * Editar un servicio que ya existe.
 *
 * Esta NO pasa por la funcion, a diferencia de crear y habilitar: va directo
 * a la tabla con la llave publicable, y quien decide si se puede es RLS. La
 * politica `humaya_servicios_admin` exige rol `administrador`, igual que el
 * interruptor del demo. Cambiar el precio o con quien es un servicio es de la
 * misma clase que apagar el demo: lo hace un administrador, y lo hace cumplir
 * la base de datos, no una comprobacion que se puede olvidar en el camino.
 *
 * Solo se mandan los campos que vienen: un `undefined` no pisa lo que hay.
 */
export interface CambiosServicio {
  nombre?: string;
  descripcion?: string | null;
  proveedor?: string | null;
  precioUsd?: number | null;
  unidadPrecio?: string;
  duracionMin?: number;
  horaInicio?: string;
  horaFin?: string;
}

export async function editarServicio(id: string, cambios: CambiosServicio): Promise<void> {
  const { cliente } = await import('./sesion');
  const db = await cliente();

  const fila: Record<string, unknown> = { actualizado_en: new Date().toISOString() };
  if (cambios.nombre !== undefined) fila.nombre = cambios.nombre;
  if (cambios.descripcion !== undefined) fila.descripcion = cambios.descripcion;
  if (cambios.proveedor !== undefined) fila.proveedor = cambios.proveedor;
  if (cambios.precioUsd !== undefined) fila.precio_usd = cambios.precioUsd;
  if (cambios.unidadPrecio !== undefined) fila.unidad_precio = cambios.unidadPrecio;
  if (cambios.duracionMin !== undefined) fila.duracion_min = cambios.duracionMin;
  if (cambios.horaInicio !== undefined) fila.hora_inicio = cambios.horaInicio;
  if (cambios.horaFin !== undefined) fila.hora_fin = cambios.horaFin;

  // `select()` despues del update no es decorativo: sin el, una fila que RLS
  // no deja tocar devuelve exito con cero filas y la pantalla diria que
  // guardo algo que no guardo. Con el, contamos lo que de verdad cambio.
  const { data, error } = await db
    .from('humaya_servicios')
    .update(fila)
    .eq('id', id)
    .eq('negocio_id', elNegocio())
    .select('id');

  if (error) throw new Error(`servicio_${error.code ?? 'error'}`);
  if (!data || data.length === 0) throw new Error('servicio_sin_permiso');
}

export interface NuevoServicio {
  nombre: string;
  descripcion?: string;
  proveedor?: string;
  precioUsd?: number;
  unidadPrecio?: string;
  duracionMin?: number;
  horaInicio?: string;
  horaFin?: string;
}

export async function crearServicio(servicio: NuevoServicio): Promise<Servicio> {
  const data = await call<{ servicio: ServicioRow }>(ADMIN_URL, {
    method: 'POST',
    headers: await cabeceraDeRecepcion(),
    body: JSON.stringify({
      hotel: codigoActual(),
      action: 'crear_servicio',
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      proveedor: servicio.proveedor,
      precio_usd: servicio.precioUsd,
      unidad_precio: servicio.unidadPrecio,
      duracion_min: servicio.duracionMin,
      hora_inicio: servicio.horaInicio,
      hora_fin: servicio.horaFin,
    }),
  });
  return toServicio(data.servicio);
}

export async function getServicioSlots(servicioId: string, fecha: string): Promise<ServicioSlot[]> {
  const data = await call<{ slots: ServicioSlot[] }>(
    conHotel(
      `${ADMIN_URL}?que=servicio-slots&servicio_id=${encodeURIComponent(servicioId)}&fecha=${fecha}`,
    ),
  );
  return data.slots;
}

export async function reservarServicio(params: {
  servicioId: string;
  stayId: string;
  guestName: string;
  fecha: string;
  horaInicio: string;
}): Promise<void> {
  await call<{ ok: true }>(ADMIN_URL, {
    method: 'POST',
    body: JSON.stringify({
      hotel: codigoActual(),
      action: 'reservar_servicio',
      servicio_id: params.servicioId,
      stay_id: params.stayId,
      guest_name: params.guestName,
      fecha: params.fecha,
      hora_inicio: params.horaInicio,
    }),
  });
}
