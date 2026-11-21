import { beforeEach, describe, expect, it } from 'vitest';
import { crearRespuesta, crearTema } from './conciergeBase';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';

/**
 * Lo que se agrega entra detrás de lo MÍO, no detrás de lo del vecino.
 *
 * ── EL FALLO QUE ESTO AGARRA ────────────────────────────────────────────
 * Encontrado el 21 de noviembre de 2026 leyendo los caminos de escritura del
 * Concierge, con el hotel demo abierto en Admin. Para saber dónde poner lo
 * nuevo, `crearTema` y `crearRespuesta` buscaban el `orden` más alto:
 *
 *     .select('orden').order('orden', { ascending: false }).limit(1)
 *
 * Sin filtro de hotel. El hotel demo no tenía respuestas guardadas y HUMAYA
 * tenía seis: la primera respuesta del demo nacía con el orden de la última
 * de HUMAYA. No se filtra contenido, pero se lee la fila de otro hotel y el
 * número sale mal — y «mal» acá significa que el orden que el administrador
 * ve en su pantalla no es el que eligió.
 *
 * ── POR QUÉ NO LO VIO NINGUNA PRUEBA ────────────────────────────────────
 * Porque el cliente falso no tenía `insert` ni `delete`: estos dos caminos
 * no se podían probar y nunca se probaron. Se le agregaron para esto.
 */

const OTRO = 'otro-hotel';

beforeEach(() => {
  supabaseStub.tablas.humaya_concierge_base = [
    { id: 'b-del-vecino', negocio_id: OTRO, tema: 'Lo del vecino', contenido: '…', orden: 500 },
    { id: 'b-mio', negocio_id: NEGOCIO_DE_PRUEBA, tema: 'Lo mío', contenido: '…', orden: 10 },
  ];
  supabaseStub.tablas.humaya_concierge_respuestas = [
    { id: 'r-del-vecino', negocio_id: OTRO, titulo: 'Del vecino', texto: '…', orden: 900 },
  ];
});

describe('el orden de lo que se agrega al Concierge', () => {
  it('un tema nuevo sigue a los míos', async () => {
    const tema = await crearTema('Horario del spa', 'De 9 a 5.');

    // Con el filtro quitado serían 510: el 500 es de otro hotel.
    expect(tema.orden).toBe(20);
  });

  it('una respuesta nueva no hereda el orden del vecino', async () => {
    await crearRespuesta('Buenas noches', 'Gracias por escribir.');

    const mia = supabaseStub.tablas.humaya_concierge_respuestas.find(
      (fila) => fila.titulo === 'Buenas noches',
    );
    // El demo no tenía ninguna: la primera arranca en 10, no en 910.
    expect(mia?.orden).toBe(10);
    expect(mia?.negocio_id).toBe(NEGOCIO_DE_PRUEBA);
  });

  it('un tema nuevo nace apagado y con su hotel', async () => {
    await crearTema('Horario del spa', 'De 9 a 5.');

    const nuevo = supabaseStub.tablas.humaya_concierge_base.find(
      (fila) => fila.tema === 'Horario del spa',
    );
    // Apagado a propósito: un texto que nadie leyó no puede salir por boca
    // del hotel.
    expect(nuevo?.activo).toBe(false);
    expect(nuevo?.negocio_id).toBe(NEGOCIO_DE_PRUEBA);
  });
});
