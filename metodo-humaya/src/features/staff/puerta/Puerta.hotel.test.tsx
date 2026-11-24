import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { aplicarHotel, negocioActual } from '@/marca';
import { LLAVE_HOTEL } from '@/services/misHoteles';
import { Puerta } from './Puerta';

/**
 * Recepción trabaja en inglés por decisión de Tony (15 de noviembre de
 * 2026), así que los textos que se buscan acá son los de ese idioma.
 *
 * De qué hotel es la pantalla de recepción, en el dominio compartido.
 *
 * ── DE DÓNDE SALE ESTO ──────────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026, con una captura de
 * `hotelexp.liderax10.com`: «entré en hotelexp y sale bastantes errors».
 *
 * Lo que salía era «No pudimos cargar esta pantalla · Puede ser un problema
 * de conexión», en TODAS las pantallas. Y mentía dos veces: no era la
 * conexión —no se hacía ni una petición— y no era pasajero.
 *
 * La causa: en ese dominio la dirección no dice de qué hotel es la pantalla.
 * `hotel.ts` decía que «del lado de recepción lo dice la cuenta, y eso se
 * resuelve después de entrar», pero eso nunca se escribió, así que
 * `elNegocio()` lanzaba `sin_hotel_resuelto` antes de pedir nada.
 */

const HUMAYA = {
  negocioId: 'n-humaya',
  codigo: 'humaya',
  marcaExperiencia: 'HUMAYA Experience',
  marcaHotel: 'HUMAYA',
  correo: 'hola@stayhumaya.com',
  esDemo: false,
  portadaTitulo: null,
  portadaBajada: null,
  tema: null,
};
const DEMO = {
  negocioId: 'n-demo',
  codigo: 'demo',
  marcaExperiencia: 'Demo Experience',
  marcaHotel: 'HOTEL DEMO',
  correo: 'demo@liderax10.com',
  esDemo: true,
  portadaTitulo: null,
  portadaBajada: null,
  tema: null,
};

const QUIEN = {
  id: 'u-1',
  correo: 'recepcion@liderax10.com',
  nombre: 'Recepción',
  rol: 'administrador',
  entra: true,
};

const quienSoy = vi.fn();
const misHoteles = vi.fn();
const salir = vi.fn();

vi.mock('@/services/sesion', async (importar) => {
  const real = await importar<typeof import('@/services/sesion')>();
  return {
    ...real,
    quienSoy: () => quienSoy(),
    salir: () => salir(),
    alCambiar: () => Promise.resolve(() => {}),
  };
});

vi.mock('@/services/misHoteles', async (importar) => {
  const real = await importar<typeof import('@/services/misHoteles')>();
  return { ...real, misHoteles: () => misHoteles() };
});

beforeEach(() => {
  localStorage.clear();
  quienSoy.mockReset().mockResolvedValue(QUIEN);
  misHoteles.mockReset();
  salir.mockReset();
  // El punto de partida es el del dominio compartido: sin hotel.
  aplicarHotel(null);
});

afterEach(() => {
  aplicarHotel(null);
});

function montar() {
  return render(
    <Puerta>
      <p>Recepción abierta</p>
    </Puerta>,
  );
}

describe('cuando la cuenta trabaja en un solo hotel', () => {
  it('abre recepción con ese hotel, sin preguntar nada', async () => {
    misHoteles.mockResolvedValue([DEMO]);

    montar();

    expect(await screen.findByText('Recepción abierta')).toBeInTheDocument();
    // EL PUNTO: antes esto era null y toda consulta reventaba.
    expect(negocioActual()).toBe('n-demo');
    // Con una sola respuesta no se pregunta: eso es un trámite, no una elección.
    expect(screen.queryByText('Which hotel?')).not.toBeInTheDocument();
  });
});

describe('cuando la cuenta trabaja en varios (un súper admin)', () => {
  it('pregunta en cuál, y recién entonces abre', async () => {
    misHoteles.mockResolvedValue([DEMO, HUMAYA]);

    montar();

    expect(await screen.findByText('Which hotel?')).toBeInTheDocument();
    expect(screen.queryByText('Recepción abierta')).not.toBeInTheDocument();
    expect(negocioActual()).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /HUMAYA/ }));

    expect(await screen.findByText('Recepción abierta')).toBeInTheDocument();
    expect(negocioActual()).toBe('n-humaya');
  });

  it('se acuerda del elegido y no vuelve a preguntar', async () => {
    misHoteles.mockResolvedValue([DEMO, HUMAYA]);
    localStorage.setItem(LLAVE_HOTEL, 'humaya');

    montar();

    expect(await screen.findByText('Recepción abierta')).toBeInTheDocument();
    expect(negocioActual()).toBe('n-humaya');
  });

  it('si al recordado ya no tiene acceso, vuelve a preguntar en vez de abrir otro', async () => {
    // Le quitaron HUMAYA. Abrir el demo «porque es el que queda» sería
    // meterlo en el hotel equivocado sin avisar.
    misHoteles.mockResolvedValue([DEMO, { ...HUMAYA, codigo: 'otro', negocioId: 'n-otro' }]);
    localStorage.setItem(LLAVE_HOTEL, 'humaya');

    montar();

    expect(await screen.findByText('Which hotel?')).toBeInTheDocument();
    expect(negocioActual()).toBeNull();
  });
});

describe('cuando la cuenta no está en ningún hotel', () => {
  it('lo dice, en vez de echarle la culpa a la conexión', async () => {
    misHoteles.mockResolvedValue([]);

    montar();

    expect(await screen.findByText('Your account is not at any hotel')).toBeInTheDocument();
    expect(screen.getByText(/recepcion@liderax10\.com/)).toBeInTheDocument();
    // Lo que se veía en vivo, y que no era cierto:
    expect(screen.queryByText(/may be the connection/)).not.toBeInTheDocument();
    expect(screen.queryByText('Recepción abierta')).not.toBeInTheDocument();
  });
});

describe('cuando la lista no se puede leer', () => {
  it('eso sí puede ser la conexión, y ofrece reintentar', async () => {
    misHoteles.mockRejectedValue(new Error('hoteles_no_se_pudieron_leer'));

    montar();

    expect(await screen.findByText("We couldn't load your hotels")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});

describe('en el dominio propio de un hotel', () => {
  it('no pregunta ni consulta: la dirección ya lo dijo', async () => {
    aplicarHotel(HUMAYA);

    montar();

    expect(await screen.findByText('Recepción abierta')).toBeInTheDocument();
    expect(misHoteles).not.toHaveBeenCalled();
  });
});
