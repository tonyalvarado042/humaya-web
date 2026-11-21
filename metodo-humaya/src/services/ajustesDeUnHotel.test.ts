import { beforeEach, describe, expect, it } from 'vitest';
import { getAjustes, setDemoVisible } from './ajustes';
import { guardarAjustesBot } from './conciergeBase';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';

/**
 * Los interruptores de Admin tocan UN hotel: el de la pantalla.
 *
 * ── EL FALLO QUE ESTO AGARRA, Y COMO SE ENCONTRO ────────────────────────
 * Probando /staff/admin en el servidor local contra el hotel demo, el 21 de
 * noviembre de 2026, aprete «Encender el bot». El bot del demo siguio
 * apagado... y en la base, el ajuste de HUMAYA quedo escrito con la marca de
 * tiempo de ese clic.
 *
 * Los dos interruptores —el del bot y el de los datos de ejemplo— leian
 * TODAS las filas de `humaya_propiedades` y escribian el ajuste en TODOS los
 * negocios que encontraran. Desde la pantalla de un hotel se le encendia y
 * apagaba el Concierge a otro.
 *
 * Con un solo hotel esto no se podia ver: escribir «en todos» y escribir «en
 * el mio» daban exactamente el mismo resultado.
 *
 * Estas pruebas siembran filas de OTRO hotel a proposito. Sin eso, pasarian
 * igual con el filtro quitado.
 */

const OTRO = 'otro-hotel';

function ajuste(negocio: string, clave: string, valor: unknown) {
  return { negocio_id: negocio, clave, valor, actualizado_en: '2026-01-01T00:00:00.000Z' };
}

beforeEach(() => {
  supabaseStub.tablas.humaya_propiedades = [
    { negocio_id: NEGOCIO_DE_PRUEBA },
    { negocio_id: OTRO },
  ];
});

describe('los datos de ejemplo', () => {
  it('se leen los de este hotel, no los del vecino', async () => {
    supabaseStub.tablas.humaya_ajustes = [
      ajuste(OTRO, 'demo_visible', false),
      ajuste(NEGOCIO_DE_PRUEBA, 'demo_visible', true),
    ];

    expect(await getAjustes()).toEqual({ demoVisible: true });
  });

  it('el ajuste de otro hotel no decide acá', async () => {
    supabaseStub.tablas.humaya_ajustes = [ajuste(OTRO, 'demo_visible', false)];

    // Sin fila propia vale el valor de siempre, no el del vecino.
    expect(await getAjustes()).toEqual({ demoVisible: true });
  });

  it('apagarlo acá no se lo apaga al vecino', async () => {
    supabaseStub.tablas.humaya_ajustes = [
      ajuste(OTRO, 'demo_visible', true),
      ajuste(NEGOCIO_DE_PRUEBA, 'demo_visible', true),
    ];

    await setDemoVisible(false);

    const filas = supabaseStub.tablas.humaya_ajustes;
    const mio = filas.find((f) => f.negocio_id === NEGOCIO_DE_PRUEBA && f.clave === 'demo_visible');
    const suyo = filas.find((f) => f.negocio_id === OTRO && f.clave === 'demo_visible');

    expect(mio?.valor).toBe(false);
    expect(suyo?.valor).toBe(true);
  });
});

describe('el interruptor del bot', () => {
  /** EL QUE IMPORTA: el clic que le encendio el Concierge a otro hotel. */
  it('encenderlo acá no se lo enciende al vecino', async () => {
    supabaseStub.tablas.humaya_ajustes = [
      ajuste(OTRO, 'bot_encendido', false),
      ajuste(NEGOCIO_DE_PRUEBA, 'bot_encendido', false),
    ];

    await guardarAjustesBot({ encendido: true });

    const filas = supabaseStub.tablas.humaya_ajustes;
    const mio = filas.find(
      (f) => f.negocio_id === NEGOCIO_DE_PRUEBA && f.clave === 'bot_encendido',
    );
    const suyo = filas.find((f) => f.negocio_id === OTRO && f.clave === 'bot_encendido');

    expect(mio?.valor).toBe(true);
    expect(suyo?.valor).toBe(false);
  });

  it('las tarifas también son de un solo hotel', async () => {
    supabaseStub.tablas.humaya_ajustes = [ajuste(OTRO, 'bot_precio_entrada', 1)];

    await guardarAjustesBot({ precioEntrada: 99 });

    const filas = supabaseStub.tablas.humaya_ajustes;
    expect(filas.find((f) => f.negocio_id === OTRO)?.valor).toBe(1);
    expect(filas.find((f) => f.negocio_id === NEGOCIO_DE_PRUEBA)?.valor).toBe(99);
  });

  /** Un `undefined` no escribe: guardar el modelo no debe tocar el encendido. */
  it('solo escribe lo que se le manda', async () => {
    supabaseStub.tablas.humaya_ajustes = [ajuste(NEGOCIO_DE_PRUEBA, 'bot_encendido', true)];

    await guardarAjustesBot({ modelo: 'claude-haiku-5-5' });

    const filas = supabaseStub.tablas.humaya_ajustes;
    expect(filas.find((f) => f.clave === 'bot_encendido')?.valor).toBe(true);
    expect(filas.find((f) => f.clave === 'bot_modelo')?.valor).toBe('claude-haiku-5-5');
  });
});
