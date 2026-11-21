import { beforeEach, describe, expect, it } from 'vitest';
import { borrarNota, crearNota, getNotas } from './conciergeStaff';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';

/**
 * Las notas internas son de UN hotel: el de la pantalla.
 *
 * ── EL FALLO QUE ESTO AGARRA, Y CÓMO SE ENCONTRÓ ────────────────────────
 * Abriendo `/staff/concierge/s-mendez-rojas` como administrador el 21 de
 * noviembre de 2026, contra el hotel demo. `getNotas` pedía las notas
 * filtrando SOLO por `stay_id`:
 *
 *     .select('id,texto,autor,creado_en').eq('stay_id', stayId)
 *
 * Los `stay_id` todavía son los mismos datos de ejemplo para todos los
 * hoteles, así que son los mismos en los dos. Resultado: recepción de un
 * hotel leía las notas internas que el equipo de otro escribió sobre ese
 * huésped. RLS no lo frenaba: las políticas piden un rol del CRM, no un
 * hotel.
 *
 * El propio archivo presume de aislamiento —«una nota interna que se filtre
 * al huésped no se puede deshacer»— y lo tenía del lado del huésped. Entre
 * hoteles, no.
 *
 * Hoy la tabla está vacía, así que no se filtró nada de nadie. Se arregló
 * antes de que hubiera qué filtrar.
 *
 * ── POR QUÉ ESTAS PRUEBAS SIEMBRAN OTRO HOTEL ───────────────────────────
 * Porque con las filas de un solo hotel, «traer las de todos» y «traer las
 * mías» dan exactamente el mismo resultado, y la prueba pasaría con el
 * filtro quitado.
 */

const OTRO = 'otro-hotel';
const ESTADIA = 's-mendez-rojas';

function nota(negocio: string, id: string, texto: string) {
  return {
    id,
    negocio_id: negocio,
    stay_id: ESTADIA,
    texto,
    autor: 'Recepción',
    autor_id: 'u-1',
    creado_en: '2026-11-20T10:00:00.000Z',
  };
}

beforeEach(() => {
  supabaseStub.tablas.humaya_concierge_notas = [
    nota(OTRO, 'n-del-vecino', 'Lo que el otro hotel anotó de este huésped'),
    nota(NEGOCIO_DE_PRUEBA, 'n-mia', 'Pidió almohada extra'),
  ];
});

describe('las notas internas del equipo', () => {
  it('no se leen las del hotel vecino', async () => {
    const notas = await getNotas(ESTADIA);

    expect(notas.map((n) => n.texto)).toEqual(['Pidió almohada extra']);
  });

  it('la nota nueva nace con el hotel de la pantalla', async () => {
    await crearNota(ESTADIA, 'Llega con bebé', { id: 'u-1', nombre: 'Ana' });

    const nueva = supabaseStub.tablas.humaya_concierge_notas.find(
      (fila) => fila.texto === 'Llega con bebé',
    );
    expect(nueva?.negocio_id).toBe(NEGOCIO_DE_PRUEBA);
  });

  it('borrar por id no alcanza a la del vecino', async () => {
    // Un id es único, pero el id de otro hotel se conoce en cuanto una
    // consulta se olvida del filtro. Que el borrado lo pida también.
    await expect(borrarNota('n-del-vecino')).rejects.toThrow('notas_sin_permiso');

    const sigue = supabaseStub.tablas.humaya_concierge_notas.some(
      (fila) => fila.id === 'n-del-vecino',
    );
    expect(sigue).toBe(true);
  });

  it('la propia sí se borra', async () => {
    await borrarNota('n-mia');

    expect(supabaseStub.tablas.humaya_concierge_notas.map((fila) => fila.id)).toEqual([
      'n-del-vecino',
    ]);
  });
});
