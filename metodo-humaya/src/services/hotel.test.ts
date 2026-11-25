import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { codigoDeLaRuta, ladoDe, resolverHotel } from './hotel';
import { aplicarHotel, MARCA } from '@/marca';

const HUMAYA = {
  dominio: 'experience.stayhumaya.com',
  lado: 'huesped',
  compartido: false,
  negocio_id: '4cb80ad6-1004-4d06-9dfb-946a1718be87',
  codigo: 'humaya',
  marca_experiencia: 'HUMAYA Experience',
  marca_hotel: 'HUMAYA',
  correo: 'reservations@stayhumaya.com',
  esDemo: false,
  portadaTitulo: null,
  portadaBajada: null,
};

const COMPARTIDO_HUESPED = {
  dominio: 'guestexp.liderax10.com',
  lado: 'huesped',
  compartido: true,
  negocio_id: null,
  codigo: null,
  marca_experiencia: null,
  marca_hotel: null,
  correo: null,
  esDemo: false,
  portadaTitulo: null,
  portadaBajada: null,
};

/** Contesta a las dos funciones de la base según el cuerpo del pedido. */
function stubBase(porDominio: unknown[], porCodigo: unknown[] = []) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const cual = String(url).includes('de_dominio') ? porDominio : porCodigo;
      void init;
      return Promise.resolve(new Response(JSON.stringify(cual), { status: 200 }));
    }),
  );
}

beforeEach(() => aplicarHotel(null));
afterEach(() => {
  vi.unstubAllGlobals();
  aplicarHotel(null);
});

describe('de qué lado es un dominio', () => {
  it('conoce los dos del producto y los dos de un hotel propio', () => {
    expect(ladoDe('hotelexp.liderax10.com')).toBe('personal');
    expect(ladoDe('guestexp.liderax10.com')).toBe('huesped');
    expect(ladoDe('staff.stayhumaya.com')).toBe('personal');
    expect(ladoDe('experience.stayhumaya.com')).toBe('huesped');
  });

  it('en local no separa, para poder probar los dos lados', () => {
    expect(ladoDe('localhost')).toBe('ambos');
  });
});

describe('el código de hotel en la ruta', () => {
  it('lo saca del primer pedazo', () => {
    expect(codigoDeLaRuta('/humaya/app/bookings')).toBe('humaya');
    expect(codigoDeLaRuta('/bike-and-bed/entrada')).toBe('bike-and-bed');
  });

  it('NO confunde una ruta nuestra con un hotel', () => {
    // Sin esto, entrar a /app en el dominio compartido buscaría un hotel
    // llamado «app» y la pantalla quedaría sin marca.
    expect(codigoDeLaRuta('/app')).toBeNull();
    expect(codigoDeLaRuta('/staff/concierge')).toBeNull();
    expect(codigoDeLaRuta('/entrada')).toBeNull();
    expect(codigoDeLaRuta('/')).toBeNull();
  });
});

describe('un hotel con dominio propio', () => {
  it('se resuelve con la dirección sola, sin prefijo en las rutas', async () => {
    // Es lo que mantiene vivos los enlaces de HUMAYA: experience.stayhumaya.com
    // sigue sirviendo /app, no /humaya/app.
    stubBase([HUMAYA]);
    const donde = await resolverHotel('experience.stayhumaya.com', '/app');

    expect(donde.hotel?.codigo).toBe('humaya');
    expect(donde.base).toBe('');
    expect(donde.compartido).toBe(false);
    expect(donde.lado).toBe('huesped');
  });

  it('deja la marca puesta para todas las pantallas', async () => {
    stubBase([HUMAYA]);
    const donde = await resolverHotel('experience.stayhumaya.com', '/app');
    aplicarHotel(donde.hotel);

    expect(MARCA.hotel).toBe('HUMAYA');
    expect(MARCA.correo).toBe('reservations@stayhumaya.com');
  });
});

describe('el dominio compartido del producto', () => {
  it('saca el hotel de la ruta y se lo pone de prefijo a todo', async () => {
    stubBase(
      [COMPARTIDO_HUESPED],
      [
        {
          negocio_id: 'otro-id',
          codigo: 'bike-and-bed',
          marca_experiencia: 'Bike & Bed Experience',
          marca_hotel: 'Bike & Bed',
          correo: 'hola@bikeandbed.test',
          esDemo: false,
          portadaTitulo: null,
          portadaBajada: null,
        },
      ],
    );

    const donde = await resolverHotel('guestexp.liderax10.com', '/bike-and-bed/app');
    expect(donde.hotel?.codigo).toBe('bike-and-bed');
    expect(donde.base).toBe('/bike-and-bed');
    expect(donde.compartido).toBe(true);
  });

  it('sin hotel en la ruta se queda sin hotel, no agarra uno cualquiera', async () => {
    // Mostrarle la marca de otro hotel a un huésped sería peor que no
    // mostrarle ninguna.
    stubBase([COMPARTIDO_HUESPED]);
    const donde = await resolverHotel('guestexp.liderax10.com', '/');

    expect(donde.hotel).toBeNull();
    expect(donde.base).toBe('');
  });

  it('un código que no existe tampoco agarra uno cualquiera', async () => {
    stubBase([COMPARTIDO_HUESPED], []);
    const donde = await resolverHotel('guestexp.liderax10.com', '/no-existe/app');

    expect(donde.hotel).toBeNull();
  });
});

/**
 * El codigo del hotel en la ruta de RECEPCION.
 *
 * Tony, 24 de noviembre de 2026: «para mi esta mal. No deberia ser esta:
 * hotelexp.liderax10.com/bikeandbed para staff». Hasta ese momento, de este
 * lado el hotel lo decia solo la cuenta y ninguna pantalla de recepcion tenia
 * direccion propia.
 */
describe('el dominio compartido de recepción', () => {
  const COMPARTIDO_PERSONAL = {
    dominio: 'hotelexp.liderax10.com',
    lado: 'personal',
    compartido: true,
    negocio_id: null,
    codigo: null,
    marca_experiencia: null,
    marca_hotel: null,
    correo: null,
    esDemo: false,
    portadaTitulo: null,
    portadaBajada: null,
  };

  const BIKE = {
    negocio_id: 'otro-id',
    codigo: 'bikeandbed',
    marca_experiencia: 'Bike & Bed Experience',
    marca_hotel: 'Bike & Bed',
    correo: 'hola@bikeandbed.test',
    esDemo: false,
    portadaTitulo: null,
    portadaBajada: null,
  };

  it('le pone el código de prefijo a las rutas', async () => {
    stubBase([COMPARTIDO_PERSONAL], [BIKE]);
    const donde = await resolverHotel('hotelexp.liderax10.com', '/bikeandbed/staff');

    expect(donde.base).toBe('/bikeandbed');
    expect(donde.lado).toBe('personal');
  });

  /**
   * ESTA ES LA PRUEBA QUE IMPORTA.
   *
   * El codigo en la ruta da la marca y el prefijo, NO el hotel resuelto. Si
   * saliera confirmado, `main.tsx` llamaria a `aplicarHotel()`, la Puerta se
   * lo creeria sin preguntarle a la base —`if (negocioActual()) return`— y
   * cualquiera abriria el hotel de al lado escribiendo su codigo en la barra.
   */
  it('NO lo da por confirmado: eso lo decide la cuenta, no la barra de direcciones', async () => {
    stubBase([COMPARTIDO_PERSONAL], [BIKE]);
    const donde = await resolverHotel('hotelexp.liderax10.com', '/bikeandbed/staff');

    expect(donde.hotelConfirmado).toBe(false);
  });

  /**
   * Y aun asi la marca sale, porque la puerta de Bike & Bed no puede decir
   * «Humaya». Comprobado en vivo el 24 de noviembre de 2026: decia eso.
   */
  it('sí da la marca, para que la puerta no muestre el nombre de otro hotel', async () => {
    stubBase([COMPARTIDO_PERSONAL], [BIKE]);
    const donde = await resolverHotel('hotelexp.liderax10.com', '/bikeandbed/staff');

    expect(donde.hotel?.marcaHotel).toBe('Bike & Bed');
    expect(donde.hotel?.codigo).toBe('bikeandbed');
  });

  it('del lado del huésped sí queda confirmado: ahí no hay cuenta que preguntar', async () => {
    stubBase([COMPARTIDO_HUESPED], [BIKE]);
    const donde = await resolverHotel('guestexp.liderax10.com', '/bikeandbed/app');

    expect(donde.hotelConfirmado).toBe(true);
  });

  it('la raíz del hotel también lleva prefijo: ahí vive su landing', async () => {
    stubBase([COMPARTIDO_PERSONAL], [BIKE]);
    const donde = await resolverHotel('hotelexp.liderax10.com', '/bikeandbed');

    expect(donde.base).toBe('/bikeandbed');
  });

  it('sin código sigue funcionando: el hotel lo dice la cuenta', async () => {
    stubBase([COMPARTIDO_PERSONAL]);
    const donde = await resolverHotel('hotelexp.liderax10.com', '/staff');

    expect(donde.base).toBe('');
    expect(donde.hotel).toBeNull();
  });

  /**
   * La garantia, probada donde de verdad vive: `negocio`.
   *
   * `aplicarMarcaDelHotel()` pone el nombre y los colores y NO pone
   * `negocio`, que es lo que `elNegocio()` devuelve y lo que la Puerta mira
   * para saber si todavia tiene que preguntarle a la base de quien es esta
   * pantalla. Esto es lo que hace que la marca en la puerta sea cosmetica y
   * el codigo de la barra no sea un permiso.
   */
  it('poner la marca NO resuelve de quién son los datos', async () => {
    const { aplicarMarcaDelHotel, negocioActual, MARCA: M } = await import('@/marca');

    aplicarMarcaDelHotel({
      negocioId: 'n-bike',
      codigo: 'bikeandbed',
      marcaExperiencia: 'Bike & Bed Experience',
      marcaHotel: 'Bike & Bed',
      correo: 'hola@bikeandbed.test',
      tema: null,
      esDemo: false,
      portadaTitulo: null,
      portadaBajada: null,
    });

    expect(M.hotel).toBe('Bike & Bed');
    // EL PUNTO: sigue sin saber de quién son los datos.
    expect(negocioActual()).toBeNull();
  });

  it('un código que no es de nadie no se vuelve prefijo ni marca', async () => {
    // Sin esto, `/notexiste/staff` montaria toda la recepcion bajo un
    // prefijo inventado en vez de caer en «Esta dirección no existe».
    stubBase([COMPARTIDO_PERSONAL], []);
    const donde = await resolverHotel('hotelexp.liderax10.com', '/notexiste/staff');

    expect(donde.base).toBe('');
    expect(donde.hotel).toBeNull();
  });
});

describe('los textos siguen al hotel', () => {
  it('un texto que lee la marca NO se queda con la del hotel anterior', async () => {
    // El fallo que esto agarra: los objetos de `copy.ts` se construyen al
    // CARGAR el modulo, y el hotel se resuelve despues. Con un valor normal
    // en vez de un getter, el texto se congela. Comprobado en vivo el 20 de
    // noviembre de 2026: /demo/entrada decia «HUMAYA EXPERIENCE».
    const { entradaCopy } = await import('@/features/entrada/copy');

    aplicarHotel({
      negocioId: 'n-demo',
      codigo: 'demo',
      marcaExperiencia: 'Demo Experience',
      marcaHotel: 'HOTEL DEMO',
      correo: 'demo@liderax10.com',
      esDemo: false,
      portadaTitulo: null,
      portadaBajada: null,
      tema: null,
    });
    expect(entradaCopy.es.eyebrow).toBe('Demo Experience');
    expect(entradaCopy.en.contactEmail).toBe('demo@liderax10.com');

    aplicarHotel({
      negocioId: 'n-humaya',
      codigo: 'humaya',
      marcaExperiencia: 'HUMAYA Experience',
      marcaHotel: 'HUMAYA',
      correo: 'reservations@stayhumaya.com',
      esDemo: false,
      portadaTitulo: null,
      portadaBajada: null,
      tema: null,
    });
    expect(entradaCopy.es.eyebrow).toBe('HUMAYA Experience');
  });

  /**
   * Los colores son de la misma clase que los textos: si se quedaran puestos
   * al cambiar de hotel, un huesped veria la paleta de OTRA marca. Y a
   * diferencia de un texto, una paleta vieja no se nota como un error: se ve
   * como una decision de diseño.
   */
  it('la paleta tampoco se queda con la del hotel anterior', async () => {
    aplicarHotel({
      negocioId: 'n-demo',
      codigo: 'demo',
      marcaExperiencia: 'Demo Experience',
      marcaHotel: 'HOTEL DEMO',
      correo: 'demo@liderax10.com',
      esDemo: false,
      portadaTitulo: null,
      portadaBajada: null,
      tema: { acento: '#4a9d7f' },
    });
    expect(document.getElementById('humaya-tema')?.textContent).toContain('#4a9d7f');

    aplicarHotel({
      negocioId: 'n-humaya',
      codigo: 'humaya',
      marcaExperiencia: 'HUMAYA Experience',
      marcaHotel: 'HUMAYA',
      correo: 'reservations@stayhumaya.com',
      esDemo: false,
      portadaTitulo: null,
      portadaBajada: null,
      tema: null,
    });
    // Sin tema propio no queda nada puesto: vale la paleta de `tokens.css`.
    expect(document.getElementById('humaya-tema')).toBeNull();
  });
});

describe('cuando la base no contesta', () => {
  it('no deja al huésped mirando una pantalla en blanco sin fin', async () => {
    // Esta consulta corre ANTES de pintar nada. Sin tope, una base colgada
    // cuelga la app entera.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_listo, falla) => {
            init?.signal?.addEventListener('abort', () => falla(new Error('abortado')));
          }),
      ),
    );
    vi.useFakeTimers();

    const promesa = resolverHotel('experience.stayhumaya.com', '/app');
    await vi.advanceTimersByTimeAsync(4000);
    const donde = await promesa;
    vi.useRealTimers();

    expect(donde.lado).toBe('huesped');
    expect(donde.hotel).toBeNull();
  });

  it('la app abre igual, deduciendo el lado del dominio', async () => {
    // No abrir porque no se pudo preguntar la marca sería mucho peor que
    // abrir con la marca por defecto.
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));

    const donde = await resolverHotel('staff.stayhumaya.com', '/staff');
    expect(donde.lado).toBe('personal');
    expect(donde.hotel).toBeNull();
    expect(donde.base).toBe('');
  });

  it('y la marca cae en la de respaldo, no en vacío', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));
    const donde = await resolverHotel('experience.stayhumaya.com', '/app');
    aplicarHotel(donde.hotel);

    expect(MARCA.hotel).toBe('HUMAYA');
    expect(MARCA.experiencia).toBe('HUMAYA Experience');
  });
});
