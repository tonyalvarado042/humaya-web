import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aplicarDominios, aplicarHotel } from '@/marca';
import { Mudanza, MudanzaAlHuesped } from './Mudanza';

/**
 * Mudar de dominio sin romper la dirección.
 *
 * ── EL FALLO QUE ESTO AGARRA, Y POR QUÉ ANTES NO LO AGARRABA ────────────
 * Comprobado en vivo el 25 de noviembre de 2026:
 * `hotelexp.liderax10.com/bikeandbed/app` terminaba en
 * `guestexp.liderax10.com/bikeandbed/bikeandbed/app` — el código del hotel
 * dos veces, y «Esta dirección no existe».
 *
 * La causa: la mudanza le AGREGABA el prefijo a una ruta que ya lo traía.
 * Tenía sentido mientras los dos lados numeraban distinto; desde el 24 de
 * noviembre el código del hotel va en la ruta de los dos.
 *
 * Y esta prueba estaba en verde mientras pasaba. Fingía `pathname = '/app'`,
 * que es el de ANTES del cambio: afirmaba que el mundo seguía siendo como
 * era. Por eso ahora los pathnames de acá son los de verdad —los que tiene
 * `window.location` con el `basename` del hotel puesto— y hay una prueba
 * cuyo único trabajo es que el prefijo no salga dos veces.
 */
function espiarReplace(pathname: string) {
  const replace = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { pathname, search: '', hash: '', replace },
  });
  return replace;
}

const original = window.location;

beforeEach(() => {
  aplicarDominios({ huesped: 'guestexp.liderax10.com', personal: null });
  aplicarHotel({
    negocioId: 'n-1',
    codigo: 'bikeandbed',
    marcaExperiencia: 'Bike & Bed Experience',
    marcaHotel: 'Bike & Bed',
    correo: 'hola@bikeandbed.com',
    esDemo: false,
    portadaTitulo: null,
    portadaBajada: null,
    tema: null,
  });
});

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: original });
});

describe('Mudanza', () => {
  it('cambia el dominio y deja la ruta como está', () => {
    const replace = espiarReplace('/bikeandbed/staff');

    render(<Mudanza base="https://hotelexp.liderax10.com" aviso="…" />);

    expect(replace).toHaveBeenCalledWith('https://hotelexp.liderax10.com/bikeandbed/staff');
  });

  it('se lleva lo que venga después de la ruta', () => {
    const replace = espiarReplace('/bikeandbed/staff');
    window.location.search = '?hotel=otro';
    window.location.hash = '#abajo';

    render(<Mudanza base="https://hotelexp.liderax10.com" aviso="…" />);

    expect(replace).toHaveBeenCalledWith(
      'https://hotelexp.liderax10.com/bikeandbed/staff?hotel=otro#abajo',
    );
  });
});

describe('de recepción a la app del huésped', () => {
  /** EL QUE IMPORTA: el código del hotel, una sola vez. */
  it('en el dominio compartido NO repite el código del hotel', () => {
    const replace = espiarReplace('/bikeandbed/app');

    render(<MudanzaAlHuesped />);

    expect(replace).toHaveBeenCalledWith('https://guestexp.liderax10.com/bikeandbed/app');
  });

  it('en el dominio propio de un hotel no hay prefijo que llevar', () => {
    const replace = espiarReplace('/app');

    render(<MudanzaAlHuesped />);

    expect(replace).toHaveBeenCalledWith('https://guestexp.liderax10.com/app');
  });
});
