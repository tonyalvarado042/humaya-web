import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { supportedGuestLanguage } from '@/i18n/localizedText';
import { routes } from '@/router';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
  window.localStorage.clear();
});

function guestNav() {
  return screen.getByRole('navigation', { name: /Navegación principal|Main navigation/ });
}

describe('idioma de la app del huésped', () => {
  it('cambia toda la navegación y las cinco pantallas a inglés', async () => {
    renderRoutes(routes, { route: '/app' });

    await screen.findByRole('heading', { name: 'Hola, Valeria.' });
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar idioma a inglés' }));

    expect(await screen.findByRole('heading', { name: 'Hello, Valeria.' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Anniversary · 5 years')).toBeInTheDocument();
    expect(screen.getByText(/Sat Nov 14/)).toBeInTheDocument();
    expect(within(guestNav()).getByRole('link', { name: 'Home' })).toBeInTheDocument();

    await userEvent.click(within(guestNav()).getByRole('link', { name: 'Interview' }));
    expect(await screen.findByText('Who are you coming with?')).toBeInTheDocument();

    await userEvent.click(within(guestNav()).getByRole('link', { name: 'Concierge' }));
    expect(await screen.findByText(/I'm your Humaya concierge/)).toBeInTheDocument();

    await userEvent.click(within(guestNav()).getByRole('link', { name: 'My villa' }));
    expect(await screen.findByText(/Volcano view · Private terrace/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Air conditioning' })).toBeInTheDocument();

    await userEvent.click(within(guestNav()).getByRole('link', { name: 'Bookings' }));
    expect(
      await screen.findByText('Private 45-minute sessions for up to 4 guests.'),
    ).toBeInTheDocument();
  });

  it('usa la preferencia del huésped y recuerda una elección distinta para cada estadía', async () => {
    renderRoutes(routes, { route: '/app' });

    await screen.findByRole('heading', { name: 'Hola, Valeria.' });
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar idioma a inglés' }));
    await screen.findByRole('heading', { name: 'Hello, Valeria.' });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Demo guest' }), 's-weber');
    expect(await screen.findByRole('heading', { name: 'Hello, Hannah.' })).toBeInTheDocument();
    expect(await screen.findByText('Hydration')).toBeInTheDocument();
    expect(screen.getByText('Rest')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Switch language to Spanish' }));
    await screen.findByRole('heading', { name: 'Hola, Hannah.' });

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Huésped de la demo' }),
      's-mendez-rojas',
    );
    expect(await screen.findByRole('heading', { name: 'Hello, Valeria.' })).toBeInTheDocument();
    expect(window.localStorage.getItem('humaya.guest-language:s-mendez-rojas')).toBe('en');
    expect(window.localStorage.getItem('humaya.guest-language:s-weber')).toBe('es');
  });

  it('traduce las respuestas mock existentes del concierge sin perder el hilo', async () => {
    renderRoutes(routes, { route: '/app' });

    await screen.findByRole('heading', { name: 'Hola, Valeria.' });
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar idioma a inglés' }));
    await userEvent.click(within(guestNav()).getByRole('link', { name: 'Concierge' }));
    await screen.findByText(/I'm your Humaya concierge/);

    await userEvent.click(screen.getByRole('button', { name: 'Hot water' }));
    expect(await screen.findByText(/The water heater is already on/)).toBeInTheDocument();
    expect(screen.getAllByText('Hot water')).toHaveLength(2);

    await userEvent.click(within(guestNav()).getByRole('link', { name: 'Home' }));
    await screen.findByRole('heading', { name: 'Hello, Valeria.' });
    await userEvent.click(screen.getByRole('button', { name: 'Switch language to Spanish' }));
    await userEvent.click(within(guestNav()).getByRole('link', { name: 'Concierge' }));
    expect(await screen.findByText(/El calentador ya está encendido/)).toBeInTheDocument();
    expect(screen.getByText('Hot water')).toBeInTheDocument();
  });

  it('mantiene recepción en español después de usar la app en inglés', async () => {
    const { router } = renderRoutes(routes, { route: '/app' });

    await screen.findByRole('heading', { name: 'Hola, Valeria.' });
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar idioma a inglés' }));
    await router.navigate('/staff');

    expect(await screen.findByRole('heading', { name: 'Llegadas' })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'es'));
  });

  it('usa español como respaldo para preferencias alemana y francesa', () => {
    expect(supportedGuestLanguage('de')).toBe('es');
    expect(supportedGuestLanguage('fr')).toBe('es');
  });
});
