import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { getProgress } from '@/services/interview';
import { renderWithProviders } from '@/test/renderWithProviders';
import { InterviewPage } from './InterviewPage';

/** Hannah va por 2 de 5 y todavía no aceptó la política de privacidad. */
const HANNAH = 's-weber';
/** Valeria la tiene completa y ya aceptó la política. */
const VALERIA = 's-mendez-rojas';

beforeEach(() => {
  resetMockState();
});

describe('aviso de IA y privacidad', () => {
  it('avisa que el concierge es una IA antes de preguntar nada', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    expect(await screen.findByText(/asistente con inteligencia artificial/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'política de privacidad' })).toBeInTheDocument();
  });
});

describe('consentimiento antes de una pregunta sensible', () => {
  it('se lo pide a quien no lo dio', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    // Hannah respondió connect y move; la pendiente es la de alergias.
    expect(await screen.findByRole('heading', { name: 'Antes de seguir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceptar y seguir' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Frutos secos' })).not.toBeInTheDocument();
  });

  it('al aceptar, aparecen las opciones de la pregunta', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    await userEvent.click(await screen.findByRole('button', { name: 'Aceptar y seguir' }));

    expect(await screen.findByRole('button', { name: 'Frutos secos' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Antes de seguir' })).not.toBeInTheDocument();
  });

  it('se puede saltar la pregunta sin aceptar', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    await userEvent.click(await screen.findByRole('button', { name: 'Saltar esta pregunta' }));

    // Pasa a la siguiente sin haberla contado como respondida.
    expect(await screen.findByText(/celebran algo especial/i)).toBeInTheDocument();
    expect((await getProgress(HANNAH, 'light')).answered).toBe(2);
  });

  it('no se lo vuelve a pedir a quien ya lo aceptó', async () => {
    renderWithProviders(<InterviewPage />, { stayId: VALERIA });

    await screen.findByText(/asistente con inteligencia artificial/i);
    expect(screen.queryByRole('heading', { name: 'Antes de seguir' })).not.toBeInTheDocument();
  });
});

describe('flujo completo', () => {
  it('responder las preguntas que faltan llega al agradecimiento', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    await userEvent.click(await screen.findByRole('button', { name: 'Aceptar y seguir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Frutos secos' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Aniversario' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Con calma y espacio' }));

    expect(await screen.findByText(/ya podemos preparar tu llegada/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a Inicio' })).toBeInTheDocument();
    expect((await getProgress(HANNAH, 'light')).complete).toBe(true);
  });

  it('cada respuesta queda guardada y se ve en el hilo', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    await userEvent.click(await screen.findByRole('button', { name: 'Aceptar y seguir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Gluten' }));

    // Esperar a que avance la pregunta: "Gluten" sigue existiendo como opción
    // mientras se guarda, así que buscarlo por texto no prueba nada.
    expect(await screen.findByText(/celebran algo especial/i)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Aniversario' })).toBeInTheDocument();
    expect((await getProgress(HANNAH, 'light')).answered).toBe(3);
  });

  it('muestra el avance en el rótulo', async () => {
    renderWithProviders(<InterviewPage />, { stayId: HANNAH });

    expect(await screen.findByText(/Pregunta 2 de 5 · Nourish/)).toBeInTheDocument();
  });

  it('a quien ya la completó le muestra el cierre', async () => {
    renderWithProviders(<InterviewPage />, { stayId: VALERIA });

    expect(await screen.findByText(/ya podemos preparar tu llegada/i)).toBeInTheDocument();
    expect(screen.getByText('Entrevista completa')).toBeInTheDocument();
  });
});

describe('entrevista profunda', () => {
  it('cambiar a profunda trae sus 18 preguntas', async () => {
    renderWithProviders(<InterviewPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('radio', { name: /Profunda/ }));

    expect(await screen.findByText(/Pregunta 1 de 18/)).toBeInTheDocument();
  });
});
