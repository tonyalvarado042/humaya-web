import type { AdminOpcion, Servicio, ServicioSlot } from '@/types';

/**
 * Lo que se configura desde /staff/admin: qué opciones se ven en el Home/menú
 * del huésped, y el catálogo de servicios reservables más allá de Sauna/Cold
 * Plunge. Real desde el día uno, como el Concierge y /entrada.
 */
const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';
const ADMIN_URL = `${FN_BASE}/humaya-admin`;

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
}

function toOpcion(row: OpcionRow): AdminOpcion {
  return row;
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
  const data = await call<{ opciones: OpcionRow[] }>(`${ADMIN_URL}?que=opciones${query}`);
  return data.opciones.map(toOpcion);
}

export async function toggleOpcion(id: string, habilitada: boolean): Promise<void> {
  await call<{ ok: true }>(ADMIN_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'toggle_opcion', id, habilitada }),
  });
}

export async function getServicios(onlyEnabled = false): Promise<Servicio[]> {
  const query = onlyEnabled ? '&habilitados=1' : '';
  const data = await call<{ servicios: ServicioRow[] }>(`${ADMIN_URL}?que=servicios${query}`);
  return data.servicios.map(toServicio);
}

export async function toggleServicio(id: string, habilitado: boolean): Promise<void> {
  await call<{ ok: true }>(ADMIN_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'toggle_servicio', id, habilitado }),
  });
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
    body: JSON.stringify({
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
    `${ADMIN_URL}?que=servicio-slots&servicio_id=${encodeURIComponent(servicioId)}&fecha=${fecha}`,
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
      action: 'reservar_servicio',
      servicio_id: params.servicioId,
      stay_id: params.stayId,
      guest_name: params.guestName,
      fecha: params.fecha,
      hora_inicio: params.horaInicio,
    }),
  });
}
