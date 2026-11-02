import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { DEFAULT_OPCIONES, stubAdminApi } from '@/test/adminApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function nav() {
  return screen.getByRole('navigation', { name: 'Navegación principal' });
}

describe('barra inferior', () => {
  it('ofrece las siete pantallas, las que vienen habilitadas desde admin', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/app' });

    await within(nav()).findByRole('link', { name: 'Move' });
    const links = within(nav()).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Inicio',
      'Mis datos',
      'Entrevista',
      'Concierge',
      'Mi villa',
      'Reservas',
      'Move',
    ]);
  });

  it('una opción deshabilitada desde admin no aparece en el menú', async () => {
    stubAdminApi({
      opciones: DEFAULT_OPCIONES.map((opcion) =>
        opcion.clave === 'move' ? { ...opcion, habilitada: false } : opcion,
      ),
    });
    renderRoutes(routes, { route: '/app' });

    await within(nav()).findByRole('link', { name: 'Reservas' });
    expect(within(nav()).queryByRole('link', { name: 'Move' })).not.toBeInTheDocument();
  });

  it('marca la pantalla actual con aria-current', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/app' });

    expect(within(nav()).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(await within(nav()).findByRole('link', { name: 'Reservas' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navegar cambia la URL y la pantalla', async () => {
    stubAdminApi();
    const { router } = renderRoutes(routes, { route: '/app' });

    await userEvent.click(await within(nav()).findByRole('link', { name: 'Mi villa' }));

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
      stubAdminApi();
      const { router, unmount } = renderRoutes(routes, { route: '/app' });

      await userEvent.click(await within(nav()).findByRole('link', { name: label }));
      expect(router.state.location.pathname).toBe(path);

      unmount();
      vi.unstubAllGlobals();
    }
  });
});
