import type { Idioma } from '@/hooks/useIdiomaElegido';

/**
 * El texto de la bandeja del Concierge y del hilo, en los dos idiomas.
 *
 * ── OJO CON `replyLabel` Y `replyLabelEn` ───────────────────────────────
 * Esos dos NO son el idioma de la pantalla: son los dos cuadros de la
 * respuesta, que siempre son español e inglés porque el huésped puede leer
 * en cualquiera de los dos. Traducir la etiqueta no cambia qué cuadro es
 * cuál — por eso en inglés dicen «(Spanish)» y «in English», no al revés.
 */
export interface InboxTextos {
  area: string;
  title: string;
  loading: string;
  emptyLast: string;
  unread: (count: number) => string;
  escalated: string;
}

export const conciergeInboxCopy: Record<Idioma, InboxTextos> = {
  es: {
    area: 'Recepción',
    title: 'Concierge',
    loading: 'las conversaciones del Concierge',
    emptyLast: 'Todavía no escribió.',
    unread: (count) => (count === 1 ? '1 sin leer' : `${count} sin leer`),
    escalated: 'Esperando al equipo',
  },
  en: {
    area: 'Front desk',
    title: 'Concierge',
    loading: 'the Concierge conversations',
    emptyLast: 'Has not written yet.',
    unread: (count) => (count === 1 ? '1 unread' : `${count} unread`),
    escalated: 'Waiting for the team',
  },
};

export interface ThreadTextos {
  back: string;
  loading: string;
  notFoundTitle: string;
  notFoundBody: string;
  thread: (guestName: string) => string;
  empty: string;
  emptyPorQue: string;
  guardadas: string;
  guardadasAyuda: string;
  replyLabel: string;
  replyLabelEn: string;
  replyPlaceholderEn: string;
  vistaPrevia: string;
  siLeeEspanol: string;
  siLeeIngles: string;
  sinIngles: string;
  replyPlaceholder: string;
  send: string;
  sending: string;
  error: string;
  escalatedNotice: string;
}

export const conciergeThreadCopy: Record<Idioma, ThreadTextos> = {
  es: {
    back: 'Volver al Concierge',
    loading: 'la conversación',
    notFoundTitle: 'No encontramos esa conversación',
    notFoundBody: 'Revisá el enlace o volvé a la bandeja del Concierge.',
    thread: (guestName) => `Conversación con ${guestName}`,
    empty: 'Todavía no hay mensajes en esta conversación.',
    emptyPorQue:
      'Todo lo que se escriba acá queda guardado y se ve completo, de los dos lados. Esta conversación está vacía porque nadie escribió todavía.',
    guardadas: 'Respuestas guardadas',
    guardadasAyuda:
      'Tocá una y queda en el cuadro para que la leas y la ajustes antes de mandarla. Se editan en Admin.',
    replyLabel: 'Tu respuesta (español)',
    replyLabelEn: 'La misma, en inglés',
    replyPlaceholderEn: 'Write the same reply in English…',
    vistaPrevia: 'Así le va a llegar',
    siLeeEspanol: 'Si el huésped lee en español:',
    siLeeIngles: 'Si lee en inglés:',
    sinIngles:
      'No escribiste la versión en inglés, así que un huésped que lee en inglés va a recibir el texto en español. La mayoría de las reservas entran por Airbnb, Expedia y Booking.',

    replyPlaceholder: 'Escribí la respuesta para el huésped…',
    send: 'Enviar',
    sending: 'Enviando…',
    error: 'No se pudo enviar. Probá de nuevo.',
    escalatedNotice: 'El bot no supo responder y quedó esperando a alguien del equipo.',
  },
  en: {
    back: 'Back to Concierge',
    loading: 'the conversation',
    notFoundTitle: 'We could not find that conversation',
    notFoundBody: 'Check the link or go back to the Concierge inbox.',
    thread: (guestName) => `Conversation with ${guestName}`,
    empty: 'There are no messages in this conversation yet.',
    emptyPorQue:
      'Everything written here is saved and shows in full, on both sides. This conversation is empty because nobody has written yet.',
    guardadas: 'Saved replies',
    guardadasAyuda:
      'Tap one and it lands in the box so you can read it and adjust it before sending. You edit them in Admin.',
    replyLabel: 'Your reply (Spanish)',
    replyLabelEn: 'The same, in English',
    replyPlaceholderEn: 'Write the same reply in English…',
    vistaPrevia: 'This is how it will reach them',
    siLeeEspanol: 'If the guest reads in Spanish:',
    siLeeIngles: 'If they read in English:',
    sinIngles:
      'You did not write the English version, so a guest who reads in English will receive the Spanish text. Most bookings come in through Airbnb, Expedia and Booking.',

    replyPlaceholder: 'Write the reply for the guest…',
    send: 'Send',
    sending: 'Sending…',
    error: 'It could not be sent. Try again.',
    escalatedNotice: 'The bot did not know how to answer and left this waiting for the team.',
  },
};
