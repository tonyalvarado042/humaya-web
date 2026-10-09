import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Conversación de un huésped', () => {
  it('muestra el hilo y avisa que el bot no supo responder', async () => {
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
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    expect(await screen.findByRole('heading', { name: 'Valeria' })).toBeInTheDocument();
    expect(screen.getByText(/tienen helicóptero/)).toBeInTheDocument();
    expect(screen.getByText(/El bot no supo responder/)).toBeInTheDocument();
  });

  it('marca la conversación como leída al abrirla', async () => {
    const at = new Date().toISOString();
    const { fetchMock } = stubConciergeApi([
      {
        id: 'm-1',
        stayId: 's-weber',
        guestName: 'Hannah',
        from: 'guest',
        text: 'is there wifi',
        escalated: false,
        readAt: null,
        at,
      },
    ]);
    renderRoutes(routes, { route: '/staff/concierge/s-weber' });

    await screen.findByText(/is there wifi/);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/humaya-concierge'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'read', stay_id: 's-weber' }),
      }),
    );
  });

  it('el staff puede contestar y el mensaje aparece en el hilo', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    const field = await screen.findByLabelText('Tu respuesta');
    await userEvent.type(field, 'Ya te confirmamos el horario.');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Ya te confirmamos el horario.')).toBeInTheDocument();
    expect(field).toHaveValue('');
  });

  it('una estadía que no existe muestra el estado vacío', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/no-existe' });

    expect(await screen.findByText('No encontramos esa conversación')).toBeInTheDocument();
  });
});
