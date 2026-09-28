import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { saveAnswer } from '@/services/interview';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HomePage } from './HomePage';

const VALERIA = 's-mendez-rojas';
const HANNAH = 's-weber';

beforeEach(() => {
  resetMockState();
});

describe('saludo y estadía', () => {
  it('muestra el wordmark oficial', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    expect(await screen.findByRole('img', { name: 'Humaya' })).toHaveAttribute(
      'src',
      '/wordmark-white.png',
    );
  });

  it('saluda a Valeria y le dice que llega hoy', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    expect(await screen.findByRole('heading', { name: 'Hola, Valeria.' })).toBeInTheDocument();
    expect(screen.getByText(/Llegás hoy. Ya tenemos lista la Villa 04/)).toBeInTheDocument();
    // La villa aparece en el saludo y como etiqueta de la estadía.
    expect(screen.getAllByText(/Villa 04/)).toHaveLength(2);
  });

  it('a Hannah le cuenta los días que faltan', async () => {
    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByRole('heading', { name: 'Hola, Hannah.' })).toBeInTheDocument();
    expect(screen.getByText(/Faltan 5 días/)).toBeInTheDocument();
  });

  it('muestra las fechas y la cantidad de personas', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    expect(await screen.findByText('Sáb 14 nov')).toBeInTheDocument();
    expect(screen.getByText('Mar 17 nov')).toBeInTheDocument();
    expect(screen.getByText('2 personas')).toBeInTheDocument();
  });

  it('muestra la celebración como etiqueta', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    expect(await screen.findByText('Aniversario · 5 años')).toBeInTheDocument();
  });
});

describe('avance de la entrevista', () => {
  it('a Hannah le muestra cuántas le faltan', async () => {
    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByText(/Llevás 2 de 5 respuestas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar entrevista' })).toHaveAttribute(
      'href',
      '/app/interview',
    );
  });

  it('a Valeria le dice que ya está completa', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    expect(await screen.findByText(/Ya está completa/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mis respuestas' })).toBeInTheDocument();
  });

  it('refleja una respuesta guardada desde la entrevista', async () => {
    await saveAnswer(HANNAH, {
      questionId: 'q-light-believe',
      value: 'aniversario',
      answeredAt: '2026-11-14T10:00:00-06:00',
    });

    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByText(/Llevás 3 de 5 respuestas/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Tu entrevista' })).toHaveAttribute(
      'aria-valuenow',
      '3',
    );
  });
});

describe('Preparate', () => {
  it('muestra los consejos del día del protocolo', async () => {
    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByText('Día 5 de 7')).toBeInTheDocument();
    expect(await screen.findByText('Hidratación')).toBeInTheDocument();
    expect(screen.getByText('Descanso')).toBeInTheDocument();
  });
});

describe('selector de huésped', () => {
  it('cambia de huésped sin recargar', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    await screen.findByRole('heading', { name: 'Hola, Valeria.' });
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Huésped de la demo' }),
      's-weber',
    );

    expect(await screen.findByRole('heading', { name: 'Hola, Hannah.' })).toBeInTheDocument();
  });
});
