/**
 * La agenda de recepción: lo que los huéspedes tienen reservado.
 *
 * ── POR QUÉ NO ES EL MISMO TIPO QUE SpaSlot ─────────────────────────────
 * `SpaSlot` describe una *casilla de horario* —libre u ocupada— de las dos
 * instalaciones fijas. Esto describe una *reserva que existe*, de cualquier
 * servicio del catálogo. Recepción no necesita saber qué está libre: necesita
 * saber a quién hay que atender y a qué hora.
 */

/** Una reserva real, con el servicio ya resuelto. */
export interface ReservaDeServicio {
  id: string;
  servicioId: string;
  /**
   * Null cuando la reserva apunta a un servicio que ya no está en el
   * catálogo. Se muestra igual: la reserva existe y alguien va a llegar.
   */
  servicioNombre: string | null;
  proveedor: string | null;
  duracionMin: number | null;
  stayId: string;
  guestName: string;
  /** YYYY-MM-DD. */
  fecha: string;
  /** HH:MM. */
  horaInicio: string;
}

/** Un servicio del catálogo con sus reservas del rango pedido. */
export interface ServicioConReservas {
  servicioId: string;
  nombre: string;
  proveedor: string | null;
  habilitado: boolean;
  reservas: ReservaDeServicio[];
}
