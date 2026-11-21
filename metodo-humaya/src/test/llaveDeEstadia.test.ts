import { describe, expect, it } from 'vitest';
import {
  abrirLlave,
  diaDe,
  firmarLlave,
} from '../../../supabase/functions/humaya-entrada/llave.ts';

/**
 * La llave de estadía: entrar desde el QR del televisor sin escribir nada.
 *
 * Tony, 21 de noviembre de 2026: «si ya la villa está ocupada y tienen los
 * datos de la reservación, ¿no es mejor que automáticamente, cuando le hace
 * QR, ya venga con los datos precargados?».
 *
 * Esto prueba la parte que NO se puede mirar en pantalla: que una llave
 * firmada por nosotros abra, y que ninguna otra lo haga.
 *
 * Corre en Node y no en jsdom porque necesita `crypto.subtle` de verdad.
 */

const SECRETO = 'una-llave-de-servicio-cualquiera';
const SALIDA = diaDe('2026-12-21') + 1;

describe('la llave que firmamos nosotros', () => {
  it('se abre y dice de quién es la villa y la reserva', async () => {
    const llave = await firmarLlave(SECRETO, 'v1-capi-capi', '6892JEMFAN', SALIDA);

    expect(await abrirLlave(SECRETO, llave!, diaDe('2026-12-18'))).toEqual({
      villa: 'v1-capi-capi',
      reserva: '6892JEMFAN',
      vence: SALIDA,
    });
  });

  it('el día que se vence todavía abre, y al siguiente ya no', async () => {
    // Se firma con la salida + 1: el huésped que se va el 21 tiene su QR
    // todo el día 21, y el 22 ya es de la villa, no suya.
    const llave = (await firmarLlave(SECRETO, 'v1-capi-capi', 'ABC123', SALIDA))!;

    expect(await abrirLlave(SECRETO, llave, SALIDA)).not.toBeNull();
    expect(await abrirLlave(SECRETO, llave, SALIDA + 1)).toBeNull();
  });
});

describe('las que no firmamos nosotros', () => {
  it('otra llave de servicio no abre', async () => {
    const llave = (await firmarLlave('otro-secreto', 'v1-capi-capi', 'ABC123', SALIDA))!;

    expect(await abrirLlave(SECRETO, llave, diaDe('2026-12-18'))).toBeNull();
  });

  it('cambiarle la reserva a una llave buena la rompe', async () => {
    // EL PUNTO: sin firma, cualquiera cambiaría el número de reserva en la
    // dirección y entraría a la estadía del vecino.
    const llave = (await firmarLlave(SECRETO, 'v1-capi-capi', 'ABC123', SALIDA))!;
    const manoseada = llave.replace('ABC123', 'XYZ999');

    expect(manoseada).not.toEqual(llave);
    expect(await abrirLlave(SECRETO, manoseada, diaDe('2026-12-18'))).toBeNull();
  });

  it('cambiarle la fecha de vencimiento también', async () => {
    const llave = (await firmarLlave(SECRETO, 'v1-capi-capi', 'ABC123', SALIDA))!;
    const estirada = llave.replace(String(SALIDA), String(SALIDA + 365));

    expect(await abrirLlave(SECRETO, estirada, SALIDA + 100)).toBeNull();
  });

  it('basura, vacío o media llave no abren ni revientan', async () => {
    for (const basura of [
      '',
      'hola',
      'a.b.c',
      'a.b.c.d.e',
      'v1.ABC.notanumber.x',
      'x'.repeat(400),
    ]) {
      expect(await abrirLlave(SECRETO, basura, 20_000)).toBeNull();
    }
  });
});

describe('lo que no se firma', () => {
  it('sin secreto no hay llave: un deploy sin configurar no firma cualquier cosa', async () => {
    expect(await firmarLlave('', 'v1-capi-capi', 'ABC123', SALIDA)).toBeNull();
  });

  it('una villa o una reserva con forma rara no se firman', async () => {
    expect(await firmarLlave(SECRETO, 'v1.capi', 'ABC123', SALIDA)).toBeNull();
    expect(await firmarLlave(SECRETO, 'V1-CAPI', 'ABC123', SALIDA)).toBeNull();
    expect(await firmarLlave(SECRETO, 'v1-capi-capi', 'ABC.123', SALIDA)).toBeNull();
  });

  it('una fecha que no es fecha no pasa como vencimiento', async () => {
    expect(await firmarLlave(SECRETO, 'v1-capi-capi', 'ABC123', diaDe('ayer'))).toBeNull();
  });
});
