import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { saveAnswer } from '@/services/interview';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MyDataPage } from './MyDataPage';

const VALERIA = 's-mendez-rojas';
const HANNAH = 's-weber';

beforeEach(() => {
  resetMockState();
});

describe('resumen de la estadía', () => {
  it('muestra las fechas y la cantidad de personas', async () => {
    renderWithProviders(<MyDataPage />, { stayId: VALERIA });

    expect(await screen.findByText('Sáb 14 nov')).toBeInTheDocument();
    expect(screen.getByText('Mar 17 nov')).toBeInTheDocument();
    expect(screen.getByText('2 personas')).toBeInTheDocument();
  });

  it('muestra la celebración como etiqueta', async () => {
    renderWithProviders(<MyDataPage />, { stayId: VALERIA });

    expect(await screen.findByText('Aniversario · 5 años')).toBeInTheDocument();
  });
});

describe('avance de la entrevista', () => {
  it('a Hannah le muestra cuántas le faltan', async () => {
    renderWithProviders(<MyDataPage />, { stayId: HANNAH });

    expect(await screen.findByText(/Llevás 2 de 5 respuestas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar entrevista' })).toHaveAttribute(
      'href',
      '/app/interview',
    );
  });

  it('a Valeria le dice que ya está completa', async () => {
    renderWithProviders(<MyDataPage />, { stayId: VALERIA });

    expect(await screen.findByText(/Ya está completa/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mis respuestas' })).toBeInTheDocument();
  });

  it('refleja una respuesta guardada desde la entrevista', async () => {
    await saveAnswer(HANNAH, {
      questionId: 'q-light-believe',
      value: 'aniversario',
      answeredAt: '2026-11-14T10:00:00-06:00',
    });

    renderWithProviders(<MyDataPage />, { stayId: HANNAH });

    expect(await screen.findByText(/Llevás 3 de 5 respuestas/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Tu entrevista' })).toHaveAttribute(
      'aria-valuenow',
      '3',
    );
  });
});

describe('Preparate', () => {
  it('muestra los consejos del día del protocolo', async () => {
    renderWithProviders(<MyDataPage />, { stayId: HANNAH });

    expect(await screen.findByText('Día 5 de 7')).toBeInTheDocument();
    expect(await screen.findByText('Hidratación')).toBeInTheDocument();
    expect(screen.getByText('Descanso')).toBeInTheDocument();
  });
});
