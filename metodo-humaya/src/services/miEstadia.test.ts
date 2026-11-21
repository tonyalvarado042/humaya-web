import { beforeEach, describe, expect, it } from 'vitest';
import { miEstadia, olvidarEstadia, recordarEstadia } from './miEstadia';

/**
 * La estadía que el teléfono ya encontró.
 *
 * Tony, 21 de noviembre de 2026: «guarda sesión para que cada vez no se lo
 * tenga que pedir». El huésped vuelve a abrir el QR de su villa —está pegado
 * en la pantalla— y tenía que buscar otra vez su código de Airbnb.
 */

const ESTADIA = {
  reserva: 'HMMK383ASS',
  guestName: 'Sowgandhi Bhanttu',
  checkin: '2026-12-17',
  checkout: '2026-12-21',
};

beforeEach(() => {
  localStorage.clear();
});

describe('acordarse de la estadía', () => {
  it('se guarda y se lee', () => {
    recordarEstadia(ESTADIA);

    expect(miEstadia('2026-12-18')).toEqual(ESTADIA);
  });

  it('sin nada guardado, no inventa ninguna', () => {
    expect(miEstadia('2026-12-18')).toBeNull();
  });

  it('se puede olvidar: «no soy yo»', () => {
    recordarEstadia(ESTADIA);

    olvidarEstadia();

    expect(miEstadia('2026-12-18')).toBeNull();
  });
});

describe('cuándo deja de valer', () => {
  it('el día de la salida todavía vale', () => {
    recordarEstadia(ESTADIA);

    expect(miEstadia('2026-12-21')).not.toBeNull();
  });

  it('dos días después todavía, por si el vuelo se corrió', () => {
    recordarEstadia(ESTADIA);

    expect(miEstadia('2026-12-23')).not.toBeNull();
  });

  it('al tercer día se olvida sola', () => {
    // Una reserva vieja no es la estadía de nadie. Si vuelve, vuelve con otra.
    recordarEstadia(ESTADIA);

    expect(miEstadia('2026-12-24')).toBeNull();
    // Y se borra de verdad, no solo se esconde.
    expect(localStorage.getItem('humaya.mi-estadia')).toBeNull();
  });
});

describe('cuando lo guardado no sirve', () => {
  it('basura en el almacenamiento no rompe la pantalla', () => {
    localStorage.setItem('humaya.mi-estadia', 'esto no es json');

    expect(miEstadia('2026-12-18')).toBeNull();
  });

  it('sin número de reserva no es una estadía', () => {
    localStorage.setItem('humaya.mi-estadia', JSON.stringify({ guestName: 'Alguien' }));

    expect(miEstadia('2026-12-18')).toBeNull();
  });
});
