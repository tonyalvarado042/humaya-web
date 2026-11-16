import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { bookSlot } from '@/services/spa';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

beforeEach(() => {
  resetMockState();
  stubConciergeApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function schedule() {
  return screen.findByRole('table', { name: 'Agenda del día' });
}

describe('agenda del 15 de noviembre', () => {
  it('muestra la fecha del día', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    expect(await screen.findByText(/Domingo 15 de noviembre/)).toBeInTheDocument();
  });

  it('cuenta 5 reservas de sauna y 4 de cold plunge', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    await schedule();
    const sauna = screen.getByText('Reservas de sauna').closest('div')?.parentElement;
    const cold = screen.getByText('Reservas de cold plunge').closest('div')?.parentElement;

    expect(within(sauna as HTMLElement).getByText('5')).toBeInTheDocument();
    expect(within(cold as HTMLElement).getByText('4')).toBeInTheDocument();
  });

  it('abre los 9 horarios del spa', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    // 9 horarios más la fila del encabezado.
    expect(within(await schedule()).getAllByRole('row')).toHaveLength(10);
  });

  it('pone a Valeria en el sauna de las 17:00, con su villa', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    const rows = within(await schedule()).getAllByRole('row');
    const row = rows.find((item) => within(item).queryByText('17:00')) as HTMLElement;

    expect(within(row).getByText('Valeria Méndez y Andrés Rojas')).toBeInTheDocument();
    expect(within(row).getAllByText('Villa 04').length).toBeGreaterThan(0);
  });

  it('la próxima sesión es la primera con reserva', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    await schedule();
    const next = screen.getByText('Próxima sesión').closest('div')?.parentElement;
    expect(within(next as HTMLElement).getByText('06:00')).toBeInTheDocument();
  });
});

describe('una reserva hecha desde la app del huésped', () => {
  it('aparece en la agenda de recepción', async () => {
    await bookSlot('cold_plunge', '2026-11-15T21:00:00-06:00', 's-keller');

    renderRoutes(routes, { route: '/staff/spa' });

    const rows = within(await schedule()).getAllByRole('row');
    const row = rows.find((item) => within(item).queryByText('21:00')) as HTMLElement;

    expect(within(row).getByText('Familia Keller')).toBeInTheDocument();
    expect(within(row).getByText('Villa 07')).toBeInTheDocument();
  });
});

describe('las dos presentaciones', () => {
  it('los horarios libres se resumen en la vista angosta', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    await schedule();
    // 16:00 y 21:00 no tienen ninguna reserva ese día.
    expect(screen.getByText(/^Libre:/)).toBeInTheDocument();
  });

  it('cada horario con reserva tiene su tarjeta además de su fila', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    await schedule();
    // En la tabla y en la tarjeta: la hora aparece dos veces.
    expect(screen.getAllByText('17:00')).toHaveLength(2);
  });
});
