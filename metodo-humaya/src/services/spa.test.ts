import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { bookSlot, cancelSlot, getDaySchedule, getSlots, getStayBookings } from './spa';

const DAY = '2026-11-15';

beforeEach(() => {
  resetMockState();
});

describe('agenda del día', () => {
  it('abre los 9 horarios del spa', async () => {
    const schedule = await getDaySchedule(DAY);

    expect(schedule.rows).toHaveLength(9);
    expect(schedule.rows[0].time).toBe('06:00');
    expect(schedule.rows.at(-1)?.time).toBe('21:00');
  });

  it('reproduce las 5 reservas de sauna y las 4 de cold plunge del prototipo', async () => {
    const schedule = await getDaySchedule(DAY);

    expect(schedule.rows.filter((row) => row.sauna)).toHaveLength(5);
    expect(schedule.rows.filter((row) => row.coldPlunge)).toHaveLength(4);
  });

  it('muestra a Valeria en el sauna de las 17:00, en la Villa 04', async () => {
    const schedule = await getDaySchedule(DAY);
    const row = schedule.rows.find((item) => item.time === '17:00');

    expect(row?.sauna?.guestName).toBe('Valeria Méndez y Andrés Rojas');
    expect(row?.sauna?.villa).toBe(4);
  });

  it('no agenda a nadie antes de que llegue', async () => {
    const schedule = await getDaySchedule(DAY);

    // Luca Bianchi llega el 15 a las 3:30 p.m.: no puede tener el turno de las 6:00.
    const early = schedule.rows.find((item) => item.time === '06:00');
    expect(early?.sauna?.stayId).not.toBe('s-bianchi');
    expect(early?.coldPlunge?.stayId).not.toBe('s-weber');
  });
});

describe('bookSlot', () => {
  it('marca el horario ocupado en getSlots', async () => {
    const start = `${DAY}T16:00:00-06:00`;

    const before = await getSlots('sauna', DAY);
    expect(before.find((slot) => slot.start === start)?.stayId).toBeUndefined();

    await bookSlot('sauna', start, 's-mendez-rojas');

    const after = await getSlots('sauna', DAY);
    expect(after.find((slot) => slot.start === start)?.stayId).toBe('s-mendez-rojas');
  });

  it('hace que la reserva del huésped aparezca en la agenda de recepción', async () => {
    const start = `${DAY}T21:00:00-06:00`;

    await bookSlot('cold_plunge', start, 's-mendez-rojas');

    const schedule = await getDaySchedule(DAY);
    const row = schedule.rows.find((item) => item.time === '21:00');

    expect(row?.coldPlunge).toEqual({
      stayId: 's-mendez-rojas',
      guestName: 'Valeria Méndez y Andrés Rojas',
      villa: 4,
    });
  });

  it('no deja reservar dos veces el mismo horario', async () => {
    const start = `${DAY}T17:00:00-06:00`;

    await expect(bookSlot('sauna', start, 's-keller')).rejects.toThrow('ya está reservado');
  });

  it('el sauna dura 45 minutos y el cold plunge 20', async () => {
    const sauna = await bookSlot('sauna', `${DAY}T16:00:00-06:00`, 's-durand');
    const cold = await bookSlot('cold_plunge', `${DAY}T16:00:00-06:00`, 's-durand');

    expect(sauna.durationMin).toBe(45);
    expect(cold.durationMin).toBe(20);
  });

  it('las dos instalaciones son independientes a la misma hora', async () => {
    const start = `${DAY}T20:00:00-06:00`;

    await bookSlot('cold_plunge', start, 's-keller');

    const schedule = await getDaySchedule(DAY);
    const row = schedule.rows.find((item) => item.time === '20:00');

    expect(row?.sauna?.stayId).toBe('s-morales');
    expect(row?.coldPlunge?.stayId).toBe('s-keller');
  });
});

describe('getStayBookings y cancelSlot', () => {
  it('lista las reservas de una estadía en orden', async () => {
    const bookings = await getStayBookings('s-mendez-rojas');

    expect(bookings).toHaveLength(2);
    expect(bookings[0].start < bookings[1].start).toBe(true);
  });

  it('cancelar libera el horario', async () => {
    const start = `${DAY}T17:00:00-06:00`;

    await cancelSlot('sauna', start);
    const slots = await getSlots('sauna', DAY);

    expect(slots.find((slot) => slot.start === start)?.stayId).toBeUndefined();
  });
});

describe('aislamiento entre tests', () => {
  it('arranca sin la reserva que agregó el test anterior', async () => {
    const slots = await getSlots('sauna', DAY);
    const extra = slots.find((slot) => slot.start === `${DAY}T16:00:00-06:00`);

    expect(extra?.stayId).toBeUndefined();
  });
});
