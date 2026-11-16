import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * El reloj de la máquina puede ir corrido. El 16 de noviembre de 2026 el de
 * Tony iba 4 minutos adelantado del servidor, y una nota recién escrita se
 * mostraba como «hace 4 minutos».
 *
 * Cada prueba reimporta el módulo: el desfase se mide una sola vez y se
 * guarda, así que sin `resetModules` la segunda prueba vería la medición de
 * la primera.
 */
async function cargarReloj() {
  vi.resetModules();
  return import('./reloj');
}

function respuestaCon(fechaDelServidor: string) {
  return {
    headers: { get: (nombre: string) => (nombre === 'date' ? fechaDelServidor : null) },
  } as unknown as Response;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-16T14:17:55Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('la hora, corregida contra el servidor', () => {
  it('descuenta el adelanto del reloj local', async () => {
    // La máquina cree que son las 14:17:55; el servidor dice 14:13:55.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respuestaCon('Mon, 16 Nov 2026 14:13:55 GMT')),
    );

    const { sincronizarReloj, ahora, desfaseDelReloj } = await cargarReloj();
    sincronizarReloj();
    await vi.waitFor(() => expect(desfaseDelReloj()).not.toBe(0));

    expect(Math.round(desfaseDelReloj() / 1000)).toBe(240);

    // Al segundo, no al milisegundo: la cabecera `Date` viene redondeada y
    // el ajuste del viaje de ida y vuelta mueve unas decenas de ms. Exigir
    // precisión de milisegundo sería exigir algo que el método no da.
    const esperado = new Date('2026-11-16T14:13:55Z').getTime();
    expect(Math.abs(ahora() - esperado)).toBeLessThan(1000);
  });

  it('no corrige un ruido de menos de un segundo', async () => {
    // La cabecera `Date` viene redondeada al segundo: corregir esa diferencia
    // sería inventar una precisión que no existe.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respuestaCon('Mon, 16 Nov 2026 14:17:55 GMT')),
    );

    const { sincronizarReloj, desfaseDelReloj } = await cargarReloj();
    sincronizarReloj();
    await vi.waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());

    expect(desfaseDelReloj()).toBe(0);
  });

  it('sin red se sigue con el reloj local en vez de romperse', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));

    const { sincronizarReloj, ahora, desfaseDelReloj } = await cargarReloj();
    sincronizarReloj();
    await vi.waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());

    expect(desfaseDelReloj()).toBe(0);
    expect(ahora()).toBe(Date.now());
  });

  it('mide una sola vez aunque se pregunte muchas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respuestaCon('Mon, 16 Nov 2026 14:13:55 GMT')),
    );

    const { ahora } = await cargarReloj();
    ahora();
    ahora();
    ahora();
    await vi.waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});
