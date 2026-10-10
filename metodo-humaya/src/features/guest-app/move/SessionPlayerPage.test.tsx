import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubAdminApi } from '@/test/adminApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
  stubAdminApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Reproductor de sesión (Move)', () => {
  it('arranca en la intro de la sesión, con el estilo "Pantalla completa" por defecto', async () => {
    renderRoutes(routes, { route: '/app/move/move-session-1' });

    expect(await screen.findByRole('heading', { name: 'Full body' })).toBeInTheDocument();
    expect(screen.getByText('Antes de empezar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Empezar sesión' })).toBeInTheDocument();

    const styleGroup = screen.getByRole('radiogroup', { name: 'Estilo de video' });
    expect(within(styleGroup).getByRole('radio', { name: 'Pantalla completa' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('pasa de la intro a la sección y muestra la lista de ejercicios', async () => {
    const user = userEvent.setup();
    renderRoutes(routes, { route: '/app/move/move-session-1' });

    await user.click(await screen.findByRole('button', { name: 'Empezar sesión' }));

    expect(await screen.findByRole('heading', { name: 'Tren inferior' })).toBeInTheDocument();
    expect(screen.getByText('Sentadilla goblet')).toBeInTheDocument();
    expect(screen.getByText('Peso muerto rumano')).toBeInTheDocument();
  });

  it('arranca el primer ejercicio con el contador de trabajo y permite saltar', async () => {
    const user = userEvent.setup();
    renderRoutes(routes, { route: '/app/move/move-session-1' });

    await user.click(await screen.findByRole('button', { name: 'Empezar sesión' }));
    await user.click(await screen.findByRole('button', { name: 'Empezar sesión' }));

    expect(await screen.findByRole('heading', { name: 'Sentadilla goblet' })).toBeInTheDocument();
    expect(screen.getByText('Trabajo')).toBeInTheDocument();
    expect(screen.getByText('Serie 1 de 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(await screen.findByText('Descanso')).toBeInTheDocument();
  });

  it('el botón de salir vuelve a la lista de Move', async () => {
    const user = userEvent.setup();
    const { router } = renderRoutes(routes, { route: '/app/move/move-session-1' });

    await user.click(await screen.findByRole('button', { name: 'Salir' }));

    expect(router.state.location.pathname).toBe('/app/move');
  });
});
