import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PantallaTv } from './PantallaTv';

/**
 * «Alrededor»: los lugares que el televisor le recomienda al huésped.
 *
 * ── DE DÓNDE SALE ESTO ──────────────────────────────────────────────────
 * Tony, 21 de noviembre de 2026, mirando la pantalla del televisor en vivo:
 * «¿cómo se cambia around here? poner más cosas».
 *
 * Hasta ese día la respuesta era «en la base, en la columna `guia` de
 * humaya_tv_ajustes». Eso no es una respuesta: es pedirle al hotel que
 * escriba JSON para agregar un restaurante.
 *
 * ── LO QUE ESTA PRUEBA CUIDA ────────────────────────────────────────────
 * Lo que más caro sale si se rompe: que guardar «Alrededor» NO se lleve
 * puesto el resto de la guía. `guia` es un jsonb entero —reglas, pasos de
 * salida, emergencias— y la pantalla solo edita un pedazo. Si mandara el
 * objeto armado desde el formulario, borraría los teléfonos de emergencia
 * sin que nadie se diera cuenta hasta que un huésped los necesitara.
 */

const GUIA = {
  welcome: 'Bienvenido',
  rules: ['No fumar adentro'],
  emergency: [{ name: 'Cruz Roja', phone: '911' }],
  local: [
    {
      category: 'Comer',
      items: [{ name: 'Don Rufino', distance: 'En La Fortuna', note: 'Parrilla del centro.' }],
    },
  ],
};

beforeEach(() => {
  supabaseStub.tablas.humaya_tv_villas = [];
  supabaseStub.tablas.humaya_tv_ocupacion = [];
  supabaseStub.tablas.humaya_tv_ajustes = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      wifi_ssid: null,
      wifi_clave: null,
      wifi_siempre: true,
      foto: null,
      guia: GUIA,
    },
  ];
});

describe('los lugares de Alrededor', () => {
  it('se ven los que ya están, y cuántos son', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });

    expect(await screen.findByText('Alrededor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Don Rufino')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Comer')).toBeInTheDocument();
    expect(screen.getByText('1 lugar')).toBeInTheDocument();
  });

  it('se puede agregar uno más', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    await screen.findByText('Alrededor');

    await userEvent.click(screen.getByRole('button', { name: 'Agregar lugar' }));

    expect(screen.getByText('2 lugares')).toBeInTheDocument();
  });

  it('guardar NO se lleva puesto el resto de la guía', async () => {
    // EL QUE IMPORTA. Las reglas y las emergencias no se editan acá, y tienen
    // que seguir ahí después de guardar un restaurante.
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    await screen.findByText('Alrededor');

    const alrededor = screen.getByText('Alrededor').closest('form') as HTMLElement;
    await userEvent.click(within(alrededor).getByRole('button', { name: 'Guardar' }));

    const fila = supabaseStub.tablas.humaya_tv_ajustes[0] as { guia: Record<string, unknown> };
    expect(fila.guia.rules).toEqual(['No fumar adentro']);
    expect(fila.guia.emergency).toEqual([{ name: 'Cruz Roja', phone: '911' }]);
    expect(fila.guia.welcome).toBe('Bienvenido');
  });

  it('un lugar sin nombre no se guarda', async () => {
    // Una tarjeta sin nombre en el televisor es una tarjeta que el huésped
    // no entiende.
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    await screen.findByText('Alrededor');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar lugar' }));

    const alrededor = screen.getByText('Alrededor').closest('form') as HTMLElement;
    await userEvent.click(within(alrededor).getByRole('button', { name: 'Guardar' }));

    const fila = supabaseStub.tablas.humaya_tv_ajustes[0] as {
      guia: { local: { items: unknown[] }[] };
    };
    expect(fila.guia.local[0].items).toHaveLength(1);
  });
});
