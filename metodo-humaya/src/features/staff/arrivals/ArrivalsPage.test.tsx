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

/** La tabla de escritorio, para consultar filas sin toparse con las tarjetas. */
function table() {
  return screen.findByRole('table', { name: 'Llegadas del período' });
}

describe('filtro de período', () => {
  it('arranca en hoy, con las 4 llegadas del 14 de noviembre', async () => {
    renderRoutes(routes, { route: '/staff' });

    expect(await screen.findByRole('radio', { name: 'Hoy' })).toBeChecked();
    // La fila del encabezado cuenta como una más.
    expect(within(await table()).getAllByRole('row')).toHaveLength(5);
  });

  it('cambiar a mañana cambia las filas', async () => {
    renderRoutes(routes, { route: '/staff' });

    await userEvent.click(await screen.findByRole('radio', { name: 'Mañana' }));

    expect(await within(await table()).findByText('Sofía Arias')).toBeInTheDocument();
    expect(
      within(await table()).queryByText('Valeria Méndez y Andrés Rojas'),
    ).not.toBeInTheDocument();
  });

  it('la semana trae las 9 llegadas', async () => {
    renderRoutes(routes, { route: '/staff' });

    await userEvent.click(await screen.findByRole('radio', { name: 'Esta semana' }));

    expect(await within(await table()).findByText('Hannah Weber')).toBeInTheDocument();
    expect(within(await table()).getAllByRole('row')).toHaveLength(10);
  });
});

describe('indicadores', () => {
  it('muestra las cifras del día', async () => {
    renderRoutes(routes, { route: '/staff' });

    expect(await screen.findByText('Llegadas hoy')).toBeInTheDocument();
    expect(screen.getByText('Ocupación esta noche')).toBeInTheDocument();
    expect(screen.getByText(/de 10/)).toBeInTheDocument();
    expect(screen.getByText('Experiencias WOW por preparar')).toBeInTheDocument();
  });
});

describe('alertas', () => {
  it('la alergia se lee como texto, no solo por el color', async () => {
    renderRoutes(routes, { route: '/staff' });

    expect(
      await within(await table()).findByText('Andrés: alergia a frutos secos'),
    ).toBeInTheDocument();
  });
});

describe('ir al perfil', () => {
  it('cada llegada enlaza a su propia estadía', async () => {
    renderRoutes(routes, { route: '/staff' });

    const rows = within(await table()).getAllByRole('row');
    // Por el nombre exacto: la fila también dice "Valeria no toma alcohol".
    const valeria = rows.find((row) => within(row).queryByText('Valeria Méndez y Andrés Rojas'));

    expect(
      within(valeria as HTMLElement).getByRole('link', { name: 'Ver perfil' }),
    ).toHaveAttribute('href', '/staff/guests/s-mendez-rojas');
  });

  it('abre el perfil correcto al hacer clic', async () => {
    const { router } = renderRoutes(routes, { route: '/staff' });

    const rows = within(await table()).getAllByRole('row');
    const keller = rows.find((row) => within(row).queryByText(/Keller/)) as HTMLElement;
    await userEvent.click(within(keller).getByRole('link', { name: 'Ver perfil' }));

    expect(router.state.location.pathname).toBe('/staff/guests/s-keller');
  });
});

describe('las dos presentaciones', () => {
  it('la tabla y las tarjetas muestran los mismos huéspedes', async () => {
    renderRoutes(routes, { route: '/staff' });

    await screen.findByRole('table', { name: 'Llegadas del período' });

    // Cada huésped aparece dos veces: una en la tabla y otra en su tarjeta.
    // Tailwind decide cuál se ve; jsdom no calcula CSS.
    expect(screen.getAllByText('Valeria Méndez y Andrés Rojas')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Ver perfil' })).toHaveLength(8);
  });
});

describe('aviso del Concierge', () => {
  it('muestra cuántos mensajes quedaron sin leer junto al nombre', async () => {
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

    const rows = within(await table()).getAllByRole('row');
    const valeria = rows.find((row) => within(row).queryByText('Valeria Méndez y Andrés Rojas'));

    expect(await within(valeria as HTMLElement).findByText('1')).toBeInTheDocument();
  });
});

describe('tablero de villas y pendientes', () => {
  it('muestra las 10 villas con su estado', async () => {
    renderRoutes(routes, { route: '/staff' });

    expect(await screen.findByRole('heading', { name: 'Villas' })).toBeInTheDocument();
    expect(screen.getAllByText('Llega hoy')).toHaveLength(4);
    expect(screen.getByText('Sale hoy')).toBeInTheDocument();
    expect(screen.getByText('Libre')).toBeInTheDocument();
  });

  it('lista lo que hay que preparar hoy, con su villa y su hora', async () => {
    renderRoutes(routes, { route: '/staff' });

    expect(await screen.findByRole('heading', { name: 'Preparar hoy' })).toBeInTheDocument();
    expect(
      await screen.findByText(/Flores de la zona y una nota escrita a mano/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Villa 04 · antes de las/)).toBeInTheDocument();
  });
});
