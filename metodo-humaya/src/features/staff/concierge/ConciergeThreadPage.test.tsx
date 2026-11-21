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
    expect(screen.getByText(/The bot did not know how to answer/)).toBeInTheDocument();
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
        body: JSON.stringify({ hotel: 'humaya', action: 'read', stay_id: 's-weber' }),
      }),
    );
  });

  it('el staff puede contestar y el mensaje aparece en el hilo', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    const field = await screen.findByLabelText('Your reply (Spanish)');
    await userEvent.type(field, 'Ya te confirmamos el horario.');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findAllByText('Ya te confirmamos el horario.')).not.toHaveLength(0);
    expect(field).toHaveValue('');
  });

  it('avisa, antes de mandar, que sin inglés el huésped va a recibir español', async () => {
    // 53 de 62 reservas reales entran por Airbnb, Expedia y Booking: el
    // huésped promedio lee en inglés. Mandar solo español no es un detalle
    // de estilo, es mandarle algo que no lee.
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    const es = await screen.findByLabelText('Your reply (Spanish)');
    await userEvent.type(es, 'Ya está reservado.');

    expect(await screen.findByText(/will receive the Spanish text/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('The same, in English'), "It's booked.");

    expect(screen.queryByText(/will receive the Spanish text/)).not.toBeInTheDocument();
  });

  it('manda los dos idiomas cuando se escriben los dos', async () => {
    const { fetchMock } = stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    await userEvent.type(
      await screen.findByLabelText('Your reply (Spanish)'),
      'Ya está reservado.',
    );
    await userEvent.type(screen.getByLabelText('The same, in English'), "It's booked.");
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    const envio = fetchMock.mock.calls
      .map(([, init]) => String((init as RequestInit | undefined)?.body ?? ''))
      .find((body) => body.includes('"action":"reply"'));

    expect(envio).toBeDefined();
    expect(JSON.parse(envio!)).toEqual({
      // El hotel viaja en toda llamada al Concierge: sin él la función
      // contesta con la base de conocimiento de todos los hoteles juntos.
      hotel: 'humaya',
      action: 'reply',
      stay_id: 's-mendez-rojas',
      text: 'Ya está reservado.',
      text_en: "It's booked.",
    });
  });

  it('la ficha pone adelante lo que no se puede olvidar', async () => {
    // El orden no es decoración. Esto ya existía en el perfil del huésped, a
    // dos pantallas de distancia; nadie se va de una conversación abierta
    // para ir a leerlo, así que en la práctica no existía.
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    // Lo que puede terminar en una ambulancia.
    expect(await screen.findByText('Never forget')).toBeInTheDocument();
    expect(screen.getByText('Andrés: nut allergy')).toBeInTheDocument();

    // Dónde va en su estadía: la misma pregunta se contesta distinto el
    // primer día que la última mañana.
    expect(screen.getByText(/Arrives today at/)).toBeInTheDocument();

    // La celebración que, si nadie menciona, se pierde.
    expect(screen.getByText(/Anniversary · 5 years/)).toBeInTheDocument();

    // Cómo pidió que lo atendamos, en sus palabras.
    expect(screen.getByText(/mensaje antes de que alguien pase por la villa/)).toBeInTheDocument();
  });

  it('lo que el huésped ya contestó está a un clic, para no volver a preguntarlo', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    const seccion = await screen.findByText(/What they already told us · 5/);
    const plegable = seccion.closest('details');

    // Cerrada al entrar: el chat es lo que se viene a leer, no el expediente.
    // Se comprueba el atributo y no el texto porque en jsdom los hijos de un
    // <details> cerrado siguen en el DOM — buscar el texto daría verde con la
    // sección trabada.
    expect(plegable).not.toHaveAttribute('open');

    await userEvent.click(seccion);
    expect(plegable).toHaveAttribute('open');

    expect(screen.getByText(/caminata al amanecer/)).toBeInTheDocument();
    expect(screen.getByText(/Buscan tiempo en silencio/)).toBeInTheDocument();
  });

  it('desde la conversación se llega a la ficha completa', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/s-mendez-rojas' });

    const enlace = await screen.findByRole('link', { name: /Open the full profile/ });
    expect(enlace).toHaveAttribute('href', '/staff/guests/s-mendez-rojas');
  });

  it('una estadía que no existe muestra el estado vacío', async () => {
    stubConciergeApi();
    renderRoutes(routes, { route: '/staff/concierge/no-existe' });

    expect(await screen.findByText('We could not find that conversation')).toBeInTheDocument();
  });
});
