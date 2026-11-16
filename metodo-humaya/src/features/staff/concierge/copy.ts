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
  emptyPorQue:
    'Todo lo que se escriba acá queda guardado y se ve completo, de los dos lados. Esta conversación está vacía porque nadie escribió todavía.',
  guardadas: 'Respuestas guardadas',
  guardadasAyuda:
    'Tocá una y queda en el cuadro para que la leas y la ajustes antes de mandarla. Se editan en Admin.',
  replyLabel: 'Tu respuesta',
  replyPlaceholder: 'Escribí la respuesta para el huésped…',
  send: 'Enviar',
  sending: 'Enviando…',
  error: 'No se pudo enviar. Probá de nuevo.',
  escalatedNotice: 'El bot no supo responder y quedó esperando a alguien del equipo.',
};
