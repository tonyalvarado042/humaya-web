import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { routes } from '@/router';
import { stubAdminApi, type StubServicio } from '@/test/adminApiStub';
import { renderRoutes } from '@/test/renderWithProviders';

const ENTRENAMIENTO: StubServicio = {
  id: 'servicio-entrenamiento',
  nombre: 'Entrenamiento personal',
  descripcion: 'Sesión de entrenamiento personalizado.',
  proveedor: 'Alex Quesada',
  precio_usd: 150,
  unidad_precio: 'hora',
  duracion_min: 60,
  hora_inicio: '07:00',
  hora_fin: '18:00',
  habilitado: true,
  orden: 1,
};

beforeEach(() => {
  resetMockState();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('opciones del menú', () => {
  it('lista las seis opciones con su estado', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin' });

    expect(await screen.findByRole('heading', { name: 'Mis datos' })).toBeInTheDocument();
    for (const label of ['Entrevista', 'Concierge', 'Mi villa', 'Reservas', 'Move']) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    }
    expect(screen.getAllByText('Habilitada')).toHaveLength(6);
  });

  it('deshabilitar una opción la saca de la lista del Home del huésped', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin' });

    const moveHeading = await screen.findByRole('heading', { name: 'Move' });
    const moveCard = moveHeading.closest('li') as HTMLElement;
    await userEvent.click(within(moveCard).getByRole('button', { name: 'Deshabilitar' }));

    expect(await within(moveCard).findByText('Deshabilitada')).toBeInTheDocument();
    expect(within(moveCard).getByRole('button', { name: 'Habilitar' })).toBeInTheDocument();
  });
});

describe('servicios de Reservas', () => {
  it('dice que todavía no hay ninguno', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin' });

    expect(await screen.findByText('Todavía no agregaste ningún servicio.')).toBeInTheDocument();
  });

  it('lista los que ya existen, con precio y proveedor', async () => {
    stubAdminApi({ servicios: [ENTRENAMIENTO] });
    renderRoutes(routes, { route: '/staff/admin' });

    expect(
      await screen.findByRole('heading', { name: 'Entrenamiento personal' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Alex Quesada/)).toBeInTheDocument();
    expect(screen.getByText(/\$150\/hora/)).toBeInTheDocument();
  });

  it('agregar un servicio nuevo lo suma a la lista', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin' });

    await screen.findByText('Todavía no agregaste ningún servicio.');

    await userEvent.type(screen.getByLabelText('Nombre'), 'Masaje relajante');
    await userEvent.type(screen.getByLabelText('Con quién'), 'Studio Humaya');
    await userEvent.type(screen.getByLabelText('Precio (USD)'), '80');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar servicio' }));

    expect(await screen.findByRole('heading', { name: 'Masaje relajante' })).toBeInTheDocument();
    expect(screen.getByText(/Studio Humaya/)).toBeInTheDocument();
    expect(screen.queryByText('Todavía no agregaste ningún servicio.')).not.toBeInTheDocument();
  });

  it('no deja guardar sin nombre', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin' });

    await screen.findByText('Todavía no agregaste ningún servicio.');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar servicio' }));

    expect(await screen.findByText('Escribí un nombre.')).toBeInTheDocument();
  });

  it('deshabilitar un servicio lo saca de las opciones de Reservas', async () => {
    stubAdminApi({ servicios: [ENTRENAMIENTO] });
    renderRoutes(routes, { route: '/staff/admin' });

    const heading = await screen.findByRole('heading', { name: 'Entrenamiento personal' });
    const card = heading.closest('li') as HTMLElement;
    await userEvent.click(within(card).getByRole('button', { name: 'Deshabilitar' }));

    expect(await within(card).findByText('Deshabilitada')).toBeInTheDocument();
  });
});
