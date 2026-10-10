import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { saveAnswer } from '@/services/interview';
import { stubAdminApi, DEFAULT_OPCIONES } from '@/test/adminApiStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HomePage } from './HomePage';

const VALERIA = 's-mendez-rojas';
const HANNAH = 's-weber';

beforeEach(() => {
  resetMockState();
  stubAdminApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fichas() {
  return screen.findByRole('navigation', { name: 'Accesos rápidos' });
}

describe('saludo', () => {
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
  });

  it('a Hannah le cuenta los días que faltan', async () => {
    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByRole('heading', { name: 'Hola, Hannah.' })).toBeInTheDocument();
    expect(screen.getByText(/Faltan 5 días/)).toBeInTheDocument();
  });
});

describe('fichas de accesos', () => {
  it('muestra una ficha por cada opción habilitada, con enlace a su pantalla', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    const nav = within(await fichas());
    for (const opcion of DEFAULT_OPCIONES) {
      const link = nav.getByRole('link', { name: new RegExp(opcion.etiqueta) });
      expect(link).toHaveAttribute('href', `/app/${opcion.clave}`);
    }
  });

  it('no muestra la ficha de una opción deshabilitada', async () => {
    stubAdminApi({
      opciones: DEFAULT_OPCIONES.map((opcion) =>
        opcion.clave === 'move' ? { ...opcion, habilitada: false } : opcion,
      ),
    });
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    await fichas();
    expect(screen.queryByRole('link', { name: /Move/ })).not.toBeInTheDocument();
  });

  it('la ficha de Entrevista muestra el avance', async () => {
    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByText('2 de 5 respuestas')).toBeInTheDocument();
  });

  it('a Valeria, que ya la completó, le dice que está completa', async () => {
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    expect(await screen.findByText('Completa')).toBeInTheDocument();
  });

  it('refleja una respuesta guardada desde la entrevista', async () => {
    await saveAnswer(HANNAH, {
      questionId: 'q-light-believe',
      value: 'aniversario',
      answeredAt: '2026-11-14T10:00:00-06:00',
    });

    renderWithProviders(<HomePage />, { stayId: HANNAH });

    expect(await screen.findByText('3 de 5 respuestas')).toBeInTheDocument();
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
