import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cloudbedsCopy } from '@/features/staff/admin/copyCloudbeds';

/**
 * Lo que la base dice cuando algo sale mal tiene que llegarle a la persona
 * en palabras, no como `property_id_de_otro_hotel`.
 *
 * ── POR QUÉ ESTO ES LO QUE SE PRUEBA ───────────────────────────────────
 * Porque el permiso ya lo prueba la base —`humaya_soy_plataforma()` es
 * `security definer` y se verificó contra ella: sin cuenta, `estado()`
 * devuelve cero filas y `conectar` levanta `solo_plataforma`—, así que
 * repetirlo acá con un cliente falso no probaría nada real.
 *
 * Lo que SÍ puede romperse sin que nadie se entere es la traducción: si un
 * motivo nuevo no está en la lista, cae en «no se pudo, probá de nuevo» y
 * la persona se queda sin saber que pegó la URL entera en vez del número.
 * Eso falla callado, y por eso se fija acá.
 */

/** Los que llegan dentro del mensaje de Postgres. */
const DE_LA_BASE = [
  'solo_plataforma',
  'property_id_invalido',
  'property_id_de_otro_hotel',
  'hotel_no_existe',
  'propiedad_no_registrada',
  'llave_vacia',
  'llave_muy_corta',
] as const;

/** Los que devuelve la función del servidor, por nombre exacto. */
const DEL_SERVIDOR = [
  'sin_llave',
  'llave_rechazada',
  'llave_de_otro_hotel',
  'propiedad_no_registrada',
  'property_id_invalido',
  'solo_plataforma',
] as const;

/** Un cliente de mentira que devuelve el error que le pidan. */
function conError(mensaje: string | null) {
  vi.resetModules();
  vi.doMock('./sesion', () => ({
    cliente: () =>
      Promise.resolve({
        rpc: () => Promise.resolve({ data: null, error: mensaje ? { message: mensaje } : null }),
      }),
    cabeceraDeRecepcion: () => Promise.resolve({}),
  }));
  return import('./cloudbeds');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('los motivos que devuelve la base', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it.each(DE_LA_BASE)('«%s» llega como ese motivo y no como desconocido', async (motivo) => {
    // Así los manda Postgres de verdad, con prefijo y todo.
    const { conectarHotel, ErrorCloudbeds } = await conError(
      `Postgres error: ${motivo} (PL/pgSQL function)`,
    );

    await expect(conectarHotel('un-hotel', '283417337204929')).rejects.toThrow(ErrorCloudbeds);
    await conectarHotel('un-hotel', '283417337204929').catch((e) => {
      expect((e as { motivo: string }).motivo).toBe(motivo);
    });
  });

  it('uno que nadie previó no se traga: cae en desconocido', async () => {
    const { conectarHotel } = await conError('se cayó la red submarina');
    await conectarHotel('un-hotel', '283417337204929').catch((e) => {
      expect((e as { motivo: string }).motivo).toBe('desconocido');
    });
  });

  it('todos los motivos tienen texto en los dos idiomas', () => {
    // Un motivo sin texto sale como `undefined` en la pantalla. Esto lo
    // agarra al agregar uno nuevo y olvidar el copy.
    for (const motivo of [...DE_LA_BASE, ...DEL_SERVIDOR, 'no_contesto', 'desconocido'] as const) {
      expect(cloudbedsCopy.es.alFallar[motivo]).toBeTruthy();
      expect(cloudbedsCopy.en.alFallar[motivo]).toBeTruthy();
    }
  });
});

/**
 * Un cliente de mentira que acota por hotel, igual que la base.
 *
 * `humaya_cloudbeds_estado(p_negocio)` devuelve una fila o ninguna. El falso
 * filtra de verdad, porque lo que se quiere fijar es que el servicio DIGA de
 * qué hotel pregunta: uno que no mande el hotel sacaría la misma fila de un
 * mock que devuelve siempre lo mismo.
 */
function conLaBase(filas: Record<string, unknown>[], negocio = 'n-bikeandbed') {
  const pedidos: Record<string, unknown>[] = [];
  vi.resetModules();
  vi.doMock('./negocio', () => ({ elNegocio: () => negocio }));
  vi.doMock('./sesion', () => ({
    cliente: () =>
      Promise.resolve({
        rpc: (_n: string, args: Record<string, unknown>) => {
          pedidos.push(args);
          return Promise.resolve({
            data: filas.filter((f) => f.negocio_id === args.p_negocio),
            error: null,
          });
        },
      }),
    cabeceraDeRecepcion: () => Promise.resolve({}),
  }));
  return { pedidos, modulo: import('./cloudbeds') };
}

describe('lo que la pantalla recibe de la base', () => {
  const BIKE = {
    negocio_id: 'n-bikeandbed',
    codigo: 'bikeandbed',
    nombre: 'Bike & Bed by Humaya',
    origen_reservas: 'cloudbeds',
    property_id: null,
    llave_propia: false,
    llave_propia_desde: null,
    reservas: 0,
  };

  const OTRO = {
    ...BIKE,
    negocio_id: 'n-humaya',
    codigo: 'humaya',
    nombre: 'HUMAYA',
    reservas: 68,
  };

  it('un hotel sin propiedad llega con propertyId en null, no en "null"', async () => {
    // Pasó con otras pantallas: `String(null)` deja el texto «null», que se
    // pinta igual que un número y hace creer que el hotel está conectado.
    const { modulo } = conLaBase([BIKE]);
    const { estadoCloudbeds } = await modulo;

    const hotel = await estadoCloudbeds();

    expect(hotel?.propertyId).toBeNull();
    expect(hotel?.llavePropia).toBe(false);
  });

  it('le pide a la base el hotel en el que se está, y devuelve ese', async () => {
    // Tony, 26 de noviembre de 2026: «estoy en bike and bed y sale Humaya».
    // La función ya no devuelve todos los hoteles; hay que decirle cuál.
    const { pedidos, modulo } = conLaBase([OTRO, BIKE]);
    const { estadoCloudbeds } = await modulo;

    const hotel = await estadoCloudbeds();

    expect(pedidos).toEqual([{ p_negocio: 'n-bikeandbed' }]);
    expect(hotel?.codigo).toBe('bikeandbed');
  });

  it('sin ficha devuelve null, que no es lo mismo que una ficha vacía', async () => {
    // Pasa con una cuenta que no es de plataforma. La pantalla lo dice; si
    // acá saliera un objeto con todo en blanco, pintaría una ficha de un
    // hotel sin nombre y nadie entendería qué pasó.
    const { modulo } = conLaBase([OTRO]);
    const { estadoCloudbeds } = await modulo;

    expect(await estadoCloudbeds()).toBeNull();
  });
});

/** Un cliente cuyo `rpc` siempre dice que sí: la llave se guardó. */
function conRpcBueno() {
  vi.resetModules();
  vi.doMock('./sesion', () => ({
    cliente: () => Promise.resolve({ rpc: () => Promise.resolve({ data: null, error: null }) }),
    cabeceraDeRecepcion: () => Promise.resolve({}),
  }));
  return import('./cloudbeds');
}

function respuesta(status: number, cuerpo: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  });
}

describe('guardar la llave deja el hotel conectado', () => {
  it('trae las reservas sin que nadie apriete otro botón', async () => {
    // Tony, 26 de noviembre de 2026: «se supone que al pegar la llave
    // automáticamente se tiene que hacer eso, ¿o me equivoco?». No se
    // equivocaba: esto fija que guardar la llave dispara la sincronización.
    // La URL se guarda al vuelo en vez de sacarla de `mock.calls`: tipar ese
    // arreglo obliga a declarar parametros que el mock no usa, y eso lo
    // rechaza el linter.
    const pedidas: string[] = [];
    const fetchFalso = vi.fn((url: unknown) => {
      pedidas.push(String(url));
      return respuesta(200, {
        ok: true,
        property_id: '294717227995328',
        llave: { ok: true, alcanza: [{ property_id: '294717227995328', nombre: 'Bike And Bed' }] },
        webhooks: { ok: true, registrados: ['reservation/created'], faltan: [] },
        reservas: { encontradas: 34, guardadas: 34, sin_correo: 2, fallaron: 0, hay_mas: false },
      });
    });
    vi.stubGlobal('fetch', fetchFalso);

    const { guardarLlave } = await conRpcBueno();
    const s = await guardarLlave('294717227995328', 'cbat_una-llave-bien-larga-de-prueba');

    expect(fetchFalso).toHaveBeenCalledTimes(1);
    expect(pedidas[0]).toContain('/cloudbeds-conectar');
    expect(s.reservas.guardadas).toBe(34);
    expect(s.webhooks.ok).toBe(true);
    expect(s.alcanza[0]?.nombre).toBe('Bike And Bed');
  });

  it('si Cloudbeds falla después de guardar, avisa que la llave YA está', async () => {
    // Es la diferencia que importa: Cloudbeds enseña la llave una sola vez.
    // Decirle a Tony «no se pudo» a secas lo manda a buscar algo que ya no
    // existe, cuando lo único que hacía falta era reintentar.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => respuesta(400, { error: 'llave_rechazada' })),
    );

    const { guardarLlave } = await conRpcBueno();

    await guardarLlave('294717227995328', 'cbat_una-llave-bien-larga-de-prueba').then(
      () => expect.unreachable('tenía que fallar'),
      (e) => {
        expect((e as { motivo: string }).motivo).toBe('llave_rechazada');
        expect((e as { llaveGuardada: boolean }).llaveGuardada).toBe(true);
      },
    );
  });

  it('si la llave NI se guardó, no dice que está guardada', async () => {
    const { guardarLlave } = await conError('Postgres error: llave_muy_corta');

    await guardarLlave('294717227995328', 'corta').then(
      () => expect.unreachable('tenía que fallar'),
      (e) => {
        expect((e as { motivo: string }).motivo).toBe('llave_muy_corta');
        expect((e as { llaveGuardada: boolean }).llaveGuardada).toBe(false);
      },
    );
  });

  it.each(DEL_SERVIDOR)('el motivo «%s» del servidor llega entero', async (motivo) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => respuesta(400, { error: motivo })),
    );

    const { sincronizarHotel } = await conRpcBueno();

    await sincronizarHotel('294717227995328').catch((e) => {
      expect((e as { motivo: string }).motivo).toBe(motivo);
    });
  });

  it('un error que el servidor no nombró no se inventa: es no_contesto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => respuesta(500, { error: 'boom_interno' })),
    );

    const { sincronizarHotel } = await conRpcBueno();

    await sincronizarHotel('294717227995328').catch((e) => {
      expect((e as { motivo: string }).motivo).toBe('no_contesto');
    });
  });
});
