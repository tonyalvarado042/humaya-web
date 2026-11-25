import { afterEach, describe, expect, it } from 'vitest';
import { aplicarHotel } from '@/marca';
import { puertaCopy } from './copy';

/**
 * El ejemplo que va dentro del campo de correo de la puerta.
 *
 * ── EL FALLO QUE ESTO AGARRA ────────────────────────────────
 * Estaba escrito a mano: `you@stayhumaya.com`, igual para todos. Visto el 25
 * de noviembre de 2026 abriendo `hotelexp.liderax10.com/bikeandbed/staff`: la
 * puerta de Bike & Bed le proponía a su propia recepción el correo de otra
 * empresa.
 *
 * Es el tercero del mismo tipo en dos días —antes fueron el logo de la puerta
 * y el título de la pestaña—, y por eso la prueba que importa no es la que
 * mira que diga el dominio correcto, sino la que mira que NO diga el de
 * HUMAYA cuando la pantalla es de otro.
 */

const BIKE = {
  negocioId: 'n-bike',
  codigo: 'bikeandbed',
  marcaExperiencia: 'Bike & Bed Experience',
  marcaHotel: 'Bike & Bed by Humaya',
  correo: 'info@bikeandbedhotels.com',
  esDemo: false,
  portadaTitulo: null,
  portadaBajada: null,
  tema: null,
};

afterEach(() => {
  aplicarHotel(null);
});

describe('el ejemplo del campo de correo', () => {
  it('lleva el dominio del hotel que sirve la pantalla', () => {
    aplicarHotel(BIKE);

    expect(puertaCopy.en.correoPlaceholder).toBe('you@bikeandbedhotels.com');
    expect(puertaCopy.es.correoPlaceholder).toBe('vos@bikeandbedhotels.com');
  });

  /** EL QUE IMPORTA. */
  it('NO le enseña a un hotel el correo de otra empresa', () => {
    aplicarHotel(BIKE);

    expect(puertaCopy.en.correoPlaceholder).not.toContain('stayhumaya');
    expect(puertaCopy.es.correoPlaceholder).not.toContain('stayhumaya');
  });

  it('cambia cuando cambia el hotel, sin recargar nada', () => {
    aplicarHotel(BIKE);
    expect(puertaCopy.en.correoPlaceholder).toBe('you@bikeandbedhotels.com');

    aplicarHotel({ ...BIKE, codigo: 'demo', correo: 'demo@liderax10.com' });
    expect(puertaCopy.en.correoPlaceholder).toBe('you@liderax10.com');
  });

  it('sin dominio no inventa una dirección', () => {
    aplicarHotel({ ...BIKE, correo: 'sin-arroba' });

    expect(puertaCopy.en.correoPlaceholder).toBe('');
  });
});
