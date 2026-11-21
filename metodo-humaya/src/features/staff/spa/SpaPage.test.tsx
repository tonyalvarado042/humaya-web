import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '@/router';
import { diaSiguiente, hoyEnCostaRica } from '@/services/clock';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { renderRoutes } from '@/test/renderWithProviders';

const ENTRENADOR = '11111111-1111-1111-1111-111111111111';
const MASAJE = '22222222-2222-2222-2222-222222222222';

/**
 * La fecha que la pantalla tenía escrita en el código hasta el 17 de
 * noviembre de 2026. Quedó acá como guardia: si alguien vuelve a fijar un día,
 * el primer test de abajo lo agarra. Es una fecha pasada, así que no puede
 * volver a coincidir con «hoy».
 */
const LA_FECHA_QUE_ESTABA_FIJA = '2026-11-15';

beforeEach(() => {
  // La pantalla no llama a ninguna función, pero el reloj corregido mide el
  // desfase contra el servidor. Sin esto, la suite saldría a la red.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })));

  supabaseStub.tablas.humaya_servicios = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: ENTRENADOR,
      nombre: 'Entrenamiento personal',
      proveedor: 'Personal trainer',
      duracion_min: 60,
      habilitado: true,
      orden: 1,
    },
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: MASAJE,
      nombre: 'Masaje',
      proveedor: null,
      duracion_min: 90,
      habilitado: true,
      orden: 2,
    },
  ];

  supabaseStub.tablas.humaya_servicio_reservas = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: 'r-hoy',
      servicio_id: ENTRENADOR,
      stay_id: 's-weber',
      guest_name: 'Hannah Weber',
      fecha: hoyEnCostaRica(),
      hora_inicio: '16:00:00',
    },
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: 'r-manana',
      servicio_id: ENTRENADOR,
      stay_id: 's-mendez-rojas',
      guest_name: 'Valeria Méndez',
      fecha: diaSiguiente(hoyEnCostaRica()),
      hora_inicio: '08:00:00',
    },
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      id: 'r-de-la-fecha-fija',
      servicio_id: ENTRENADOR,
      stay_id: 's-keller',
      guest_name: 'Familia Keller',
      fecha: LA_FECHA_QUE_ESTABA_FIJA,
      hora_inicio: '17:00:00',
    },
  ];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('la agenda de servicios', () => {
  it('abre en el día de verdad, no en una fecha fija del código', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    // Cada reserva sale dos veces: en la tabla ancha y en la tarjeta
    // angosta. Las dos están en el DOM; solo el CSS decide cuál se ve.
    expect(await screen.findAllByText('Hannah Weber')).not.toHaveLength(0);
    expect(screen.queryAllByText('Familia Keller')).toHaveLength(0);
  });

  it('muestra la hora, el huésped y con quién es el servicio', async () => {
    renderRoutes(routes, { route: '/staff/spa' });

    await screen.findAllByText('Hannah Weber');
    expect(screen.getAllByText('4:00 p.m.').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/With Personal trainer · 60 min/).length).toBeGreaterThan(0);
  });

  it('cambiar a mañana trae lo de mañana y saca lo de hoy', async () => {
    renderRoutes(routes, { route: '/staff/spa' });
    await screen.findAllByText('Hannah Weber');

    await userEvent.click(screen.getByRole('radio', { name: 'Tomorrow' }));

    expect(await screen.findAllByText('Valeria Méndez')).not.toHaveLength(0);
    expect(screen.queryAllByText('Hannah Weber')).toHaveLength(0);
  });

  it('por servicio dice cuál no tiene a nadie anotado', async () => {
    // Que el masaje esté vacío es información, no una fila que sobra.
    renderRoutes(routes, { route: '/staff/spa' });
    await screen.findAllByText('Hannah Weber');

    await userEvent.click(screen.getByRole('radio', { name: 'By service' }));

    expect(await screen.findByText('Masaje')).toBeInTheDocument();
    expect(screen.getByText('Nobody booked on these days.')).toBeInTheDocument();
  });

  it('explica que el sauna y el cold plunge no llegan acá', async () => {
    // Callarlo haría que recepción concluya que nadie los usa.
    renderRoutes(routes, { route: '/staff/spa' });

    expect(
      await screen.findByText(/Sauna and cold plunge do not show up here/),
    ).toBeInTheDocument();
  });
});

describe('cuando no hay nada reservado', () => {
  it('lo dice en vez de dejar la pantalla en blanco', async () => {
    supabaseStub.tablas.humaya_servicio_reservas = [];
    renderRoutes(routes, { route: '/staff/spa' });

    expect(await screen.findByText('Nothing booked for these days')).toBeInTheDocument();
  });

  it('y si tampoco hay catálogo, dice dónde se agregan', async () => {
    supabaseStub.tablas.humaya_servicios = [];
    supabaseStub.tablas.humaya_servicio_reservas = [];
    renderRoutes(routes, { route: '/staff/spa' });

    expect(await screen.findByText('There are no services in the catalog')).toBeInTheDocument();
  });
});
