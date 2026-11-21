import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
  stubConciergeApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * El sidebar y el menú deslizable existen los dos en el DOM: Tailwind decide
 * cuál se ve según el ancho, y jsdom no calcula CSS. Por eso los tests miran
 * el contenido y el comportamiento, no la visibilidad.
 */
describe('sidebar de escritorio', () => {
  it('muestra el logotipo del hotel, con su nombre como texto alternativo', async () => {
    renderRoutes(routes, { route: '/staff' });

    const sidebar = await screen.findByRole('complementary');
    expect(within(sidebar).getByRole('img', { name: 'HUMAYA' })).toHaveAttribute(
      'src',
      '/wordmark-white.png',
    );
  });

  it('ofrece los cuatro destinos y el enlace a la app del huésped', async () => {
    renderRoutes(routes, { route: '/staff' });

    const sidebar = await screen.findByRole('complementary');
    for (const label of ['Bookings', 'Guests', 'Schedule', 'Concierge', 'Admin']) {
      expect(within(sidebar).getByRole('link', { name: new RegExp(label) })).toBeInTheDocument();
    }
    expect(within(sidebar).getByRole('link', { name: 'Open the guest app' })).toHaveAttribute(
      'href',
      '/app',
    );
  });

  it('marca la pantalla actual', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    const sidebar = await screen.findByRole('complementary');
    expect(within(sidebar).getByRole('link', { name: 'Schedule' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(sidebar).getByRole('link', { name: 'Bookings' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('deja "Villas" deshabilitado, que no es del MVP', async () => {
    renderRoutes(routes, { route: '/staff' });

    await screen.findByRole('complementary');
    // No es un enlace: es un rótulo marcado como deshabilitado.
    expect(screen.queryByRole('link', { name: /Villas/ })).not.toBeInTheDocument();
    expect(screen.getAllByText('Villas')[0].closest('[aria-disabled="true"]')).toBeTruthy();
  });
});

describe('aviso del Concierge', () => {
  it('muestra el total de mensajes sin leer en el nav', async () => {
    const at = new Date().toISOString();
    stubConciergeApi([
      {
        id: 'm-1',
        stayId: 's-mendez-rojas',
        guestName: 'Valeria',
        from: 'guest',
        text: '¿tienen helicóptero?',
        escalated: true,
        readAt: null,
        at,
      },
    ]);
    renderRoutes(routes, { route: '/staff' });

    const sidebar = await screen.findByRole('complementary');
    const link = within(sidebar).getByRole('link', { name: /Concierge/ });
    expect(await within(link).findByText('1')).toBeInTheDocument();
  });

  it('no muestra nada cuando no hay mensajes sin leer', async () => {
    renderRoutes(routes, { route: '/staff' });

    const sidebar = await screen.findByRole('complementary');
    const link = within(sidebar).getByRole('link', { name: 'Concierge' });
    expect(link).toHaveTextContent('Concierge');
  });
});

describe('menú deslizable', () => {
  it('arranca cerrado', async () => {
    renderRoutes(routes, { route: '/staff' });

    await screen.findByRole('complementary');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el botón de hamburguesa lo abre con los mismos destinos', async () => {
    renderRoutes(routes, { route: '/staff' });

    await userEvent.click(await screen.findByRole('button', { name: 'Open menu' }));

    const drawer = screen.getByRole('dialog', { name: 'Front desk' });
    for (const label of ['Bookings', 'Guests', 'Schedule', 'Concierge', 'Admin']) {
      expect(within(drawer).getByRole('link', { name: new RegExp(label) })).toBeInTheDocument();
    }
  });

  it('se cierra al elegir un destino, y navega', async () => {
    const { router } = renderRoutes(routes, { route: '/staff' });

    await userEvent.click(await screen.findByRole('button', { name: 'Open menu' }));
    const drawer = screen.getByRole('dialog');
    await userEvent.click(within(drawer).getByRole('link', { name: 'Schedule' }));

    expect(router.state.location.pathname).toBe('/staff/spa');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Escape lo cierra y devuelve el foco a la hamburguesa', async () => {
    renderRoutes(routes, { route: '/staff' });
    const trigger = await screen.findByRole('button', { name: 'Open menu' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('barra superior', () => {
  it('nombra la pantalla en la que se está', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    const header = await screen.findByRole('banner');
    expect(within(header).getByText('Schedule')).toBeInTheDocument();
  });
});
