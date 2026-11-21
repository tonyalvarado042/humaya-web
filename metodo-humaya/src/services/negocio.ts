import { negocioActual } from '@/marca';

/**
 * El hotel del que son los datos que se van a leer o escribir.
 *
 * ── POR QUE FALLA EN VEZ DE DEVOLVER NULL ───────────────────────────────
 * Comprobado el 20 de noviembre de 2026, con un segundo hotel en la base:
 * una consulta sin filtro devolvia las filas de LOS DOS. Con un solo hotel
 * eso nunca se notaba — devolvia lo correcto por casualidad.
 *
 * Si esta funcion devolviera null y el que llama hiciera
 * `.eq('negocio_id', null)`, la consulta traeria cero filas y la pantalla
 * diria "no hay nada" en vez de "no se de que hotel soy". Dos problemas muy
 * distintos que se verian igual.
 *
 * Falla fuerte: la pantalla muestra su estado de error, que es lo correcto
 * cuando no se sabe de quien son los datos.
 */
export function elNegocio(): string {
  const negocio = negocioActual();
  if (!negocio) throw new Error('sin_hotel_resuelto');
  return negocio;
}
