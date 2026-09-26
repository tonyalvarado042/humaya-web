import { ALERTS, GUESTS, PROFILES, STAYS, state } from '@/mocks';
import { getToday } from './clock';
import type { Guest, GuestAlert, GuestProfile, TimelineEvent } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';
import { progressOf } from './interview';

const day = (iso: string) => iso.slice(0, 10);

export async function getAlerts(stayId: string): Promise<GuestAlert[]> {
  assertMocks('guests.getAlerts');
  await delay();
  return ALERTS[stayId] ?? [];
}

export async function getGuest(guestId: string): Promise<Guest> {
  assertMocks('guests.getGuest');
  await delay();

  const guest = GUESTS.find((item) => item.id === guestId);
  if (!guest) {
    throw new Error(`No existe el huésped ${guestId}`);
  }
  return guest;
}

export async function getGuestProfile(stayId: string): Promise<GuestProfile> {
  assertMocks('guests.getGuestProfile');
  await delay();

  const stay = STAYS.find((item) => item.id === stayId);
  if (!stay) {
    throw new Error(`No existe la estadía ${stayId}`);
  }

  const guest = GUESTS.find((item) => item.id === stay.guestId);
  if (!guest) {
    throw new Error(`La estadía ${stayId} apunta a un huésped que no existe`);
  }

  const copy = PROFILES[stayId];
  const answers = state.answers[stayId] ?? [];

  return {
    stayId,
    guest,
    stay,
    alerts: ALERTS[stayId] ?? [],
    preferredCare: copy?.preferredCare ?? 'Todavía no completaron la entrevista.',
    pillars: copy?.pillars ?? [],
    timeline: timelineFor(stayId),
    answers,
    teamNotes: state.teamNotes[stayId] ?? '',
  };
}

/** Deja registrado que el huésped aceptó la política de privacidad (Ley 8968). */
export async function acceptPrivacy(stayId: string): Promise<string> {
  assertMocks('guests.acceptPrivacy');
  await delay();

  const acceptedAt = new Date().toISOString();
  state.privacyAcceptedAt[stayId] = acceptedAt;
  return acceptedAt;
}

/** Si este huésped ya aceptó la política, y cuándo. */
export async function getPrivacyConsent(stayId: string): Promise<string | undefined> {
  assertMocks('guests.getPrivacyConsent');
  await delay();

  const stay = STAYS.find((item) => item.id === stayId);
  const guest = GUESTS.find((item) => item.id === stay?.guestId);

  return state.privacyAcceptedAt[stayId] ?? guest?.consent.privacyAcceptedAt;
}

export async function saveTeamNotes(stayId: string, notes: string): Promise<void> {
  assertMocks('guests.saveTeamNotes');
  await delay();
  state.teamNotes[stayId] = notes;
}

/** Los cuatro hitos del Método Humaya, derivados de la estadía y la entrevista. */
export function timelineFor(stayId: string): TimelineEvent[] {
  const stay = STAYS.find((item) => item.id === stayId);
  if (!stay) return [];

  const progress = progressOf(stayId);
  const answers = state.answers[stayId] ?? [];
  const lastAnswer = answers
    .map((answer) => answer.answeredAt)
    .sort()
    .at(-1);

  const followUp = new Date(`${day(stay.checkOut)}T00:00:00Z`);
  followUp.setUTCDate(followUp.getUTCDate() + 1);

  return [
    {
      id: 'interview',
      label: progress.complete
        ? 'Entrevista completa'
        : `Entrevista ${progress.answered} de ${progress.total}`,
      when: lastAnswer ? day(lastAnswer) : 'Sin empezar',
      done: progress.complete,
    },
    {
      id: 'prep',
      label: 'Protocolo pre-llegada',
      when: stay.prepDay ? `día ${stay.prepDay} de 7` : '—',
      done: (stay.prepDay ?? 0) >= 7,
    },
    {
      id: 'arrival',
      label: 'Llegada',
      when: day(stay.checkIn),
      done: day(stay.checkIn) <= getToday(),
    },
    {
      id: 'follow-up',
      label: 'Seguimiento',
      when: followUp.toISOString().slice(0, 10),
      done: false,
    },
  ];
}
