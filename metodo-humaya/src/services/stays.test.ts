import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { TODAY, daysFromToday } from '@/mocks/today';
import { getGuestProfile } from './guests';
import { getArrivals, getStay, getVillaStatus, occupiedCountOn } from './stays';

beforeEach(() => {
  resetMockState();
});

describe('getArrivals', () => {
  it('trae las 4 llegadas del 14 de noviembre', async () => {
    const arrivals = await getArrivals('today');

    expect(arrivals).toHaveLength(4);
    expect(arrivals.map((arrival) => arrival.villa)).toEqual([4, 7, 2, 9]);
  });

  it('usa TODAY y no una fecha escrita a mano', async () => {
    const arrivals = await getArrivals('today');

    for (const arrival of arrivals) {
      expect(arrival.checkIn.slice(0, 10)).toBe(TODAY);
    }
  });

  it('separa mañana de hoy', async () => {
    const arrivals = await getArrivals('tomorrow');

    expect(arrivals).toHaveLength(3);
    for (const arrival of arrivals) {
      expect(arrival.checkIn.slice(0, 10)).toBe(daysFromToday(1));
    }
  });

  it('la semana incluye las de hoy, las de mañana y las de más adelante', async () => {
    const arrivals = await getArrivals('week');

    expect(arrivals).toHaveLength(9);
    expect(arrivals.map((arrival) => arrival.checkIn)).toEqual(
      [...arrivals.map((arrival) => arrival.checkIn)].sort(),
    );
  });

  it('cuenta 2 de 4 entrevistas completas hoy, como el dashboard', async () => {
    const arrivals = await getArrivals('today');
    const complete = arrivals.filter((arrival) => arrival.interview.complete);

    expect(complete).toHaveLength(2);
  });
});

describe('coherencia entre servicios', () => {
  it('la villa, el idioma y las alertas son iguales en llegadas y en el perfil', async () => {
    const arrivals = await getArrivals('today');

    for (const arrival of arrivals) {
      const profile = await getGuestProfile(arrival.stayId);

      expect(profile.stay.villa).toBe(arrival.villa);
      expect(profile.guest.locale).toBe(arrival.locale);
      expect(profile.guest.fullName).toBe(arrival.guestName);
      expect(profile.alerts).toEqual(arrival.alerts);
    }
  });

  it('cada llegada apunta a una estadía que existe', async () => {
    const arrivals = await getArrivals('week');

    for (const arrival of arrivals) {
      const stay = await getStay(arrival.stayId);
      expect(stay.villa).toBe(arrival.villa);
    }
  });

  it('Valeria llega a la Villa 04 con su aniversario y la alergia de Andrés', async () => {
    const [valeria] = await getArrivals('today');

    expect(valeria.guestName).toBe('Valeria Méndez y Andrés Rojas');
    expect(valeria.villa).toBe(4);
    expect(valeria.alerts).toContainEqual({
      kind: 'celebration',
      label: { es: 'Aniversario · 5 años', en: 'Anniversary · 5 years' },
    });
    expect(valeria.alerts).toContainEqual({
      kind: 'allergy',
      label: { es: 'Andrés: alergia a frutos secos', en: 'Andrés: nut allergy' },
    });
  });
});

describe('getVillaStatus', () => {
  it('describe las 10 villas', async () => {
    const villas = await getVillaStatus();

    expect(villas).toHaveLength(10);
    expect(villas.map((villa) => villa.villa)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('deja 8 villas con gente esta noche, como dice el indicador', () => {
    expect(occupiedCountOn(TODAY)).toBe(8);
  });

  it('marca la 01 saliendo, la 04 llegando y la 06 libre', async () => {
    const villas = await getVillaStatus();
    const stateOf = (villa: number) => villas.find((item) => item.villa === villa)?.state;

    expect(stateOf(1)).toBe('departing');
    expect(stateOf(4)).toBe('arriving');
    expect(stateOf(6)).toBe('free');
    expect(stateOf(8)).toBe('occupied');
  });

  it('ninguna villa tiene dos estadías encimadas', async () => {
    const villas = await getVillaStatus();

    for (const villa of villas) {
      if (villa.state !== 'free') {
        expect(villa.stayId).toBeTruthy();
      }
    }
  });
});

describe('getStay', () => {
  it('falla con un id que no existe', async () => {
    await expect(getStay('s-no-existe')).rejects.toThrow('No existe la estadía');
  });
});
