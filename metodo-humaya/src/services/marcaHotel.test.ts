import { beforeEach, describe, expect, it } from 'vitest';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { getMarcaDelHotel, guardarMarcaDelHotel, temaLimpio } from './marcaHotel';

/**
 * Lo que la pantalla no puede probar: que una escritura que la base RECHAZA
 * no se vea como un éxito.
 *
 * ── POR QUÉ ACÁ Y NO EN MarcaPage.test.tsx ──────────────────────────────
 * Porque con el Supabase de mentira la lectura y la escritura usan el mismo
 * filtro: no hay forma de montar una pantalla donde leer funcione y escribir
 * rebote. Pero el caso sí existe en producción —RLS deja LEER a todo
 * recepción y escribir solo al rol `administrador`— y es justo el que
 * convierte un «guardado» en una mentira.
 *
 * Se descubrió el hueco quitando a propósito la comprobación del servicio y
 * viendo que los once tests de la pantalla seguían en verde.
 */

function filaDe(negocioId: string, tema: unknown = {}) {
  return {
    negocio_id: negocioId,
    marca_experiencia: 'HUMAYA Experience',
    marca_hotel: 'HUMAYA',
    correo: 'reservations@stayhumaya.com',
    tema,
  };
}

beforeEach(() => {
  supabaseStub.tablas.humaya_hoteles = [filaDe(NEGOCIO_DE_PRUEBA)];
});

describe('leer la marca', () => {
  it('trae los nombres y el tema del hotel de esta pantalla', async () => {
    supabaseStub.tablas.humaya_hoteles = [filaDe(NEGOCIO_DE_PRUEBA, { acento: '#4a9d7f' })];

    const marca = await getMarcaDelHotel();

    expect(marca.marcaHotel).toBe('HUMAYA');
    expect(marca.tema).toEqual({ acento: '#4a9d7f' });
  });

  /** Un tema vacío es «usá la paleta de siempre», y eso es null, no `{}`. */
  it('un tema vacío es null y no un objeto vacío', async () => {
    const marca = await getMarcaDelHotel();
    expect(marca.tema).toBeNull();
  });

  /**
   * No se devuelve una marca inventada: esta pantalla existe para editar la
   * del hotel, y si no hay hotel no hay nada que editar.
   */
  it('sin fila falla en vez de devolver una marca por defecto', async () => {
    supabaseStub.tablas.humaya_hoteles = [filaDe('otro-hotel')];

    await expect(getMarcaDelHotel()).rejects.toThrow('marca_sin_hotel');
  });
});

describe('guardar la marca', () => {
  it('escribe los nombres y el tema', async () => {
    await guardarMarcaDelHotel({ marcaHotel: 'BIKE & BED', tema: { acento: '#4a9d7f' } });

    const fila = supabaseStub.tablas.humaya_hoteles[0];
    expect(fila.marca_hotel).toBe('BIKE & BED');
    expect(fila.tema).toEqual({ acento: '#4a9d7f' });
  });

  it('un campo que no se manda no se pisa', async () => {
    await guardarMarcaDelHotel({ marcaHotel: 'BIKE & BED' });

    const fila = supabaseStub.tablas.humaya_hoteles[0];
    expect(fila.marca_experiencia).toBe('HUMAYA Experience');
    expect(fila.tema).toEqual({});
  });

  /**
   * EL TEST QUE IMPORTA. Si la fila no es de este hotel, el update acotado no
   * toca nada y PostgREST devuelve éxito con cero filas. Sin la comprobación,
   * la pantalla diría «Guardado. Ya lo está viendo el huésped» y no habría
   * guardado nada.
   */
  it('si no cambió ninguna fila, falla en vez de decir que guardó', async () => {
    supabaseStub.tablas.humaya_hoteles = [filaDe('otro-hotel')];

    await expect(guardarMarcaDelHotel({ marcaHotel: 'AJENO' })).rejects.toThrow(
      'marca_sin_permiso',
    );
    // Y no le tocó nada al otro hotel.
    expect(supabaseStub.tablas.humaya_hoteles[0].marca_hotel).toBe('HUMAYA');
  });

  it('la columna no queda en null: un tema vacío se guarda como {}', async () => {
    await guardarMarcaDelHotel({ tema: null });
    expect(supabaseStub.tablas.humaya_hoteles[0].tema).toEqual({});
  });
});

describe('temaLimpio', () => {
  it('saca los campos vacíos', () => {
    expect(temaLimpio({ acento: '#4a9d7f', acentoStaff: '', fuenteTitulos: '   ' })).toEqual({
      acento: '#4a9d7f',
    });
  });

  it('recorta los espacios de lo que sí hay', () => {
    expect(temaLimpio({ fuenteTitulos: '  Playfair Display  ' })).toEqual({
      fuenteTitulos: 'Playfair Display',
    });
  });

  /** Un `false` guardado es ruido: no marcado es exactamente no marcado. */
  it('un interruptor apagado no se guarda', () => {
    expect(temaLimpio({ fuenteGoogle: false })).toBeNull();
    expect(temaLimpio({ fuenteGoogle: true })).toEqual({ fuenteGoogle: true });
  });

  it('un tema que queda sin nada es null', () => {
    expect(temaLimpio({ acento: '' })).toBeNull();
    expect(temaLimpio(null)).toBeNull();
  });
});
