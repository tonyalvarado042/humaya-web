import type { Guest } from '@/types';

/**
 * Personas inventadas, como pide CLAUDE.md. Las nueve primeras son las del
 * prototipo; las cuatro últimas ocupan las villas que el tablero de recepción
 * marca como ocupadas esta noche.
 */
export const GUESTS: Guest[] = [
  {
    id: 'g-mendez-rojas',
    fullName: 'Valeria Méndez y Andrés Rojas',
    companions: [{ name: 'Andrés Rojas', relation: 'pareja' }],
    locale: 'es',
    source: 'waitlist',
    consent: { privacyAcceptedAt: '2026-11-09T14:12:00-06:00', whatsappOptIn: true },
  },
  {
    id: 'g-keller',
    fullName: 'Familia Keller',
    companions: [
      { name: 'Jonas Keller', relation: 'pareja' },
      { name: 'Mia Keller', relation: 'hija', age: 9 },
      { name: 'Finn Keller', relation: 'hijo', age: 6 },
    ],
    locale: 'de',
    source: 'direct',
    consent: { privacyAcceptedAt: '2026-11-02T09:40:00-06:00', whatsappOptIn: false },
  },
  {
    id: 'g-durand',
    fullName: 'Camille Durand',
    companions: [],
    locale: 'fr',
    source: 'ota',
    consent: { privacyAcceptedAt: '2026-11-11T18:05:00-06:00', whatsappOptIn: true },
  },
  {
    id: 'g-whitfield',
    fullName: 'Tom y Rachel Whitfield',
    companions: [{ name: 'Rachel Whitfield', relation: 'pareja' }],
    locale: 'en',
    source: 'ota',
    consent: { whatsappOptIn: false },
  },
  {
    id: 'g-arias',
    fullName: 'Sofía Arias',
    companions: [{ name: 'Marcela Arias', relation: 'hermana' }],
    locale: 'es',
    source: 'waitlist',
    consent: { privacyAcceptedAt: '2026-10-28T11:20:00-06:00', whatsappOptIn: true },
  },
  {
    id: 'g-bianchi',
    fullName: 'Luca Bianchi',
    companions: [],
    locale: 'en',
    source: 'direct',
    consent: { privacyAcceptedAt: '2026-11-01T16:00:00-06:00', whatsappOptIn: true },
  },
  {
    id: 'g-morales',
    fullName: 'Grupo Morales',
    companions: [
      { name: 'Rodrigo Morales', relation: 'hermano' },
      { name: 'Ana Morales', relation: 'cuñada' },
    ],
    locale: 'es',
    source: 'direct',
    consent: { whatsappOptIn: false },
  },
  {
    id: 'g-weber',
    fullName: 'Hannah Weber',
    companions: [],
    locale: 'en',
    source: 'waitlist',
    // Todavía no aceptó la política: la entrevista se la va a pedir antes de
    // la primera pregunta sensible.
    consent: { whatsappOptIn: true },
  },
  {
    id: 'g-solis',
    fullName: 'Diego y Marta Solís',
    companions: [{ name: 'Marta Solís', relation: 'pareja' }],
    locale: 'es',
    source: 'direct',
    consent: { whatsappOptIn: false },
  },
  {
    id: 'g-beltran',
    fullName: 'Óscar y Lucía Beltrán',
    companions: [{ name: 'Lucía Beltrán', relation: 'pareja' }],
    locale: 'es',
    source: 'direct',
    consent: { privacyAcceptedAt: '2026-11-05T10:00:00-06:00', whatsappOptIn: false },
  },
  {
    id: 'g-zamora',
    fullName: 'Paula Zamora',
    companions: [{ name: 'Inés Zamora', relation: 'madre' }],
    locale: 'es',
    source: 'waitlist',
    consent: { privacyAcceptedAt: '2026-11-04T19:15:00-06:00', whatsappOptIn: true },
  },
  {
    id: 'g-farah',
    fullName: 'Nadia y Omar Farah',
    companions: [{ name: 'Omar Farah', relation: 'pareja' }],
    locale: 'en',
    source: 'ota',
    consent: { whatsappOptIn: false },
  },
  {
    id: 'g-lima',
    fullName: 'Bernardo Lima',
    companions: [],
    locale: 'en',
    source: 'direct',
    consent: { privacyAcceptedAt: '2026-11-07T12:45:00-06:00', whatsappOptIn: true },
  },
  {
    id: 'g-lindqvist',
    fullName: 'Ingrid y Petra Lindqvist',
    companions: [{ name: 'Petra Lindqvist', relation: 'hermana' }],
    locale: 'en',
    source: 'ota',
    consent: { whatsappOptIn: false },
  },
];
