import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PantallaTv } from './PantallaTv';

const CLAVE = 'abc123def456';

function villa(campos: Partial<Record<string, unknown>> = {}) {
  return {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'v4-bruma',
    clave: CLAVE,
    nombre: 'V4 · BRUMA',
    tipo: 'Wellness villa',
    anfitrion: 'Tony',
    wifi_ssid: 'HUMAYA_Villas',
    wifi_clave: 'temporal-2026',
    wifi_siempre: true,
    huesped: 'Sarah Lovestad',
    llegada: '2026-11-20',
    salida: '2026-11-23',
    checkin: '15:00',
    checkout: '11:00',
    bienvenida: null,
    nota_titulo: null,
    nota_texto: null,
    foto: null,
    reloj_posicion: 'izquierda',
    habilitada: true,
    orden: 4,
    ...campos,
  };
}

beforeEach(() => {
  supabaseStub.tablas.humaya_tv_villas = [
    villa(),
    villa({ id: 'v1-capi-capi', nombre: 'V1 · CAPI CAPI', huesped: null, orden: 1 }),
  ];
});

describe('las pantallas del TV en Admin', () => {
  it('lista las villas y dice cuál está vacía', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'en' });

    expect(await screen.findByText('V1 · CAPI CAPI')).toBeInTheDocument();
    expect(screen.getByText('V4 · BRUMA')).toBeInTheDocument();
    expect(screen.getByText('With Sarah Lovestad')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('la dirección del televisor trae la clave, que es lo único que hay que escribir', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'en' });
    await screen.findByText('V4 · BRUMA');

    // El editor arranca cerrado: diez villas abiertas a la vez son ilegibles.
    expect(screen.queryByText(new RegExp(CLAVE))).not.toBeInTheDocument();

    const fila = screen.getByText('V4 · BRUMA').closest('div')?.parentElement as HTMLElement;
    await userEvent.click(within(fila).getByRole('button', { name: 'Edit' }));

    expect(await screen.findByText(new RegExp(`k=${CLAVE}`))).toBeInTheDocument();
  });

  it('avisa que la guía es la misma para todas las pantallas', async () => {
    // Sin decirlo, alguien la editaría villa por villa y terminaría con una
    // versión distinta de la misma regla en cada una.
    //
    // Decía «las diez pantallas», y esta prueba lo exigía. Abriendo la
    // pantalla contra el hotel demo el 21 de noviembre de 2026 —que tiene
    // dos villas— el aviso afirmaba diez. Un número inventado, sostenido por
    // una prueba en verde.
    renderWithProviders(<PantallaTv />, { recepcion: 'en' });

    expect(
      await screen.findByText(/It is the same for every screen in the hotel/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/diez pantallas/)).not.toBeInTheDocument();
  });

  it('cuando no hay ninguna villa, dice dónde se crean', async () => {
    supabaseStub.tablas.humaya_tv_villas = [];
    renderWithProviders(<PantallaTv />, { recepcion: 'en' });

    expect(await screen.findByText('There are no villas yet')).toBeInTheDocument();
  });
});
