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

describe('servicios de Reservas', () => {
  it('dice que todavía no hay ninguno', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin/servicios' });

    expect(await screen.findByText('You have not added any service yet.')).toBeInTheDocument();
  });

  it('lista los que ya existen, con precio y proveedor', async () => {
    stubAdminApi({ servicios: [ENTRENAMIENTO] });
    renderRoutes(routes, { route: '/staff/admin/servicios' });

    expect(
      await screen.findByRole('heading', { name: 'Entrenamiento personal' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Alex Quesada/)).toBeInTheDocument();
    expect(screen.getByText(/\$150\/hora/)).toBeInTheDocument();
  });

  it('agregar un servicio nuevo lo suma a la lista', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin/servicios' });

    await screen.findByText('You have not added any service yet.');

    await userEvent.type(screen.getByLabelText('Name'), 'Masaje relajante');
    await userEvent.type(screen.getByLabelText('With whom'), 'Studio Humaya');
    await userEvent.type(screen.getByLabelText('Price (USD)'), '80');
    await userEvent.click(screen.getByRole('button', { name: 'Save service' }));

    expect(await screen.findByRole('heading', { name: 'Masaje relajante' })).toBeInTheDocument();
    expect(screen.getByText(/Studio Humaya/)).toBeInTheDocument();
    expect(screen.queryByText('You have not added any service yet.')).not.toBeInTheDocument();
  });

  it('no deja guardar sin nombre', async () => {
    stubAdminApi();
    renderRoutes(routes, { route: '/staff/admin/servicios' });

    await screen.findByText('You have not added any service yet.');
    await userEvent.click(screen.getByRole('button', { name: 'Save service' }));

    expect(await screen.findByText('Write a name.')).toBeInTheDocument();
  });

  it('deshabilitar un servicio lo saca de las opciones de Reservas', async () => {
    stubAdminApi({ servicios: [ENTRENAMIENTO] });
    renderRoutes(routes, { route: '/staff/admin/servicios' });

    const heading = await screen.findByRole('heading', { name: 'Entrenamiento personal' });
    const card = heading.closest('li') as HTMLElement;
    await userEvent.click(within(card).getByRole('button', { name: 'Disable' }));

    expect(await within(card).findByText('Disabled')).toBeInTheDocument();
  });
});
