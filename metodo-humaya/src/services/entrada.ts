/**
 * /entrada — el huésped llega acá desde el enlace corto del hotel: por correo,
 * por el chat de Airbnb, por un QR en la villa o porque recepción se lo dictó.
 * Real desde el día uno, como el Concierge: llama a la Edge Function
 * humaya-entrada en vez de mocks.
 *
 * ── POR QUÉ NO ALCANZA CON EL CORREO ────────────────────────────────────
 * Medido el 15 de noviembre de 2026 sobre las 62 reservas reales de Humaya:
 * solo 21 traen un correo que el huésped reconocería. 27 traen un alias que
 * inventó la OTA y 14 no traen ninguno. Las 62 traen código de confirmación.
 * Pedir solo el correo dejaba afuera a dos de cada tres huéspedes.
 */
export interface EntradaResult {
  found: boolean;
  guestName?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  fuente?: string | null;
  reserva?: string | null;
  /** El servidor avisa cuando no tiene un correo usable de esta persona.
   *  El formulario de check-in lo aprovecha para pedírselo: es el único
   *  momento del viaje en que el huésped está dispuesto a darlo. */
  pedir_correo?: boolean;
}

export interface EntradaBusqueda {
  /** Código de la OTA, número de reserva de Cloudbeds, o correo. */
  codigo: string;
  apellido: string;
}

import { codigoActual } from '@/marca';
import { actualizarLaApp, esPantallaVieja } from './actualizar';

const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';

/**
 * Buscar la reserva del huésped que está entrando.
 *
 * ── POR QUÉ VIAJA EL HOTEL ──────────────────────────────────────────────
 * Porque sin él la búsqueda recorre las reservas de TODOS los hoteles. Un
 * código de HUMAYA entraba desde el `/entrada` de otro hotel y devolvía el
 * nombre y las fechas de ese huésped: apellido + código son de una reserva
 * concreta, pero no dicen de qué hotel es.
 *
 * El código del hotel ya lo tiene el navegador —salió del dominio antes de
 * pintar— y un código equivocado no revela nada: la función lo traduce.
 */
export async function checkReservation(busqueda: EntradaBusqueda): Promise<EntradaResult> {
  const hotel = codigoActual();
  if (!hotel) throw new Error('entrada_sin_hotel');

  const response = await fetch(`${FN_BASE}/humaya-entrada`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codigo: busqueda.codigo.trim(),
      apellido: busqueda.apellido.trim(),
      hotel,
    }),
  });
  if (!response.ok) {
    // Igual que en `admin.ts`: un `falta_hotel` quiere decir que esta
    // pantalla es más vieja que el servidor. Ver `actualizar.ts`.
    const cuerpo = await response.text().catch(() => '');
    if (esPantallaVieja(response.status, cuerpo) && actualizarLaApp()) {
      throw new Error('entrada_desactualizada');
    }
    throw new Error(`entrada_http_${response.status}`);
  }
  return response.json() as Promise<EntradaResult>;
}
