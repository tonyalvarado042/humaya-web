import type { LocalizedText } from './common';

export type ChatSender = 'guest' | 'concierge' | 'staff';

export interface ChatMessage {
  id: string;
  stayId: string;
  guestName: string;
  from: ChatSender;
  text: string;
  /** Solo en respuestas del concierge: el huésped y el staff nunca se traducen. */
  translations?: LocalizedText;
  /** true cuando el concierge no reconoció la pregunta y la pasó al equipo. */
  escalated: boolean;
  /** Momento en que el staff abrió la conversación. Null = sin leer. */
  readAt: string | null;
  at: string;
  /**
   * El idioma en que el huesped tenia la app cuando escribio. Solo viene
   * en los mensajes del huesped, y NO se deduce del texto: con un "ok" o
   * un "gracias" deducirlo falla, y son los mensajes mas comunes.
   */
  lang?: string | null;
}

/** Resumen de un hilo, para la bandeja de /staff/concierge. */
export interface ConciergeConversation {
  stayId: string;
  guestName: string;
  /** Lo último que preguntó el huésped, no lo último que se dijo en el hilo
   * (si no, casi siempre se vería la respuesta del bot). */
  lastGuestMessage: ChatMessage | null;
  unreadCount: number;
  /** El idioma del ultimo mensaje del huesped, si lo mando la app. */
  lang?: string | null;
  /** Desde cuando hay un mensaje suyo sin leer. Null = no espera nada. */
  waitingSince?: string | null;
  /** Queda esperando al equipo: el bot cayó en el fallback y nadie contestó todavía. */
  escalated: boolean;
}
