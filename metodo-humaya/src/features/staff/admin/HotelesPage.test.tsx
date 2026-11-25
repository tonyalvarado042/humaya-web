import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { supabaseStub } from '@/test/supabaseStub';
import { HotelesPage } from './HotelesPage';

/**
 * El panel de súper admin: crear hoteles y decir quién trabaja en cada uno.
 *
 * ── LAS DOS COSAS QUE ESTO AGARRA ───────────────────────────────────────
 * Tony, 24 de noviembre de 2026, mirando esta pantalla: «botones sin click,
 * y no sale ambos enlaces de huésped y de staff, ¿por qué?».
 *
 *  1. La ficha mostraba UNA dirección, armada a mano pegándole el código a
 *     `guestexp.liderax10.com`. Para HUMAYA era falsa —su dirección es
 *     `experience.stayhumaya.com`— y la de recepción no estaba en ninguna
 *     parte.
 *  2. «Quién trabaja acá» abría un panel al FINAL de la página, debajo de
 *     todos los hoteles y muchas veces fuera de la pantalla, sin decir de
 *     qué hotel era. Clic sin cambio visible es, para quien lo usa, un botón
 *     que no hace nada.
 */

const HOTELES = [
  {
    negocio_id: 'n-humaya',
    codigo: 'humaya',
    nombre: 'HUMAYA',
    marca_hotel: 'HUMAYA',
    marca_experiencia: 'HUMAYA Experience',
    correo: 'reservations@stayhumaya.com',
    origen_reservas: 'cloudbeds',
    es_demo: false,
    activo: true,
    usuarios: 0,
    reservas: 67,
    // Dominio propio: NO vive en el compartido.
    url_huesped: 'https://experience.stayhumaya.com',
    url_personal: 'https://staff.stayhumaya.com/staff',
    // Dominio propio: la portada NO lleva `?hotel=`, no hay nada que elegir.
    url_portada: 'https://staff.stayhumaya.com/staff/inicio',
  },
  {
    negocio_id: 'n-bikeandbed',
    codigo: 'bikeandbed',
    nombre: 'Bike & Bed by Humaya',
    marca_hotel: 'Bike & Bed by Humaya',
    marca_experiencia: 'Bike & Bed Experience',
    correo: 'hola@bikeandbed.com',
    origen_reservas: 'cloudbeds',
    es_demo: false,
    activo: true,
    usuarios: 0,
    reservas: 0,
    url_huesped: 'https://guestexp.liderax10.com/bikeandbed',
    url_personal: 'https://hotelexp.liderax10.com/staff',
    url_portada: 'https://hotelexp.liderax10.com/staff/inicio?hotel=bikeandbed',
  },
];

const EQUIPO = [
  {
    usuario_id: 'u-tony',
    email: 'tony@stayhumaya.com',
    nombre: 'Tony',
    rol: 'administrador',
    asignado: true,
  },
  {
    usuario_id: 'u-luis',
    email: 'lm@puromtb.com',
    nombre: 'LUIS MANUEL M',
    rol: 'vendedor',
    asignado: false,
  },
];

beforeEach(() => {
  supabaseStub.rpcs.humaya_soy_plataforma = true;
  supabaseStub.rpcs.humaya_hoteles_todos = HOTELES;
  supabaseStub.rpcs.humaya_equipo_del_hotel = EQUIPO;
});

/** La ficha de un hotel, para no preguntarle a la página entera. */
function ficha(nombre: string) {
  const titulo = screen.getByRole('heading', { name: nombre, level: 3 });
  const li = titulo.closest('li');
  if (!li) throw new Error(`la ficha de ${nombre} no está en un <li>`);
  return within(li);
}

describe('las direcciones de cada hotel', () => {
  it('muestra las DOS, la del huésped y la de recepción', async () => {
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    expect(bike.getByText('Por acá entra el huésped')).toBeInTheDocument();
    expect(
      bike.getByRole('link', { name: 'https://guestexp.liderax10.com/bikeandbed' }),
    ).toBeInTheDocument();
    expect(bike.getByText('Por acá entra recepción')).toBeInTheDocument();
    expect(
      bike.getByRole('link', { name: 'https://hotelexp.liderax10.com/staff' }),
    ).toBeInTheDocument();
  });

  /**
   * La tercera direccion, la que Tony no encontraba.
   *
   * «No veo la direccion de landing de Bike & Bed. No es ninguna de estas»,
   * dijo el 24 de noviembre de 2026 sobre la tabla de dos columnas. Tenia
   * razon: la portada vive en `/staff/inicio` y en el dominio compartido le
   * hace falta `?hotel=<codigo>` para decir de que hotel es.
   */
  it('muestra la direccion de la landing, y en el dominio compartido con su hotel', async () => {
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    expect(bike.getByText('La landing del hotel (todos sus enlaces)')).toBeInTheDocument();
    expect(
      bike.getByRole('link', {
        name: 'https://hotelexp.liderax10.com/staff/inicio?hotel=bikeandbed',
      }),
    ).toBeInTheDocument();

    // Y con dominio propio, sin parametro: ahi lo dice el dominio.
    expect(
      ficha('HUMAYA').getByRole('link', { name: 'https://staff.stayhumaya.com/staff/inicio' }),
    ).toBeInTheDocument();
  });

  /**
   * El caso que la versión anterior se equivocaba: HUMAYA tiene dominio
   * propio. Pegarle el código al dominio compartido daba
   * `guestexp.liderax10.com/humaya`, que no es su dirección.
   */
  it('respeta el dominio propio de un hotel en vez de inventar el compartido', async () => {
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'HUMAYA', level: 3 });

    const humaya = ficha('HUMAYA');
    expect(
      humaya.getByRole('link', { name: 'https://experience.stayhumaya.com' }),
    ).toBeInTheDocument();
    expect(
      humaya.getByRole('link', { name: 'https://staff.stayhumaya.com/staff' }),
    ).toBeInTheDocument();
    expect(humaya.queryByText(/guestexp\.liderax10\.com\/humaya/)).not.toBeInTheDocument();
  });
});

describe('quién trabaja acá', () => {
  it('abre la lista DENTRO de la ficha del hotel que se tocó', async () => {
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    await userEvent.click(
      ficha('Bike & Bed by Humaya').getByRole('button', { name: 'Quién trabaja acá' }),
    );

    // Dentro de la ficha que se tocó…
    expect(await ficha('Bike & Bed by Humaya').findByText('LUIS MANUEL M')).toBeInTheDocument();
    // …y en ninguna otra. Antes vivía suelto al final de la página, así que
    // esta afirmación habría fallado por los dos lados.
    expect(ficha('HUMAYA').queryByText('LUIS MANUEL M')).not.toBeInTheDocument();
  });

  it('el mismo botón la cierra, y lo dice', async () => {
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    const bike = ficha('Bike & Bed by Humaya');
    await userEvent.click(bike.getByRole('button', { name: 'Quién trabaja acá' }));
    await bike.findByText('LUIS MANUEL M');

    await userEvent.click(bike.getByRole('button', { name: 'Ocultar quién trabaja acá' }));
    expect(bike.queryByText('LUIS MANUEL M')).not.toBeInTheDocument();
  });

  /**
   * Sin esto, abrir el equipo de un hotel mostraba por un instante el del
   * anterior —con sus casillas marcadas—, que es lo peor que puede mostrar
   * de más esta pantalla.
   */
  it('no le enseña a un hotel el equipo del otro mientras carga', async () => {
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'Bike & Bed by Humaya', level: 3 });

    await userEvent.click(
      ficha('Bike & Bed by Humaya').getByRole('button', { name: 'Quién trabaja acá' }),
    );
    await ficha('Bike & Bed by Humaya').findByText('LUIS MANUEL M');

    await userEvent.click(ficha('HUMAYA').getByRole('button', { name: 'Quién trabaja acá' }));

    // La de Bike & Bed se cerró: solo hay una abierta a la vez.
    expect(ficha('Bike & Bed by Humaya').queryByText('LUIS MANUEL M')).not.toBeInTheDocument();
    expect(await ficha('HUMAYA').findByText('LUIS MANUEL M')).toBeInTheDocument();
  });

  it('si la base no contesta, lo dice en vez de dejar la ficha vacía', async () => {
    delete supabaseStub.rpcs.humaya_equipo_del_hotel;
    renderWithProviders(<HotelesPage />, { recepcion: 'es' });
    await screen.findByRole('heading', { name: 'HUMAYA', level: 3 });

    await userEvent.click(ficha('HUMAYA').getByRole('button', { name: 'Quién trabaja acá' }));

    expect(await screen.findByText('No pudimos cargar los hoteles.')).toBeInTheDocument();
  });
});
