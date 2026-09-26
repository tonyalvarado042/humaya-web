import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { TODAY } from '@/mocks/today';
import { getPendingWowCount, getWowSuggestions, getWowsDueBy, updateWowStatus } from './wow';

beforeEach(() => {
  resetMockState();
});

describe('getWowSuggestions', () => {
  it('Valeria tiene las 3 experiencias del prototipo', async () => {
    const wows = await getWowSuggestions('s-mendez-rojas');

    expect(wows).toHaveLength(3);
    expect(wows.map((wow) => wow.pillar)).toEqual(['connect', 'nourish', 'believe']);
  });

  it('el porqué repite el dato de la entrevista que lo originó', async () => {
    const wows = await getWowSuggestions('s-mendez-rojas');
    const nourish = wows.find((wow) => wow.pillar === 'nourish');

    expect(nourish?.reason).toContain('no toma alcohol');
    expect(nourish?.reason).toContain('frutos secos');
  });

  it('devuelve vacío para una estadía sin sugerencias', async () => {
    expect(await getWowSuggestions('s-whitfield')).toEqual([]);
  });
});

describe('preparar hoy', () => {
  it('son las 3 tareas con hora límite hoy, ordenadas', async () => {
    const due = await getWowsDueBy(TODAY);

    expect(due).toHaveLength(3);
    expect(due.map((wow) => wow.stayId)).toEqual(['s-mendez-rojas', 's-keller', 's-durand']);
  });

  it('el indicador arranca en 5 experiencias por preparar', async () => {
    expect(await getPendingWowCount()).toBe(5);
  });

  it('marcar una como hecha la saca de la cuenta y de los pendientes del día', async () => {
    await updateWowStatus('w-mendez-connect', 'done');

    expect(await getPendingWowCount()).toBe(4);
    expect(await getWowsDueBy(TODAY)).toHaveLength(2);
  });
});

describe('updateWowStatus', () => {
  it('avanza de sugerida a planificada y de ahí a hecha', async () => {
    let wow = await updateWowStatus('w-mendez-nourish', 'planned');
    expect(wow.status).toBe('planned');

    wow = await updateWowStatus('w-mendez-nourish', 'done');
    expect(wow.status).toBe('done');
  });

  it('no retrocede', async () => {
    await updateWowStatus('w-mendez-nourish', 'done');

    await expect(updateWowStatus('w-mendez-nourish', 'planned')).rejects.toThrow('no vuelve');
  });

  it('el cambio persiste al volver a consultar', async () => {
    await updateWowStatus('w-mendez-believe', 'planned');

    const wows = await getWowSuggestions('s-mendez-rojas');
    expect(wows.find((wow) => wow.id === 'w-mendez-believe')?.status).toBe('planned');
  });

  it('falla con un id que no existe', async () => {
    await expect(updateWowStatus('w-inventada', 'done')).rejects.toThrow(
      'No existe la experiencia',
    );
  });
});
