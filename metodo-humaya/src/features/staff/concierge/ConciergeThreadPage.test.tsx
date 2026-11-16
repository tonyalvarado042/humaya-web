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

    const field = await screen.findByLabelText('Tu respuesta (español)');
    await userEvent.type(field, 'Ya te confirmamos el horario.');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findAllByText('Ya te confirmamos el horario.')).not.toHaveLength(0);
    expect(field).toHaveValue('');
  });

  it('avisa, antes de mandar, que sin inglés el huésped va a recibir español', async () => {
    // 53 de 62 reservas reales entran por Airbnb, Expedia y Booking: el
    // huésped promedio lee en inglés. Mandar solo español no es un detalle
    // de estilo, es mandarle algo que no lee.
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    const es = await screen.findByLabelText('Tu respuesta (español)');
    await userEvent.type(es, 'Ya está reservado.');

    expect(await screen.findByText(/va a recibir el texto en español/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('La misma, en inglés'), "It's booked.");

    expect(screen.queryByText(/va a recibir el texto en español/)).not.toBeInTheDocument();
  });

  it('manda los dos idiomas cuando se escriben los dos', async () => {
    const { fetchMock } = stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    await userEvent.type(
      await screen.findByLabelText('Tu respuesta (español)'),
      'Ya está reservado.',
    );
    await userEvent.type(screen.getByLabelText('La misma, en inglés'), "It's booked.");
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    const envio = fetchMock.mock.calls
      .map(([, init]) => String((init as RequestInit | undefined)?.body ?? ''))
      .find((body) => body.includes('"action":"reply"'));

    expect(envio).toBeDefined();
    expect(JSON.parse(envio!)).toEqual({
      action: 'reply',
      stay_id: 's-mendez-rojas',
      text: 'Ya está reservado.',
      text_en: "It's booked.",
    });
  });

  it('una estadía que no existe muestra el estado vacío', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/no-existe' });

    expect(await screen.findByText('No encontramos esa conversación')).toBeInTheDocument();
  });
});
