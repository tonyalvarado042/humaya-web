import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const MOTIVOS = [
  'solo_plataforma',
  'property_id_invalido',
  'property_id_de_otro_hotel',
  'hotel_no_existe',
  'propiedad_no_registrada',
  'llave_vacia',
  'llave_muy_corta',
] as const;

/** Un cliente de mentira que devuelve el error que le pidan. */
function conError(mensaje: string | null) {
  vi.resetModules();
  vi.doMock('./sesion', () => ({
    cliente: () =>
      Promise.resolve({
        rpc: () => Promise.resolve({ data: null, error: mensaje ? { message: mensaje } : null }),
      }),
  }));
  return import('./cloudbeds');
}

describe('los motivos que devuelve la base', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it.each(MOTIVOS)('«%s» llega como ese motivo y no como desconocido', async (motivo) => {
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
    const { guardarLlave } = await conError('se cayó la red submarina');
    await guardarLlave('283417337204929', 'una-llave-bien-larga-de-prueba').catch((e) => {
      expect((e as { motivo: string }).motivo).toBe('desconocido');
    });
  });

  it('todos los motivos tienen texto en los dos idiomas', () => {
    // Un motivo sin texto sale como `undefined` en la pantalla. Esto lo
    // agarra al agregar uno nuevo y olvidar el copy.
    for (const motivo of [...MOTIVOS, 'desconocido'] as const) {
      expect(cloudbedsCopy.es.alFallar[motivo]).toBeTruthy();
      expect(cloudbedsCopy.en.alFallar[motivo]).toBeTruthy();
    }
  });
});

describe('lo que la pantalla recibe de la base', () => {
  it('un hotel sin propiedad llega con propertyId en null, no en "null"', async () => {
    // Pasó con otras pantallas: `String(null)` deja el texto «null», que se
    // pinta igual que un número y hace creer que el hotel está conectado.
    vi.resetModules();
    vi.doMock('./sesion', () => ({
      cliente: () =>
        Promise.resolve({
          rpc: () =>
            Promise.resolve({
              data: [
                {
                  negocio_id: 'abc',
                  codigo: 'bikeandbed',
                  nombre: 'Bike & Bed by Humaya',
                  origen_reservas: 'cloudbeds',
                  property_id: null,
                  llave_propia: false,
                  llave_propia_desde: null,
                  llave_general: true,
                  reservas: 0,
                },
              ],
              error: null,
            }),
        }),
    }));
    const { estadoCloudbeds } = await import('./cloudbeds');

    const [hotel] = await estadoCloudbeds();

    expect(hotel?.propertyId).toBeNull();
    expect(hotel?.llavePropia).toBe(false);
    expect(hotel?.llaveGeneral).toBe(true);
  });
});
