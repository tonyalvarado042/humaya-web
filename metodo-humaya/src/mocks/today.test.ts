import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * La demo no puede volver a envejecer.
 *
 * ── POR QUÉ ESTA PRUEBA VIAJA EN EL TIEMPO ──────────────────────────────
 * Afirmar que hoy es hoy no prueba nada: pasaría igual con la fecha fija del
 * 14 de noviembre de 2026 si se corriera ese día. Lo único que demuestra que
 * los datos de ejemplo siguen al calendario es **mover el reloj** y ver que
 * se mueven con él.
 *
 * Los módulos se recargan a propósito en cada caso: `TODAY` se calcula una
 * sola vez, al cargar el módulo, y sin `resetModules()` quedaría el valor de
 * la primera importación.
 */

async function enLaFecha(cuando: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(cuando));
  vi.resetModules();

  const today = await import('./today');
  const { STAYS } = await import('./stays');
  const { SEED_BOOKINGS } = await import('./spa');
  return { today, STAYS, SEED_BOOKINGS };
}

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe('los datos de ejemplo siguen al calendario', () => {
  it('Valeria llega HOY, sea cual sea el día', async () => {
    // Su estadía era del 14 al 17 de noviembre de 2026. En marzo de 2027 esa
    // semana hace meses que pasó; antes, la demo mostraba un huésped que
    // "llegaba hoy" cuatro meses atrás.
    const marzo = await enLaFecha('2027-03-15T18:00:00Z');
    const valeriaEnMarzo = marzo.STAYS.find((stay) => stay.id === 's-mendez-rojas');
    expect(valeriaEnMarzo?.checkIn.slice(0, 10)).toBe('2027-03-15');
    expect(marzo.today.TODAY).toBe('2027-03-15');

    const agosto = await enLaFecha('2029-08-02T18:00:00Z');
    const valeriaEnAgosto = agosto.STAYS.find((stay) => stay.id === 's-mendez-rojas');
    expect(valeriaEnAgosto?.checkIn.slice(0, 10)).toBe('2029-08-02');
  });

  it('su estadía sigue durando tres noches, no se estira ni se encoge', async () => {
    const { STAYS } = await enLaFecha('2027-03-15T18:00:00Z');
    const valeria = STAYS.find((stay) => stay.id === 's-mendez-rojas');

    expect(valeria?.checkIn.slice(0, 10)).toBe('2027-03-15');
    expect(valeria?.checkOut.slice(0, 10)).toBe('2027-03-18');
    // Y la hora de entrada se conserva: llega a las 3 de la tarde, no a medianoche.
    expect(valeria?.checkIn).toContain('T15:00:00-06:00');
  });

  it('ninguna reserva del spa queda en el pasado', async () => {
    // Era el fallo que lo destapó todo: desde un teléfono se pudo reservar
    // para seis días atrás, y la reserva se guardó en la base.
    const { today, SEED_BOOKINGS } = await enLaFecha('2027-03-15T18:00:00Z');

    for (const booking of SEED_BOOKINGS) {
      expect(booking.start.slice(0, 10) >= today.TODAY).toBe(true);
    }
  });

  it('lo que ya pasó sigue en el pasado: la entrevista se contestó antes de llegar', async () => {
    const { today } = await enLaFecha('2027-03-15T18:00:00Z');
    const { SEED_ANSWERS } = await import('./interview');

    const deValeria = SEED_ANSWERS['s-mendez-rojas'] ?? [];
    expect(deValeria.length).toBeGreaterThan(0);
    for (const respuesta of deValeria) {
      expect(respuesta.answeredAt.slice(0, 10) < today.TODAY).toBe(true);
    }
  });

  it('a las 11 de la noche en Costa Rica todavía es hoy, no mañana', async () => {
    // 2027-03-16T05:00Z son las 11 p.m. del 15 en Costa Rica. Con el huso del
    // navegador, la demo habría saltado al día siguiente.
    const { today } = await enLaFecha('2027-03-16T05:00:00Z');
    expect(today.TODAY).toBe('2027-03-15');
  });
});
