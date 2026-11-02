import { DURATION, GUESTS, SPA_HOURS, STAYS, state } from '@/mocks';
import type { SpaBooking, SpaFacility, SpaSchedule, SpaScheduleRow, SpaSlot } from '@/types';
import { assertMocks } from './config';
import { delay } from './delay';

const startOf = (date: string, time: string) => `${date.slice(0, 10)}T${time}:00-06:00`;

function bookingOf(slot: SpaSlot | undefined): SpaBooking | null {
  if (!slot?.stayId) return null;

  const stay = STAYS.find((item) => item.id === slot.stayId);
  const guest = GUESTS.find((item) => item.id === stay?.guestId);
  if (!stay || !guest) return null;

  return { stayId: stay.id, guestName: guest.fullName, villa: stay.villa };
}

/** Los 9 horarios del día para una instalación, con su reserva si la tienen. */
export async function getSlots(facility: SpaFacility, date: string): Promise<SpaSlot[]> {
  assertMocks('spa.getSlots');
  await delay();
  return slotsOn(facility, date);
}

export function slotsOn(facility: SpaFacility, date: string): SpaSlot[] {
  return SPA_HOURS.map((time) => {
    const start = startOf(date, time);
    const booked = state.bookings.find(
      (booking) => booking.facility === facility && booking.start === start,
    );

    return {
      facility,
      start,
      durationMin: DURATION[facility],
      stayId: booked?.stayId,
    };
  });
}

/**
 * Reserva un horario. Escribe en el mismo arreglo que lee getDaySchedule, que es
 * lo que hace que la reserva del huésped aparezca en la agenda de recepción.
 */
export async function bookSlot(
  facility: SpaFacility,
  start: string,
  stayId: string,
): Promise<SpaSlot> {
  assertMocks('spa.bookSlot');
  await delay();

  const taken = state.bookings.find(
    (booking) => booking.facility === facility && booking.start === start,
  );
  if (taken) {
    throw new Error('Ese horario ya está reservado');
  }

  const slot: SpaSlot = { facility, start, durationMin: DURATION[facility], stayId };
  state.bookings.push(slot);
  return slot;
}

export async function cancelSlot(facility: SpaFacility, start: string): Promise<void> {
  assertMocks('spa.cancelSlot');
  await delay();

  const index = state.bookings.findIndex(
    (booking) => booking.facility === facility && booking.start === start,
  );
  if (index >= 0) {
    state.bookings.splice(index, 1);
  }
}

/** La reserva vigente de una estadía, si tiene. */
export async function getStayBookings(stayId: string): Promise<SpaSlot[]> {
  assertMocks('spa.getStayBookings');
  await delay();
  return state.bookings
    .filter((booking) => booking.stayId === stayId)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export async function getDaySchedule(date: string): Promise<SpaSchedule> {
  assertMocks('spa.getDaySchedule');
  await delay();

  const sauna = slotsOn('sauna', date);
  const cold = slotsOn('cold_plunge', date);

  const rows: SpaScheduleRow[] = SPA_HOURS.map((time, index) => ({
    time,
    sauna: bookingOf(sauna[index]),
    coldPlunge: bookingOf(cold[index]),
  }));

  return { date: date.slice(0, 10), rows };
}
