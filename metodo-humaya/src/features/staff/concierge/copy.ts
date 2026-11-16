export const conciergeInboxCopy = {
  title: 'Concierge',
  loading: 'las conversaciones del Concierge',
  emptyLast: 'Todavía no escribió.',
  unread: (count: number) => (count === 1 ? '1 sin leer' : `${count} sin leer`),
  escalated: 'Esperando al equipo',
};

export const conciergeThreadCopy = {
  back: 'Volver al Concierge',
  loading: 'la conversación',
  notFoundTitle: 'No encontramos esa conversación',
  notFoundBody: 'Revisá el enlace o volvé a la bandeja del Concierge.',
  thread: (guestName: string) => `Conversación con ${guestName}`,
  empty: 'Todavía no hay mensajes en esta conversación.',
  replyLabel: 'Tu respuesta',
  replyPlaceholder: 'Escribí la respuesta para el huésped…',
  send: 'Enviar',
  sending: 'Enviando…',
  error: 'No se pudo enviar. Probá de nuevo.',
  escalatedNotice: 'El bot no supo responder y quedó esperando a alguien del equipo.',
};
