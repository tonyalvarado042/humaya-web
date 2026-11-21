import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { daysFromToday, resetMockState } from '@/mocks';
import { getDaySchedule } from '@/services/spa';
import { stubAdminApi, type StubServicio } from '@/test/adminApiStub';
import { dayParts } from '../format';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BookingsPage } from './BookingsPage';

const VALERIA = 's-mendez-rojas';

const ENTRENAMIENTO: StubServicio = {
  id: 'servicio-entrenamiento',
  nombre: 'Entrenamiento personal',
  descripcion: 'Sesión de entrenamiento personalizado.',
  proveedor: 'Alex Quesada',
  precio_usd: 150,
  unidad_precio: 'hora',
  duracion_min: 60,
  hora_inicio: '07:00',
  hora_fin: '10:00',
  habilitado: true,
  orden: 1,
};

beforeEach(() => {
  resetMockState();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('elegir instalación y día', () => {
  it('arranca en sauna con su descripción', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    expect(await screen.findByText(/45 minutos/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sauna' })).toBeChecked();
  });

  it('cambiar a cold plunge cambia la descripción', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('radio', { name: 'Cold plunge' }));

    expect(await screen.findByText(/20 minutos/)).toBeInTheDocument();
  });

  it('ofrece los días de la estadía desde hoy', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    // Los cuatro días de Valeria: hoy y los tres siguientes. Las etiquetas se
    // arman con el mismo formateador que usa la pantalla en vez de escribirlas
    // a mano: con fechas fijas, esta prueba envejecía junto con la demo.
    const esperados = [0, 1, 2, 3].map((dia) => {
      const partes = dayParts(daysFromToday(dia));
      return `${partes.weekday}${partes.day}`;
    });

    const days = await screen.findAllByRole('radio', { name: /\d/ });
    expect(days.map((day) => day.textContent)).toEqual(esperados);
  });
});

describe('horarios', () => {
  it('muestra los 9 horarios del spa', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    const slots = await screen.findAllByRole('button', { name: /^\d{2}:\d{2}/ });
    expect(slots).toHaveLength(9);
  });

  it('marca como ocupados los que ya están tomados', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    // El 14 de noviembre la Villa 08 tiene el sauna de las 17:00.
    expect(await screen.findByRole('button', { name: '17:00, ocupado' })).toBeDisabled();
  });
});

describe('confirmar una reserva', () => {
  it('el botón espera a que se elija un horario', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    expect(await screen.findByRole('button', { name: 'Elegí un horario' })).toBeDisabled();
  });

  it('la reserva confirmada aparece en la agenda de recepción', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('button', { name: '16:00' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reservar Sauna · 16:00' }));

    expect(await screen.findByText('Reservado')).toBeInTheDocument();

    const schedule = await getDaySchedule(daysFromToday(0));
    const row = schedule.rows.find((item) => item.time === '16:00');

    expect(row?.sauna).toEqual({
      stayId: VALERIA,
      guestName: 'Valeria Méndez y Andrés Rojas',
      villa: 4,
    });
  });

  it('el horario reservado queda ocupado en la grilla', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('button', { name: '20:00' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reservar Sauna · 20:00' }));

    expect(await screen.findByRole('button', { name: '20:00, ocupado' })).toBeDisabled();
  });

  it('"Cambiar" vuelve a dejar elegir', async () => {
    stubAdminApi();
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('button', { name: '16:00' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reservar Sauna · 16:00' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cambiar' }));

    expect(screen.getByRole('button', { name: 'Elegí un horario' })).toBeDisabled();
  });
});

describe('servicios agregados desde admin', () => {
  it('aparecen como una opción más, con su precio', async () => {
    stubAdminApi({ servicios: [ENTRENAMIENTO] });
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('radio', { name: 'Entrenamiento personal' }));

    expect(await screen.findByText(/Con Alex Quesada/)).toBeInTheDocument();
    expect(screen.getByText(/\$150\/hora/)).toBeInTheDocument();
  });

  it('se puede reservar, con su propia grilla de horarios', async () => {
    stubAdminApi({ servicios: [ENTRENAMIENTO] });
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await userEvent.click(await screen.findByRole('radio', { name: 'Entrenamiento personal' }));

    // 07:00 a 10:00 en bloques de 60 min: 3 horarios.
    const slots = await screen.findAllByRole('button', { name: /^\d{2}:\d{2}/ });
    expect(slots).toHaveLength(3);

    await userEvent.click(screen.getByRole('button', { name: '08:00' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Reservar Entrenamiento personal · 08:00' }),
    );

    expect(await screen.findByText('Reservado')).toBeInTheDocument();
  });

  it('un servicio deshabilitado no aparece en las opciones', async () => {
    stubAdminApi({ servicios: [{ ...ENTRENAMIENTO, habilitado: false }] });
    renderWithProviders(<BookingsPage />, { stayId: VALERIA });

    await screen.findByRole('radio', { name: 'Sauna' });
    expect(screen.queryByRole('radio', { name: 'Entrenamiento personal' })).not.toBeInTheDocument();
  });
});
