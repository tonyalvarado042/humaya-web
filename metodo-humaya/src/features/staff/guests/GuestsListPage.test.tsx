import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { diaSiguiente, hoyEnCostaRica } from '@/services/clock';
import { supabaseStub } from '@/test/supabaseStub';
import { renderRoutes } from '@/test/renderWithProviders';

/** Una fila de `humaya_llegadas`, como la devuelve la vista. */
function llegada(campos: {
  id: string;
  huesped: string;
  checkin: string;
  checkout: string;
  villa?: string | null;
  personas?: number | null;
  estado?: string;
}) {
  return {
    id: campos.id,
    reserva_id: `R-${campos.id}`,
    huesped: campos.huesped,
    email: null,
    checkin: campos.checkin,
    checkout: campos.checkout,
    estado: campos.estado ?? 'confirmed',
    fuente: 'Airbnb (API)',
    confirmacion_ota: `HM${campos.id.toUpperCase()}`,
    villa: campos.villa ?? 'Villa 04',
    personas: campos.personas ?? 2,
  };
}

const hoy = hoyEnCostaRica();
const manana = diaSiguiente(hoy);
const pasado = diaSiguiente(manana);

beforeEach(() => {
  // `hoyEnCostaRica` consulta el desfase del reloj contra el servidor.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));

  supabaseStub.tablas.humaya_llegadas = [
    // Está en la casa y se va pasado mañana: noche 2 de 3.
    llegada({
      id: 'encasa',
      huesped: 'Sarah Lovestad',
      checkin: diaSiguienteAlReves(hoy),
      checkout: pasado,
      villa: 'Villa 02',
      personas: 2,
    }),
    // Llega hoy.
    llegada({ id: 'llega', huesped: 'Connor Galloway', checkin: hoy, checkout: pasado }),
    // Se va hoy.
    llegada({
      id: 'sale',
      huesped: 'Hannah Weber',
      checkin: diaSiguienteAlReves(hoy),
      checkout: hoy,
      villa: 'Villa 07',
    }),
    // Todavía no llegó: no está en la casa.
    llegada({ id: 'futura', huesped: 'Nadie Todavia', checkin: pasado, checkout: pasado }),
  ];
});

/** Un día antes. No hay helper para atrás y acá hace falta para armar el caso. */
function diaSiguienteAlReves(fecha: string): string {
  const dia = new Date(`${fecha}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() - 1);
  return dia.toISOString().slice(0, 10);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('la lista de huéspedes', () => {
  it('ya no lleva a «No encontramos a ese huésped»', async () => {
    // Era un destino del menú que no llevaba a ninguna parte.
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findAllByText('Sarah Lovestad')).not.toHaveLength(0);
    expect(screen.queryByText('No encontramos a ese huésped')).not.toBeInTheDocument();
  });

  it('muestra en la casa a quien llega hoy, a quien está y a quien se va hoy', async () => {
    renderRoutes(routes, { route: '/staff/guests' });

    await screen.findAllByText('Sarah Lovestad');
    expect(screen.getAllByText('Connor Galloway')).not.toHaveLength(0);
    expect(screen.getAllByText('Hannah Weber')).not.toHaveLength(0);
    // Esa reserva todavía no empezó: no está en la casa.
    expect(screen.queryAllByText('Nadie Todavia')).toHaveLength(0);
  });

  it('dice en qué noche va cada quien', async () => {
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findAllByText('Night 2 of 3')).not.toHaveLength(0);
  });

  it('marca a quien se va hoy, que es lo que cambia la atención', async () => {
    renderRoutes(routes, { route: '/staff/guests' });

    await screen.findAllByText('Sarah Lovestad');
    expect(screen.getAllByText('Leaves today')).not.toHaveLength(0);
  });

  it('«Arriving today» deja solo a los que llegan hoy', async () => {
    renderRoutes(routes, { route: '/staff/guests' });
    await screen.findAllByText('Sarah Lovestad');

    await userEvent.click(screen.getByRole('radio', { name: 'Arriving today' }));

    expect(await screen.findAllByText('Connor Galloway')).not.toHaveLength(0);
    expect(screen.queryAllByText('Sarah Lovestad')).toHaveLength(0);
  });

  it('explica por qué no hay botón de ficha, en vez de poner uno que rebote', async () => {
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findByText(/only exists for the two demo stays/)).toBeInTheDocument();
  });
});

describe('cuando la casa está vacía', () => {
  it('lo dice en vez de dejar la pantalla en blanco', async () => {
    supabaseStub.tablas.humaya_llegadas = [
      llegada({ id: 'futura', huesped: 'Nadie Todavia', checkin: pasado, checkout: pasado }),
    ];
    renderRoutes(routes, { route: '/staff/guests' });

    expect(await screen.findByText('Nobody is in the house today')).toBeInTheDocument();
  });
});
