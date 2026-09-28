import { ALERTS, GUESTS, STAYS, VILLA_NUMBERS, daysFromToday } from '@/mocks';
import { getToday } from './clock';
import type { Arrival, ArrivalRange, Stay, VillaState, VillaStatus } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';
import { progressOf } from './interview';

const day = (iso: string) => iso.slice(0, 10);

function toArrival(stay: Stay): Arrival {
  const guest = GUESTS.find((item) => item.id === stay.guestId);
  if (!guest) {
    throw new Error(`La estadía ${stay.id} apunta a un huésped que no existe`);
  }

  return {
    stayId: stay.id,
    guestName: guest.fullName,
    locale: guest.locale,
    villa: stay.villa,
    checkIn: stay.checkIn,
    partySize: stay.partySize,
    interview: progressOf(stay.id),
    alerts: ALERTS[stay.id] ?? [],
  };
}

export async function getArrivals(range: ArrivalRange): Promise<Arrival[]> {
  assertMocks('stays.getArrivals');
  await delay();

  const from = getToday();
  const to = range === 'today' ? from : range === 'tomorrow' ? daysFromToday(1) : daysFromToday(6);
  const start = range === 'tomorrow' ? daysFromToday(1) : from;

  return STAYS.filter((stay) => day(stay.checkIn) >= start && day(stay.checkIn) <= to)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .map(toArrival);
}

export async function getStay(id: string): Promise<Stay> {
  assertMocks('stays.getStay');
  await delay();

  const stay = STAYS.find((item) => item.id === id);
  if (!stay) {
    throw new Error(`No existe la estadía ${id}`);
  }
  return stay;
}

/**
 * Estado de las 10 villas en una fecha. Se deriva de las estadías, así el
 * tablero nunca se desalinea con la lista de llegadas.
 */
export async function getVillaStatus(date: string = getToday()): Promise<VillaStatus[]> {
  assertMocks('stays.getVillaStatus');
  await delay();
  return villaStatusOn(date);
}

export function villaStatusOn(date: string): VillaStatus[] {
  const target = day(date);

  return VILLA_NUMBERS.map((villa) => {
    const stays = STAYS.filter((stay) => stay.villa === villa);

    const arriving = stays.find((stay) => day(stay.checkIn) === target);
    if (arriving) {
      return { villa, state: 'arriving' as VillaState, label: 'Llega hoy', stayId: arriving.id };
    }

    const departing = stays.find((stay) => day(stay.checkOut) === target);
    if (departing) {
      return { villa, state: 'departing' as VillaState, label: 'Sale hoy', stayId: departing.id };
    }

    const occupied = stays.find(
      (stay) => day(stay.checkIn) < target && day(stay.checkOut) > target,
    );
    if (occupied) {
      return { villa, state: 'occupied' as VillaState, label: 'Ocupada', stayId: occupied.id };
    }

    return { villa, state: 'free' as VillaState, label: 'Libre' };
  });
}

/** Villas con gente esta noche: las que llegan más las que siguen ocupadas. */
export function occupiedCountOn(date: string): number {
  return villaStatusOn(date).filter(
    (villa) => villa.state === 'arriving' || villa.state === 'occupied',
  ).length;
}
