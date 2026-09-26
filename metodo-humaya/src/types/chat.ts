import type { LocalizedText } from './common';

export interface ChatMessage {
  id: string;
  from: 'guest' | 'concierge';
  text: string;
  /** Los mensajes mock del concierge guardan ambos idiomas. */
  translations?: LocalizedText;
  at: string;
}
