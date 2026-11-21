import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { getGuestProfile } from '@/services/guests';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

const VALERIA = '/staff/guests/s-mendez-rojas';

beforeEach(() => {
  resetMockState();
  stubConciergeApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function wowPanel() {
  return screen.findByRole('region', { name: 'WOW experiences' });
}

describe('cabecera del perfil', () => {
  it('muestra el nombre, la villa y las noches', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(
      await screen.findByRole('heading', { name: 'Valeria Méndez y Andrés Rojas' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Villa 04 · 3 nights · 2 guests · Español/)).toBeInTheDocument();
  });

  it('muestra las alertas, con la alergia como texto', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(await screen.findByText('Andrés: nut allergy')).toBeInTheDocument();
    expect(screen.getByText('Anniversary · 5 years')).toBeInTheDocument();
  });

  it('muestra cómo quieren que los atendamos', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(await screen.findByText(/Con calma y espacio/)).toBeInTheDocument();
  });

  it('vuelve a Llegadas', async () => {
    const { router } = renderRoutes(routes, { route: VALERIA });

    await userEvent.click(await screen.findByRole('link', { name: '← Arrivals' }));

    expect(router.state.location.pathname).toBe('/staff');
  });
});

describe('lo que dejó la entrevista', () => {
  it('muestra los 5 pilares', async () => {
    renderRoutes(routes, { route: VALERIA });

    await screen.findByRole('heading', { name: 'Valeria Méndez y Andrés Rojas' });
    for (const pillar of ['Move', 'Nourish', 'Connect', 'Create', 'Believe']) {
      expect(screen.getAllByText(pillar).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/caminata al amanecer y un día de bici/)).toBeInTheDocument();
  });

  it('muestra la línea de tiempo del Método Humaya', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(await screen.findByText('Interview complete')).toBeInTheDocument();
    expect(screen.getByText('Pre-arrival prep')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
  });

  it('a quien no la completó le avisa, sin inventar pilares', async () => {
    renderRoutes(routes, { route: '/staff/guests/s-whitfield' });

    expect(await screen.findByText(/once they complete the interview/i)).toBeInTheDocument();
  });
});

describe('experiencias WOW', () => {
  it('muestra las tres de Valeria con su porqué', async () => {
    renderRoutes(routes, { route: VALERIA });

    const panel = await wowPanel();
    expect(await within(panel).findAllByRole('listitem')).toHaveLength(3);
    expect(within(panel).getByText(/celebran 5 años juntos/i)).toBeInTheDocument();
  });

  it('avanzar una sugerida la deja planificada', async () => {
    renderRoutes(routes, { route: VALERIA });

    const panel = await wowPanel();
    const items = await within(panel).findAllByRole('listitem');
    const suggested = items.find((item) => within(item).queryByText('Suggested')) as HTMLElement;

    await userEvent.click(within(suggested).getByRole('button', { name: 'Plan it' }));

    expect(await within(suggested).findByText('Planned')).toBeInTheDocument();
  });

  it('una experiencia hecha ya no se puede mover', async () => {
    renderRoutes(routes, { route: VALERIA });

    const panel = await wowPanel();
    const items = await within(panel).findAllByRole('listitem');
    const planned = items.find((item) => within(item).queryByText('Planned')) as HTMLElement;

    await userEvent.click(within(planned).getByRole('button', { name: 'Mark as done' }));

    expect(await within(planned).findByText('Done')).toBeInTheDocument();
    expect(within(planned).getByRole('button', { name: 'Ready' })).toBeDisabled();
  });

  it('el cambio persiste al ir a Llegadas y volver', async () => {
    const { router } = renderRoutes(routes, { route: VALERIA });

    const panel = await wowPanel();
    const suggested = (await within(panel).findAllByRole('listitem')).find((item) =>
      within(item).queryByText('Suggested'),
    ) as HTMLElement;
    await userEvent.click(within(suggested).getByRole('button', { name: 'Plan it' }));
    await within(suggested).findByText('Planned');

    await userEvent.click(screen.getByRole('link', { name: '← Arrivals' }));
    expect(router.state.location.pathname).toBe('/staff');

    // Llegadas ya no abre en los datos de ejemplo sino en las reservas de
    // Cloudbeds. Valeria es una estadía de la demo, así que hay que pedirla:
    // es la opción que Admin deja encendida mientras Tony no publique.
    await screen.findByRole('heading', { name: 'Bookings' });
    await userEvent.click(await screen.findByRole('radio', { name: 'Demo' }));

    const rows = within(
      await screen.findByRole('table', { name: 'Arrivals in the period' }),
    ).getAllByRole('row');
    const valeria = rows.find((row) =>
      within(row).queryByText('Valeria Méndez y Andrés Rojas'),
    ) as HTMLElement;
    await userEvent.click(within(valeria).getByRole('link', { name: 'View profile' }));

    const backPanel = await wowPanel();
    expect(within(backPanel).queryByText('Suggested')).not.toBeInTheDocument();
  });
});

describe('aviso del Concierge', () => {
  it('enlaza a la conversación cuando hay mensajes sin leer', async () => {
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
    renderRoutes(routes, { route: VALERIA });

    const link = await screen.findByRole('link', {
      name: /They wrote to the Concierge and it has not been read yet/,
    });
    expect(link).toHaveAttribute('href', '/staff/concierge/s-mendez-rojas');
  });

  it('no aparece cuando no hay mensajes sin leer', async () => {
    renderRoutes(routes, { route: VALERIA });

    await screen.findByRole('heading', { name: 'Valeria Méndez y Andrés Rojas' });
    expect(
      screen.queryByText('They wrote to the Concierge and it has not been read yet'),
    ).not.toBeInTheDocument();
  });
});

describe('notas del equipo', () => {
  it('se guardan al salir del campo', async () => {
    renderRoutes(routes, { route: VALERIA });

    const notes = await screen.findByLabelText('Team notes');
    await userEvent.type(notes, 'Llegaron cansados del vuelo.');
    await userEvent.tab();

    expect(await screen.findByText('Notes saved')).toBeInTheDocument();

    const profile = await getGuestProfile('s-mendez-rojas');
    expect(profile.teamNotes).toBe('Llegaron cansados del vuelo.');
  });
});

describe('estadía que no existe', () => {
  it('ofrece el camino de vuelta', async () => {
    renderRoutes(routes, { route: '/staff/guests/s-inventada' });

    expect(await screen.findByText('We could not find that guest')).toBeInTheDocument();
  });

  it('sin estadía en la URL ya NO cae acá: esa dirección es la lista', async () => {
    // Hasta el 20 de noviembre de 2026, el elemento «Huéspedes» del menú
    // llevaba a esta ficha sin estadía, así que siempre decía «No encontramos
    // a ese huésped». Era un destino del menú que no llevaba a ninguna parte.
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findByRole('heading', { name: 'Guests' })).toBeInTheDocument();
    expect(screen.queryByText('No encontramos a ese huésped')).not.toBeInTheDocument();
  });
});
