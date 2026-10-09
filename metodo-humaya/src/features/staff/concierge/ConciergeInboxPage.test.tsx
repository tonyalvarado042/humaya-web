import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Bandeja del Concierge', () => {
  it('muestra una fila por cada huésped demo', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge' });

    expect(await screen.findByText('Valeria')).toBeInTheDocument();
    expect(screen.getByText('Hannah')).toBeInTheDocument();
  });

  it('avisa cuántos mensajes quedaron sin leer', async () => {
    const at = new Date().toISOString();
    stubConciergeApi([
      {
        id: 'm-1',
        stayId: 's-mendez-rojas',
        guestName: 'Valeria',
        from: 'guest',
        text: '¿tienen helicóptero?',
        escalated: false,
        readAt: null,
        at,
      },
      {
        id: 'm-2',
        stayId: 's-mendez-rojas',
        guestName: 'Valeria',
        from: 'concierge',
        text: 'Con gusto. Ya se lo paso al equipo de Humaya y te confirmo por aquí en unos minutos.',
        escalated: true,
        readAt: null,
        at,
      },
    ]);
    renderRoutes(routes, { route: '/staff/concierge' });

    expect(await screen.findByText('1 sin leer')).toBeInTheDocument();
    expect(screen.getByText('Esperando al equipo')).toBeInTheDocument();
    expect(screen.getByText(/tienen helicóptero/)).toBeInTheDocument();
  });

  it('dice que todavía no escribió cuando no hay mensajes', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge' });

    expect(await screen.findAllByText('Todavía no escribió.')).toHaveLength(2);
  });

  it('cada fila enlaza a la conversación de ese huésped', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge' });

    const link = await screen.findByRole('link', { name: /Valeria/ });
    expect(link).toHaveAttribute('href', '/staff/concierge/s-mendez-rojas');
  });
});
