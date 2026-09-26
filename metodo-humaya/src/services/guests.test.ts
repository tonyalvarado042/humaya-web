import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { getAlerts, getGuestProfile, saveTeamNotes } from './guests';
import { saveAnswer } from './interview';
import { getVillaInfo } from './villa';

beforeEach(() => {
  resetMockState();
});

describe('getGuestProfile', () => {
  it('arma el perfil de Valeria con sus 5 pilares', async () => {
    const profile = await getGuestProfile('s-mendez-rojas');

    expect(profile.guest.fullName).toBe('Valeria Méndez y Andrés Rojas');
    expect(profile.stay.villa).toBe(4);
    expect(profile.pillars).toHaveLength(5);
    expect(profile.preferredCare).toContain('Con calma y espacio');
  });

  it('las alertas del perfil son las mismas que devuelve getAlerts', async () => {
    const profile = await getGuestProfile('s-mendez-rojas');
    const alerts = await getAlerts('s-mendez-rojas');

    expect(profile.alerts).toEqual(alerts);
  });

  it('muestra las respuestas de la entrevista', async () => {
    const profile = await getGuestProfile('s-mendez-rojas');

    expect(profile.answers).toHaveLength(5);
    expect(profile.answers.find((answer) => answer.questionId === 'q-light-believe')?.value).toBe(
      'aniversario',
    );
  });

  it('refleja una respuesta recién guardada', async () => {
    await saveAnswer('s-weber', {
      questionId: 'q-light-nourish',
      value: 'ninguna',
      answeredAt: '2026-11-14T10:00:00-06:00',
    });

    const profile = await getGuestProfile('s-weber');
    expect(profile.answers).toHaveLength(3);
  });

  it('falla con una estadía que no existe', async () => {
    await expect(getGuestProfile('s-no-existe')).rejects.toThrow('No existe la estadía');
  });
});

describe('línea de tiempo del Método Humaya', () => {
  it('tiene los cuatro hitos', async () => {
    const profile = await getGuestProfile('s-mendez-rojas');

    expect(profile.timeline.map((event) => event.id)).toEqual([
      'interview',
      'prep',
      'arrival',
      'follow-up',
    ]);
  });

  it('marca la entrevista completa y la llegada de hoy como cumplidas', async () => {
    const profile = await getGuestProfile('s-mendez-rojas');
    const done = (id: string) => profile.timeline.find((event) => event.id === id)?.done;

    expect(done('interview')).toBe(true);
    expect(done('arrival')).toBe(true);
    expect(done('follow-up')).toBe(false);
  });

  it('para Hannah, que llega el 19, la entrevista y la llegada siguen pendientes', async () => {
    const profile = await getGuestProfile('s-weber');
    const done = (id: string) => profile.timeline.find((event) => event.id === id)?.done;

    expect(done('interview')).toBe(false);
    expect(done('arrival')).toBe(false);
  });
});

describe('notas del equipo', () => {
  it('se guardan y se leen en el perfil', async () => {
    await saveTeamNotes('s-mendez-rojas', 'Llegaron cansados del vuelo.');

    const profile = await getGuestProfile('s-mendez-rojas');
    expect(profile.teamNotes).toBe('Llegaron cansados del vuelo.');
  });
});

describe('getVillaInfo', () => {
  it('devuelve el wifi y los instructivos de la villa de la estadía', async () => {
    const info = await getVillaInfo('s-mendez-rojas');

    expect(info.villa).toBe(4);
    expect(info.name).toBe('Villa 04');
    expect(info.wifiNetwork).toBe('Humaya-Villa04');
    expect(info.guides.map((guide) => guide.id)).toEqual(['aire', 'agua', 'luces', 'cocina']);
  });
});
