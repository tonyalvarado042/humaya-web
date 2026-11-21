import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubAdminApi } from '@/test/adminApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('el menú del huésped', () => {
  it('lista las seis opciones con su estado', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin/menu' });

    expect(await screen.findByRole('heading', { name: 'Mis datos' })).toBeInTheDocument();
    for (const label of ['Entrevista', 'Concierge', 'Mi villa', 'Reservas', 'Move']) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    }
    expect(screen.getAllByText('Habilitada')).toHaveLength(6);
  });

  it('deshabilitar una opción la saca de la lista del Home del huésped', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin/menu' });

    const moveHeading = await screen.findByRole('heading', { name: 'Move' });
    const moveCard = moveHeading.closest('li') as HTMLElement;
    await userEvent.click(within(moveCard).getByRole('button', { name: 'Deshabilitar' }));

    expect(await within(moveCard).findByText('Deshabilitada')).toBeInTheDocument();
    expect(within(moveCard).getByRole('button', { name: 'Habilitar' })).toBeInTheDocument();
  });
});
