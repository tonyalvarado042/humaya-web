/** Textos de /entrada. Español solo, como la portada del origen (DemoHomePage): no hay
 * estadía todavía acá, así que no hay de dónde sacar la preferencia de idioma del huésped. */
export const entradaCopy = {
  eyebrow: 'Método Humaya',
  title: 'Encontrá tu estadía',
  description: 'Escribí el correo con el que hiciste tu reserva y te confirmamos si ya la tenemos.',
  emailLabel: 'Correo',
  emailPlaceholder: 'tu@correo.com',
  submit: 'Continuar',
  submitting: 'Buscando…',
  invalidEmail: 'Escribí un correo válido.',
  foundTitle: (guestName: string) =>
    guestName ? `¡Te encontramos, ${guestName}!` : '¡Te encontramos!',
  foundBody: 'Ya tenemos tu reserva. Te vamos a escribir pronto para coordinar tu estadía.',
  notFoundTitle: 'No encontramos tu reserva',
  notFoundBody:
    'Revisá que sea el mismo correo con el que reservaste. Si creés que es un error, escribinos y te ayudamos.',
  contactEmail: 'reservations@stayhumaya.com',
  contactWhatsapp: 'WhatsApp',
  whatsappHref:
    'https://wa.me/50664417187?text=Hola%2C%20no%20encontr%C3%A9%20mi%20reserva%20en%20la%20app.',
  tryAgain: 'Probar con otro correo',
  error: 'Algo falló de nuestro lado. Probá de nuevo en un momento.',
};
