import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aplicarDominios, aplicarHotel } from '@/marca';
import { Mudanza, MudanzaAlHuesped } from './Mudanza';

/**
 * El huésped y recepción no numeran igual: en el dominio compartido el hotel
 * va en la ruta (`/bikeandbed/app`) y del lado del personal no va en ninguna
 * parte, lo dice la cuenta. Mudar sin traducir el prefijo rompe el enlace de
 * las dos maneras posibles.
 */
function espiarReplace() {
  const replace = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { pathname: '/app', search: '', hash: '', replace },
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
  it('quita el prefijo del hotel al ir a recepción', () => {
    const replace = espiarReplace();
    window.location.pathname = '/bikeandbed/staff';

    render(<Mudanza base="https://hotelexp.liderax10.com" quitar="/bikeandbed" aviso="…" />);

    expect(replace).toHaveBeenCalledWith('https://hotelexp.liderax10.com/staff');
  });

  it('pone el prefijo del hotel al ir a la app del huésped', () => {
    const replace = espiarReplace();

    render(<Mudanza base="https://guestexp.liderax10.com" agregar="/bikeandbed" aviso="…" />);

    expect(replace).toHaveBeenCalledWith('https://guestexp.liderax10.com/bikeandbed/app');
  });
});

/**
 * ── EL FALLO QUE ESTO AGARRA ───────────────────────────────────────────
 * Comprobado en vivo el 24 de noviembre de 2026, en el teléfono, entrando a
 * la recepción de Bike & Bed: «Abrir la app del huésped» caía en
 * `guestexp.liderax10.com/app` —sin hotel— y mostraba «Falta el hotel en la
 * dirección. Este enlace está a medias.»
 *
 * El prefijo NO se puede calcular al armar el router: del lado del personal
 * el hotel lo dice la cuenta, y la cuenta se resuelve después de entrar. Por
 * eso se lee al pintar.
 */
describe('de recepción a la app del huésped', () => {
  it('en el dominio compartido se lleva el hotel puesto', () => {
    const replace = espiarReplace();

    render(<MudanzaAlHuesped compartido />);

    // EL PUNTO: /bikeandbed/app, no /app.
    expect(replace).toHaveBeenCalledWith('https://guestexp.liderax10.com/bikeandbed/app');
  });

  it('en el dominio propio de un hotel no le pone prefijo a nada', () => {
    const replace = espiarReplace();

    render(<MudanzaAlHuesped compartido={false} />);

    expect(replace).toHaveBeenCalledWith('https://guestexp.liderax10.com/app');
  });
});
