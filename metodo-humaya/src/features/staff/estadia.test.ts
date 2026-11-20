import { describe, expect, it } from 'vitest';
import type { Stay } from '@/types';
import { momentoDeLaEstadia } from './estadia';

/** Valeria y Andrés: entran el 14, salen el 17. Tres noches. */
function estadia(checkIn = '2026-11-14T15:00:00-06:00', checkOut = '2026-11-17T11:00:00-06:00') {
  return {
    id: 's-mendez-rojas',
    guestId: 'g-mendez-rojas',
    villa: 4,
    checkIn,
    checkOut,
    partySize: 2,
    status: 'upcoming',
  } as Stay;
}

describe('en qué momento de su estadía va el huésped', () => {
  it('antes de llegar cuenta los días que faltan', () => {
    const momento = momentoDeLaEstadia(estadia(), '2026-11-12');
    expect(momento.clase).toBe('por-llegar');
    expect(momento.dias).toBe(2);
    expect(momento.dia).toBe(0);
  });

  it('el día de la entrada ya es su día 1', () => {
    const momento = momentoDeLaEstadia(estadia(), '2026-11-14');
    expect(momento.clase).toBe('llega-hoy');
    expect(momento.dia).toBe(1);
    expect(momento.noches).toBe(3);
  });

  it('en el medio dice en qué noche va', () => {
    const momento = momentoDeLaEstadia(estadia(), '2026-11-15');
    expect(momento.clase).toBe('en-casa');
    expect(momento.dia).toBe(2);
    expect(momento.noches).toBe(3);
    expect(momento.seVaManana).toBe(false);
  });

  it('avisa la víspera de la salida, que es cuando cambia todo', () => {
    // Es el dato que cambia la respuesta: lo que se ofrece el día 3 de 3 no
    // es lo mismo que el día 1, y «mañana lo vemos» deja de ser una opción.
    const momento = momentoDeLaEstadia(estadia(), '2026-11-16');
    expect(momento.clase).toBe('en-casa');
    expect(momento.dia).toBe(3);
    expect(momento.seVaManana).toBe(true);
  });

  it('el día de la salida lo dice sin rodeos', () => {
    const momento = momentoDeLaEstadia(estadia(), '2026-11-17');
    expect(momento.clase).toBe('se-va-hoy');
    expect(momento.dia).toBe(3);
  });

  it('después cuenta cuántos días hace que se fue', () => {
    const momento = momentoDeLaEstadia(estadia(), '2026-11-19');
    expect(momento.clase).toBe('se-fue');
    expect(momento.dias).toBe(2);
  });

  it('una sola noche se va mañana desde el día que llega', () => {
    const momento = momentoDeLaEstadia(
      estadia('2026-11-14T15:00:00-06:00', '2026-11-15T11:00:00-06:00'),
      '2026-11-14',
    );
    expect(momento.clase).toBe('llega-hoy');
    expect(momento.noches).toBe(1);
    expect(momento.seVaManana).toBe(true);
  });

  it('entrar de noche no empuja el día 1 al día siguiente', () => {
    // 11 p.m. hora de Costa Rica es el día siguiente en UTC. Si la cuenta se
    // hiciera con la hora, este huésped aparecería como «llega mañana»
    // estando ya en la villa.
    const momento = momentoDeLaEstadia(
      estadia('2026-11-14T23:30:00-06:00', '2026-11-17T11:00:00-06:00'),
      '2026-11-14',
    );
    expect(momento.clase).toBe('llega-hoy');
  });

  it('una estadía sin noches sigue valiendo una', () => {
    const momento = momentoDeLaEstadia(
      estadia('2026-11-14T10:00:00-06:00', '2026-11-14T20:00:00-06:00'),
      '2026-11-14',
    );
    expect(momento.noches).toBe(1);
    expect(momento.dia).toBe(1);
  });
});
