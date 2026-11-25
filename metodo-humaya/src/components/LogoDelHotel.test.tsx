import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { aplicarHotel } from '@/marca';
import type { Tema } from '@/services/tema';
import { LogoDelHotel } from './LogoDelHotel';

/**
 * El logo del hotel que sirve la pantalla.
 *
 * ── EL FALLO QUE ESTO AGARRA ────────────────────────────────────────────
 * `HumayaLogo` pintaba `/wordmark-white.png` siempre. Comprobado en vivo el
 * 21 de noviembre de 2026 en el servidor local contra el hotel demo: la
 * barra de recepción y el Home del huésped decían «HUMAYA» rodeados de la
 * marca verde del demo.
 *
 * Mostrarle a un huésped el logotipo de otra empresa no es un detalle de
 * diseño: es decirle que está en otro hotel.
 */

const HUMAYA = {
  negocioId: 'n-humaya',
  codigo: 'humaya',
  marcaExperiencia: 'HUMAYA Experience',
  marcaHotel: 'HUMAYA',
  correo: 'reservations@stayhumaya.com',
  esDemo: false,
  portadaTitulo: null,
  portadaBajada: null,
};

function enHotel(marcaHotel: string, tema: Tema | null) {
  aplicarHotel({ ...HUMAYA, marcaHotel, tema });
}

afterEach(() => {
  aplicarHotel(null);
});

describe('un hotel con logo propio', () => {
  it('muestra su imagen, con su nombre como texto alternativo', () => {
    enHotel('HUMAYA', { logo: '/wordmark-white.png' });
    render(<LogoDelHotel />);

    expect(screen.getByRole('img', { name: 'HUMAYA' })).toHaveAttribute(
      'src',
      '/wordmark-white.png',
    );
  });

  it('el cuadrado y el largo son imágenes distintas', () => {
    enHotel('HUMAYA', { logo: '/wordmark-white.png', logoMarca: '/mark-gold.png' });
    const { rerender } = render(<LogoDelHotel variant="mark" />);
    expect(screen.getByRole('img', { name: 'HUMAYA' })).toHaveAttribute('src', '/mark-gold.png');

    rerender(<LogoDelHotel variant="wordmark" />);
    expect(screen.getByRole('img', { name: 'HUMAYA' })).toHaveAttribute(
      'src',
      '/wordmark-white.png',
    );
  });
});

describe('un hotel sin logo propio', () => {
  /** EL TEST QUE IMPORTA: no se le enseña a nadie la marca de otro. */
  it('muestra su nombre y NO la imagen de otro hotel', () => {
    enHotel('HOTEL DEMO', { acento: '#4a9d7f' });
    render(<LogoDelHotel />);

    expect(screen.getByText('HOTEL DEMO')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('sin tema ninguno tampoco cae a la imagen de nadie', () => {
    enHotel('BIKE & BED', null);
    render(<LogoDelHotel />);

    expect(screen.getByText('BIKE & BED')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('donde el largo no cabe, usa la inicial', () => {
    enHotel('HOTEL DEMO', null);
    render(<LogoDelHotel variant="mark" />);

    expect(screen.getByText('H')).toBeInTheDocument();
  });
});

describe('la medida la pide la pantalla, no el logo', () => {
  /**
   * ── EL FALLO QUE ESTO AGARRA ──────────────────────────────────────────
   * Tony, 25 de noviembre de 2026, con una foto de `staff.stayhumaya.com` en
   * el teléfono: el monograma de HUMAYA ocupaba toda la pantalla y empujaba
   * las reservas fuera de la vista.
   *
   * La barra de recepción pide `h-8`, pero el `<img>` traía además `h-auto`
   * suyo. `cn()` no resuelve conflictos —solo pega las clases— así que cuál
   * gana lo decide el orden del CSS compilado, y ganaba `h-auto`: el PNG se
   * pintaba a su tamaño natural, 642×792, en un teléfono de 390 de ancho.
   *
   * Por eso la prueba NO mira que esté `h-8`: mira que no haya DOS alturas.
   * Un `getComputedStyle` acá no sirve —jsdom no carga Tailwind— y afirmar
   * «tiene h-8» pasaba también con el fallo puesto.
   */
  const medidas = (el: HTMLElement, eje: 'h' | 'w') =>
    el.className.split(/\s+/).filter((clase) => new RegExp(`^${eje}-`).test(clase));

  it('no le suma al logo una altura propia que le gane a la pedida', () => {
    enHotel('HUMAYA', { logoMarca: '/mark-gold.png' });
    render(<LogoDelHotel variant="mark" className="h-8 w-auto shrink-0" />);

    expect(medidas(screen.getByRole('img'), 'h')).toEqual(['h-8']);
  });

  it('tampoco un ancho propio', () => {
    enHotel('HUMAYA', { logo: '/wordmark-white.png' });
    render(<LogoDelHotel className="w-30" />);

    expect(medidas(screen.getByRole('img'), 'w')).toEqual(['w-30']);
  });
});

describe('lo que viene de la base no entra sin mirarlo', () => {
  /**
   * `tema` lo escribe un administrador y es `jsonb`: puede traer cualquier
   * cosa. Esto termina en el `src` de una etiqueta que se pinta en TODAS las
   * pantallas.
   */
  it('una dirección que no es una imagen se ignora', () => {
    enHotel('HOTEL DEMO', { logo: 'javascript:alert(1)' } as Tema);
    render(<LogoDelHotel />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('HOTEL DEMO')).toBeInTheDocument();
  });

  it('tampoco entra un http:// sin cifrar', () => {
    enHotel('HOTEL DEMO', { logo: 'http://ejemplo.com/logo.png' } as Tema);
    render(<LogoDelHotel />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('un https:// de verdad sí entra', () => {
    enHotel('HOTEL DEMO', { logo: 'https://ejemplo.com/logo.png' } as Tema);
    render(<LogoDelHotel />);

    expect(screen.getByRole('img', { name: 'HOTEL DEMO' })).toHaveAttribute(
      'src',
      'https://ejemplo.com/logo.png',
    );
  });
});
