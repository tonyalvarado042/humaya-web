import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderRoutes } from '@/test/renderWithProviders';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';

/**
 * Llegadas dejó los datos de ejemplo: ahora muestra las reservas de Cloudbeds.
 *
 * Las filas de abajo imitan lo que de verdad hay en `humaya_llegadas` el 15 de
 * noviembre de 2026 —una confirmada con villa, una sin correo, una sin
 * confirmar y una cancelada sin habitación asignada—, porque son justo los
 * casos donde una pantalla descuidada inventa datos: un cero donde no hay
 * gente, un guion donde debería decir "sin correo".
 */
const HOY = '2026-11-15';

const FILAS = [
  {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'r-1',
    reserva_id: '100',
    huesped: 'Galloway',
    email: 'g@ejemplo.com',
    checkin: '2026-12-17',
    checkout: '2026-12-21',
    estado: 'confirmed',
    fuente: 'Airbnb (API)',
    confirmacion_ota: 'HMMS93AC2K',
    villa: 'Villa 3',
    personas: '4',
  },
  {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'r-2',
    reserva_id: '101',
    huesped: 'Nakamura',
    email: null,
    checkin: '2026-12-19',
    checkout: '2026-12-23',
    estado: 'confirmed',
    fuente: 'Airbnb (API)',
    confirmacion_ota: 'HM2KX9PLQ4',
    villa: 'Villa 7',
    personas: '2',
  },
  {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'r-3',
    reserva_id: '102',
    huesped: 'Pérez',
    email: 'p@ejemplo.com',
    checkin: '2026-12-26',
    checkout: '2026-12-29',
    estado: 'not_confirmed',
    fuente: 'Website/Booking Engine',
    confirmacion_ota: null,
    villa: 'Villa 1',
    personas: '3',
  },
  {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'r-4',
    reserva_id: '103',
    huesped: 'Cancelada',
    email: 'c@ejemplo.com',
    checkin: '2026-12-20',
    checkout: '2026-12-22',
    estado: 'canceled',
    fuente: 'Expedia',
    confirmacion_ota: 'EXP-9',
    villa: null,
    personas: null,
  },
];

function tabla() {
  return screen.findByRole('table', { name: 'Bookings' });
}

beforeEach(() => {
  stubConciergeApi();
  supabaseStub.tablas.humaya_llegadas = [...FILAS];
  // La pantalla mira "hoy" para decidir qué está por delante.
  vi.setSystemTime(new Date(`${HOY}T12:00:00-06:00`));
});

describe('las reservas que se muestran', () => {
  it('arranca en las próximas y deja fuera las canceladas', async () => {
    renderRoutes(routes, { route: '/staff' });

    const filas = within(await tabla()).getAllByRole('row');
    // 1 encabezado + 3 activas. La cancelada no está.
    expect(filas).toHaveLength(4);
    expect(within(await tabla()).getByText('Galloway')).toBeInTheDocument();
    expect(within(await tabla()).queryByText('Cancelada')).not.toBeInTheDocument();
  });

  it('"Todas" sí trae la cancelada, marcada como tal', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    await userEvent.click(screen.getByRole('radio', { name: 'All' }));

    expect(await within(await tabla()).findByText('Cancelada')).toBeInTheDocument();
    expect(within(await tabla()).getByText('Cancelled')).toBeInTheDocument();
  });

  it('"No email" deja solo a quien no tiene correo', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    await userEvent.click(screen.getByRole('radio', { name: 'No email' }));

    const filas = within(await tabla()).getAllByRole('row');
    expect(filas).toHaveLength(2);
    expect(within(await tabla()).getByText('Nakamura')).toBeInTheDocument();
  });
});

describe('lo que no sabemos no se inventa', () => {
  it('dice "No email" en vez de dejar el espacio vacío', async () => {
    renderRoutes(routes, { route: '/staff' });

    const fila = within(await tabla())
      .getByText('Nakamura')
      .closest('tr')!;
    expect(within(fila).getByText('No email')).toBeInTheDocument();
  });

  it('una reserva sin habitación dice "Not assigned", no "Villa 0"', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();
    await userEvent.click(screen.getByRole('radio', { name: 'All' }));

    const fila = (await within(await tabla()).findByText('Cancelada')).closest('tr')!;
    expect(within(fila).getByText('Not assigned')).toBeInTheDocument();
    expect(within(fila).queryByText('0')).not.toBeInTheDocument();
  });

  it('muestra el código de confirmación que el huésped tiene en la mano', async () => {
    renderRoutes(routes, { route: '/staff' });

    const fila = within(await tabla())
      .getByText('Galloway')
      .closest('tr')!;
    expect(within(fila).getByText('HMMS93AC2K')).toBeInTheDocument();
  });
});

describe('los indicadores', () => {
  it('cuenta reservas, personas y las que no tienen correo', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    const cifra = (rotulo: string) =>
      screen.getByText(rotulo).parentElement!.textContent!.replace(rotulo, '').trim();

    expect(cifra('Upcoming bookings')).toBe('3');
    // 4 + 2 + 3. La cancelada no suma, y su `personas` nulo no vale cero.
    expect(cifra('Guests expected')).toBe('9');
    expect(cifra('Without an email')).toBe('1');
  });

  it('nombra la primera llegada real', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    const tarjeta = screen.getByText('First arrival').parentElement!;
    expect(tarjeta).toHaveTextContent('Dec 17');
  });
});

describe('el idioma de recepción', () => {
  it('abre en inglés y el menú lo pasa a español', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    expect(screen.getByRole('heading', { name: 'Bookings' })).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'Español' })[0]);

    expect(await screen.findByRole('heading', { name: 'Reservas' })).toBeInTheDocument();
    expect(await screen.findByRole('table', { name: 'Reservas' })).toBeInTheDocument();
  });
});

describe('la tabla en el teléfono', () => {
  /**
   * ── EL FALLO QUE ESTO AGARRA ────────────────────────────────
   * Son siete columnas: la tabla necesita 838 px. En un teléfono de 375 eso
   * desplazaba la PÁGINA de lado —la barra de arriba se corría con ella— en
   * vez de desplazarse la tabla sola. Medido entrando, el 25 de noviembre de
   * 2026: `scrollWidth` 838 contra `clientWidth` 375.
   *
   * ── Y POR QUÉ ESTA PRUEBA NO LO MIDE ──────────────────────────
   * Porque jsdom no calcula CSS: acá todo mide cero y un `scrollWidth` no
   * diría nada. Lo que esta prueba fija es la INTENCIÓN —que la tabla tenga
   * su propia caja que se desplaza— para que nadie la saque sin darse cuenta.
   * La medida de verdad se toma en el navegador, con el teléfono emulado.
   */
  it('se desliza dentro de su caja, no arrastra la página', async () => {
    renderRoutes(routes, { route: '/staff' });

    const caja = (await tabla()).closest('[role="region"]');
    expect(caja).toHaveClass('overflow-x-auto');
  });

  it('y esa caja se puede desplazar con el teclado', async () => {
    renderRoutes(routes, { route: '/staff' });

    const caja = (await tabla()).closest('[role="region"]');
    expect(caja).toHaveAttribute('tabindex', '0');
  });
});

describe('el demo, mientras Admin lo deje encendido', () => {
  it('se ofrece como una vista más de Llegadas', async () => {
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    await userEvent.click(screen.getByRole('radio', { name: 'Demo' }));

    // La pantalla vieja entera, con su aviso de que son datos inventados.
    expect(
      await screen.findByRole('table', { name: 'Arrivals in the period' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sample data/)).toBeInTheDocument();
  });

  it('apagado en Admin, la opción desaparece', async () => {
    // Así queda la base cuando Tony apaga el interruptor antes de publicar.
    supabaseStub.tablas.humaya_ajustes = [
      { negocio_id: NEGOCIO_DE_PRUEBA, clave: 'demo_visible', valor: false },
    ];
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    expect(screen.queryByRole('radio', { name: 'Demo' })).not.toBeInTheDocument();
    // Y las reservas de verdad siguen ahí.
    expect(screen.getByRole('radio', { name: 'Upcoming' })).toBeInTheDocument();
  });

  /**
   * El ajuste de OTRO hotel no manda acá.
   *
   * Hasta el 21 de noviembre de 2026 sí mandaba: `getAjustes` leía la tabla
   * entera sin filtrar y `setDemoVisible` ESCRIBÍA en todos los hoteles que
   * tuvieran una propiedad. Apagar el demo en uno se lo apagaba a los otros.
   */
  it('apagarlo en otro hotel no lo apaga acá', async () => {
    supabaseStub.tablas.humaya_ajustes = [
      { negocio_id: 'otro-hotel', clave: 'demo_visible', valor: false },
    ];
    renderRoutes(routes, { route: '/staff' });
    await tabla();

    expect(screen.getByRole('radio', { name: 'Demo' })).toBeInTheDocument();
  });
});
