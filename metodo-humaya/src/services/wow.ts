import { GUESTS, state, STAYS } from '@/mocks';
import { getToday } from './clock';
import type { WowExperience, WowStatus, WowTask } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

const ORDER: WowStatus[] = ['suggested', 'planned', 'done'];

export async function getWowSuggestions(stayId: string): Promise<WowExperience[]> {
  assertMocks('wow.getWowSuggestions');
  await delay();
  return state.wows.filter((wow) => wow.stayId === stayId);
}

/**
 * Las experiencias que hay que preparar hoy, ordenadas por hora límite y ya
 * resueltas con su villa y su huésped.
 */
export async function getWowsDueBy(date: string = getToday()): Promise<WowTask[]> {
  assertMocks('wow.getWowsDueBy');
  await delay();

  return state.wows
    .filter((wow) => wow.dueBy?.slice(0, 10) === date.slice(0, 10) && wow.status !== 'done')
    .sort((a, b) => (a.dueBy ?? '').localeCompare(b.dueBy ?? ''))
    .map((wow) => {
      const stay = STAYS.find((item) => item.id === wow.stayId);
      const guest = GUESTS.find((item) => item.id === stay?.guestId);

      return {
        ...wow,
        villa: stay?.villa ?? 0,
        guestName: guest?.fullName ?? '',
      };
    });
}

/**
 * Cuántas experiencias quedan por preparar para las llegadas de una fecha.
 * Es el indicador del dashboard, que habla del día, no del hotel entero.
 */
export async function getPendingWowCount(date: string = getToday()): Promise<number> {
  assertMocks('wow.getPendingWowCount');
  await delay();

  const arriving = new Set(
    STAYS.filter((stay) => stay.checkIn.slice(0, 10) === date.slice(0, 10)).map((stay) => stay.id),
  );

  return state.wows.filter((wow) => wow.status !== 'done' && arriving.has(wow.stayId)).length;
}

export async function updateWowStatus(id: string, status: WowStatus): Promise<WowExperience> {
  assertMocks('wow.updateWowStatus');
  await delay();

  const wow = state.wows.find((item) => item.id === id);
  if (!wow) {
    throw new Error(`No existe la experiencia ${id}`);
  }

  if (ORDER.indexOf(status) < ORDER.indexOf(wow.status)) {
    throw new Error(`Una experiencia no vuelve de ${wow.status} a ${status}`);
  }

  wow.status = status;
  return wow;
}
