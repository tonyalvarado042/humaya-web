import type { ChatMessage } from '@/types';

/**
 * Quién espera del otro lado desde cuándo.
 *
 * No se mide por «sin leer»: abrir el hilo lo marca leído, así que esa cuenta
 * daría cero justo cuando alguien lo está mirando. Se mide por quién habló de
 * último. Si la última palabra es del huésped, nadie le contestó todavía — lo
 * haya leído alguien o no.
 */
export function esperaDesde(messages: ChatMessage[]): string | null {
  const ultimoHuesped = [...messages].reverse().find((m) => m.from === 'guest');
  if (!ultimoHuesped) return null;

  const ultimoNuestro = [...messages]
    .reverse()
    .find((m) => m.from === 'staff' || (m.from === 'concierge' && !m.escalated));

  if (ultimoNuestro && new Date(ultimoNuestro.at) > new Date(ultimoHuesped.at)) return null;
  return ultimoHuesped.at;
}
