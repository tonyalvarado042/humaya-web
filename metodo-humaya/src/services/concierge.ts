import { CONCIERGE_ANSWERS, FALLBACK_ANSWER, state } from '@/mocks';
import type { ChatMessage, LocalizedText } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

export async function getMessages(): Promise<ChatMessage[]> {
  assertMocks('concierge.getMessages');
  await delay();
  return state.messages;
}

export function getSuggestions(): LocalizedText[] {
  return CONCIERGE_ANSWERS.map((answer) => answer.label);
}

/** Respuesta por palabra clave. Cuando llegue la IA real, se cambia acá. */
export function replyTo(text: string): LocalizedText {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const match = CONCIERGE_ANSWERS.find((answer) =>
    [...answer.keywords.es, ...answer.keywords.en].some((keyword) =>
      normalized.includes(keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')),
    ),
  );

  return match?.text ?? FALLBACK_ANSWER;
}

export async function sendMessage(text: string): Promise<ChatMessage[]> {
  assertMocks('concierge.sendMessage');
  await delay();

  const at = new Date().toISOString();
  state.messages.push({ id: `m-${state.messages.length}-guest`, from: 'guest', text, at });
  const reply = replyTo(text);
  state.messages.push({
    id: `m-${state.messages.length}-concierge`,
    from: 'concierge',
    text: reply.es,
    translations: reply,
    at,
  });

  return state.messages;
}
