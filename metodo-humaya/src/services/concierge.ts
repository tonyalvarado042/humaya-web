import { CONCIERGE_ANSWERS } from '@/mocks/concierge';
import type { ChatMessage, ConciergeConversation, LocalizedText } from '@/types';
// La bandeja de recepcion y las respuestas del staff mandan la sesion del
// CRM. El hilo del huesped no: entra por codigo de confirmacion, no tiene
// cuenta, y su propio hilo es suyo.
import { cabeceraDeRecepcion } from './sesion';

/**
 * Único servicio del MVP con API real: Edge Function `humaya-concierge` en el
 * proyecto Supabase compartido (el mismo de `subscribers`/CRM Tony Alvarado).
 * No pasa por `assertMocks`: el resto de los servicios sigue en mocks hasta
 * que Anthony autorice moverlos, pero el Concierge ya es el real.
 */
const FN_BASE =
  (import.meta.env.VITE_SUPABASE_FN_URL as string | undefined) ??
  'https://mlhhhwbgymobcxiklnoz.supabase.co/functions/v1';
const CONCIERGE_URL = `${FN_BASE}/humaya-concierge`;

async function call<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`concierge_http_${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getMessages(stayId: string): Promise<ChatMessage[]> {
  const data = await call<{ messages: ChatMessage[] }>(
    `${CONCIERGE_URL}?stay_id=${encodeURIComponent(stayId)}`,
  );
  return data.messages;
}

/**
 * El huesped escribe.
 *
 * Manda tambien el idioma en que tiene la app. Es el unico lugar donde ese
 * dato existe de verdad: el servidor no puede deducirlo del texto sin
 * equivocarse con un "ok" o un "gracias", y recepcion necesita saberlo para
 * contestarle en el idioma correcto.
 */
export async function sendMessage(
  stayId: string,
  guestName: string,
  text: string,
  idioma?: string,
): Promise<ChatMessage[]> {
  const data = await call<{ messages: ChatMessage[] }>(CONCIERGE_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'send',
      stay_id: stayId,
      guest_name: guestName,
      text,
      idioma,
    }),
  });
  return data.messages;
}

/** Las sugerencias rápidas son copy de la app, no datos: siguen locales. */
export function getSuggestions(): LocalizedText[] {
  return CONCIERGE_ANSWERS.map((answer) => answer.label);
}

/** Bandeja de /staff/concierge: una fila por huésped demo. */
export async function getConversations(): Promise<ConciergeConversation[]> {
  const data = await call<{ conversations: ConciergeConversation[] }>(`${CONCIERGE_URL}?staff=1`, {
    headers: await cabeceraDeRecepcion(),
  });
  return data.conversations;
}

/**
 * La respuesta de recepcion, en los dos idiomas.
 *
 * El ingles es opcional pero importa: 53 de 62 reservas reales entran por
 * Airbnb, Expedia y Booking, asi que el huesped promedio lee en ingles. Sin
 * `textEn`, el mensaje se guarda solo en espanol y la app se lo muestra en
 * espanol a alguien que no lo lee.
 */
export async function sendStaffReply(
  stayId: string,
  text: string,
  textEn?: string,
): Promise<ChatMessage[]> {
  const data = await call<{ messages: ChatMessage[] }>(CONCIERGE_URL, {
    method: 'POST',
    headers: await cabeceraDeRecepcion(),
    body: JSON.stringify({
      action: 'reply',
      stay_id: stayId,
      text,
      text_en: textEn?.trim() || undefined,
    }),
  });
  return data.messages;
}

export async function markConversationRead(stayId: string): Promise<void> {
  await call<{ ok: true }>(CONCIERGE_URL, {
    method: 'POST',
    headers: await cabeceraDeRecepcion(),
    body: JSON.stringify({ action: 'read', stay_id: stayId }),
  });
}
