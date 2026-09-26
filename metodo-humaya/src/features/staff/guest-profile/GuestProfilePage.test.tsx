import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { getGuestProfile } from '@/services/guests';
import { renderRoutes } from '@/test/renderWithProviders';

const VALERIA = '/staff/guests/s-mendez-rojas';

beforeEach(() => {
  resetMockState();
});

function wowPanel() {
  return screen.findByRole('region', { name: 'Experiencias WOW' });
}

describe('cabecera del perfil', () => {
  it('muestra el nombre, la villa y las noches', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(
      await screen.findByRole('heading', { name: 'Valeria Méndez y Andrés Rojas' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Villa 04 · 3 noches · 2 personas · Español/)).toBeInTheDocument();
  });

  it('muestra las alertas, con la alergia como texto', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(await screen.findByText('Andrés: alergia a frutos secos')).toBeInTheDocument();
    expect(screen.getByText('Aniversario · 5 años')).toBeInTheDocument();
  });

  it('muestra cómo quieren que los atendamos', async () => {
    renderRoutes(routes, { route: VALERIA });

    expect(await screen.findByText(/Con calma y espacio/)).toBeInTheDocument();
  });

  it('vuelve a Llegadas', async () => {
    const { router } = renderRoutes(routes, { route: VALERIA });

    await userEvent.click(await screen.findByRole('link', { name: '← Llegadas' }));

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

    expect(await screen.findByText('Entrevista completa')).toBeInTheDocument();
    expect(screen.getByText('Protocolo pre-llegada')).toBeInTheDocument();
    expect(screen.getByText('Seguimiento')).toBeInTheDocument();
  });

  it('a quien no la completó le avisa, sin inventar pilares', async () => {
    renderRoutes(routes, { route: '/staff/guests/s-whitfield' });

    expect(await screen.findByText(/cuando complete la entrevista/i)).toBeInTheDocument();
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
    const suggested = items.find((item) => within(item).queryByText('Sugerida')) as HTMLElement;

    await userEvent.click(within(suggested).getByRole('button', { name: 'Planificar' }));

    expect(await within(suggested).findByText('Planificada')).toBeInTheDocument();
  });

  it('una experiencia hecha ya no se puede mover', async () => {
    renderRoutes(routes, { route: VALERIA });

    const panel = await wowPanel();
    const items = await within(panel).findAllByRole('listitem');
    const planned = items.find((item) => within(item).queryByText('Planificada')) as HTMLElement;

    await userEvent.click(within(planned).getByRole('button', { name: 'Marcar como hecha' }));

    expect(await within(planned).findByText('Hecha')).toBeInTheDocument();
    expect(within(planned).getByRole('button', { name: 'Lista' })).toBeDisabled();
  });

  it('el cambio persiste al ir a Llegadas y volver', async () => {
    const { router } = renderRoutes(routes, { route: VALERIA });

    const panel = await wowPanel();
    const suggested = (await within(panel).findAllByRole('listitem')).find((item) =>
      within(item).queryByText('Sugerida'),
    ) as HTMLElement;
    await userEvent.click(within(suggested).getByRole('button', { name: 'Planificar' }));
    await within(suggested).findByText('Planificada');

    await userEvent.click(screen.getByRole('link', { name: '← Llegadas' }));
    expect(router.state.location.pathname).toBe('/staff');

    const rows = within(
      await screen.findByRole('table', { name: 'Llegadas del período' }),
    ).getAllByRole('row');
    const valeria = rows.find((row) =>
      within(row).queryByText('Valeria Méndez y Andrés Rojas'),
    ) as HTMLElement;
    await userEvent.click(within(valeria).getByRole('link', { name: 'Ver perfil' }));

    const backPanel = await wowPanel();
    expect(within(backPanel).queryByText('Sugerida')).not.toBeInTheDocument();
  });
});

describe('notas del equipo', () => {
  it('se guardan al salir del campo', async () => {
    renderRoutes(routes, { route: VALERIA });

    const notes = await screen.findByLabelText('Notas del equipo');
    await userEvent.type(notes, 'Llegaron cansados del vuelo.');
    await userEvent.tab();

    expect(await screen.findByText('Notas guardadas')).toBeInTheDocument();

    const profile = await getGuestProfile('s-mendez-rojas');
    expect(profile.teamNotes).toBe('Llegaron cansados del vuelo.');
  });
});

describe('estadía que no existe', () => {
  it('ofrece el camino de vuelta', async () => {
    renderRoutes(routes, { route: '/staff/guests/s-inventada' });

    expect(await screen.findByText('No encontramos a ese huésped')).toBeInTheDocument();
  });

  it('lo mismo sin estadía en la URL', async () => {
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findByText('No encontramos a ese huésped')).toBeInTheDocument();
  });
});
