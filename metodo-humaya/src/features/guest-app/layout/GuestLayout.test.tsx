import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
});

function nav() {
  return screen.getByRole('navigation', { name: 'Navegación principal' });
}

describe('barra inferior', () => {
  it('ofrece las seis pantallas', async () => {
    renderRoutes(routes, { route: '/app' });

    const links = within(nav()).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Inicio',
      'Entrevista',
      'Concierge',
      'Mi villa',
      'Reservas',
      'Move',
    ]);
  });

  it('marca la pantalla actual con aria-current', async () => {
    renderRoutes(routes, { route: '/app' });

    expect(within(nav()).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav()).getByRole('link', { name: 'Reservas' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navegar cambia la URL y la pantalla', async () => {
    const { router } = renderRoutes(routes, { route: '/app' });

    await userEvent.click(within(nav()).getByRole('link', { name: 'Mi villa' }));

    expect(router.state.location.pathname).toBe('/app/villa');
    expect(within(nav()).getByRole('link', { name: 'Mi villa' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('cada enlace llega a su pantalla', async () => {
    const paths = [
      ['Entrevista', '/app/interview'],
      ['Concierge', '/app/concierge'],
      ['Reservas', '/app/bookings'],
      ['Move', '/app/move'],
    ] as const;

    for (const [label, path] of paths) {
      const { router, unmount } = renderRoutes(routes, { route: '/app' });

      await userEvent.click(within(nav()).getByRole('link', { name: label }));
      expect(router.state.location.pathname).toBe(path);

      unmount();
    }
  });
});
