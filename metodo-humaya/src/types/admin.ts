/** Una opción del Home/menú del huésped, configurable desde /staff/admin. */
export interface AdminOpcion {
  id: string;
  clave: string;
  etiqueta: string;
  descripcion: string | null;
  icono: string | null;
  habilitada: boolean;
  orden: number;
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
