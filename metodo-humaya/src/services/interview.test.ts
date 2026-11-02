import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { getAnswers, getProgress, getQuestions, saveAnswer } from './interview';

beforeEach(() => {
  resetMockState();
});

describe('getQuestions', () => {
  it('la entrevista light trae 5 preguntas y la profunda 18', async () => {
    expect(await getQuestions('light')).toHaveLength(5);
    expect(await getQuestions('deep')).toHaveLength(18);
  });

  it('cubre los cinco pilares en los dos modos', async () => {
    for (const depth of ['light', 'deep'] as const) {
      const questions = await getQuestions(depth);
      const pillars = new Set(questions.map((question) => question.pillar));

      expect([...pillars].sort()).toEqual(['believe', 'connect', 'create', 'move', 'nourish']);
    }
  });

  it('marca como sensibles las preguntas de alergias y salud', async () => {
    const light = await getQuestions('light');
    const alergias = light.find((question) => question.id === 'q-light-nourish');

    expect(alergias?.sensitive).toBe(true);

    const deep = await getQuestions('deep');
    const sensibles = deep.filter((question) => question.sensitive);

    expect(sensibles.length).toBeGreaterThan(0);
    for (const question of sensibles) {
      expect(question.prompt.es).toBeTruthy();
    }
  });

  it('todas las preguntas tienen texto en español y en inglés', async () => {
    const questions = [...(await getQuestions('light')), ...(await getQuestions('deep'))];

    for (const question of questions) {
      expect(question.prompt.es).toBeTruthy();
      expect(question.prompt.en).toBeTruthy();
    }
  });

  it('no repite identificadores', async () => {
    const questions = [...(await getQuestions('light')), ...(await getQuestions('deep'))];
    const ids = new Set(questions.map((question) => question.id));

    expect(ids.size).toBe(questions.length);
  });
});

describe('getProgress', () => {
  it('Valeria la tiene completa', async () => {
    const progress = await getProgress('s-mendez-rojas');

    expect(progress).toEqual({ depth: 'light', answered: 5, total: 5, complete: true });
  });

  it('Camille va por 3 de 5 y Hannah por 2', async () => {
    expect((await getProgress('s-durand')).answered).toBe(3);
    expect((await getProgress('s-weber')).answered).toBe(2);
  });

  it('una estadía sin respuestas arranca en cero', async () => {
    const progress = await getProgress('s-whitfield');

    expect(progress.answered).toBe(0);
    expect(progress.complete).toBe(false);
  });
});

describe('saveAnswer', () => {
  it('mueve el avance', async () => {
    // Hannah tiene connect y move; nourish es la primera que le falta.
    const progress = await saveAnswer('s-weber', {
      questionId: 'q-light-nourish',
      value: 'ninguna',
      answeredAt: '2026-11-14T10:00:00-06:00',
    });

    expect(progress.answered).toBe(3);
    expect(progress.complete).toBe(false);
  });

  it('responder la última completa la entrevista', async () => {
    const pending = ['q-light-nourish', 'q-light-believe', 'q-light-create'];

    let progress = await getProgress('s-weber');
    for (const questionId of pending) {
      progress = await saveAnswer('s-weber', {
        questionId,
        value: 'x',
        answeredAt: '2026-11-14T10:00:00-06:00',
      });
    }

    expect(progress.complete).toBe(true);
  });

  it('responder de nuevo la misma pregunta reemplaza, no duplica', async () => {
    await saveAnswer('s-mendez-rojas', {
      questionId: 'q-light-move',
      value: 'intenso',
      answeredAt: '2026-11-14T10:00:00-06:00',
    });

    const answers = await getAnswers('s-mendez-rojas');
    const move = answers.filter((answer) => answer.questionId === 'q-light-move');

    expect(move).toHaveLength(1);
    expect(move[0].value).toBe('intenso');
    expect((await getProgress('s-mendez-rojas')).answered).toBe(5);
  });

  it('rechaza una pregunta que no existe', async () => {
    await expect(
      saveAnswer('s-mendez-rojas', {
        questionId: 'q-inventada',
        value: 'x',
        answeredAt: '2026-11-14T10:00:00-06:00',
      }),
    ).rejects.toThrow('No existe la pregunta');
  });
});
