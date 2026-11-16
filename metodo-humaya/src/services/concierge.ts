import { CONCIERGE_ANSWERS } from '@/mocks/concierge';
import type { ChatMessage, ConciergeConversation, LocalizedText } from '@/types';

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

export async function sendMessage(
  stayId: string,
  guestName: string,
  text: string,
): Promise<ChatMessage[]> {
  const data = await call<{ messages: ChatMessage[] }>(CONCIERGE_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'send', stay_id: stayId, guest_name: guestName, text }),
  });
  return data.messages;
}

/** Las sugerencias rápidas son copy de la app, no datos: siguen locales. */
export function getSuggestions(): LocalizedText[] {
  return CONCIERGE_ANSWERS.map((answer) => answer.label);
}

/** Bandeja de /staff/concierge: una fila por huésped demo. */
export async function getConversations(): Promise<ConciergeConversation[]> {
  const data = await call<{ conversations: ConciergeConversation[] }>(`${CONCIERGE_URL}?staff=1`);
  return data.conversations;
}

export async function sendStaffReply(stayId: string, text: string): Promise<ChatMessage[]> {
  const data = await call<{ messages: ChatMessage[] }>(CONCIERGE_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'reply', stay_id: stayId, text }),
  });
  return data.messages;
}

export async function markConversationRead(stayId: string): Promise<void> {
  await call<{ ok: true }>(CONCIERGE_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'read', stay_id: stayId }),
  });
}
