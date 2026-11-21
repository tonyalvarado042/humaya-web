import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PantallaTv } from './PantallaTv';

/**
 * El Wi-Fi y la foto son del hotel, no de cada villa.
 *
 * ── DE DÓNDE SALE ESTO ──────────────────────────────────────────────────
 * Tony, 21 de noviembre de 2026, con la pantalla abierta:
 *
 *   «la wifi y la foto deben ser para todo, no por villa,
 *    ¿por qué lo hiciste así sin preguntar?»
 *
 * Los datos le dieron la razón sin discusión: las diez villas de HUMAYA
 * tenían el MISMO `wifi_ssid` y la MISMA clave, y las diez tenían la foto
 * vacía. Diez copias del mismo dato, y cambiar la clave del Wi-Fi eran diez
 * ediciones — a la tercera habría diez versiones de lo mismo.
 *
 * Lo peor: ese argumento ya estaba escrito, en el mismo commit que creó
 * estas columnas, para la guía de la casa. Se aplicó a la guía y no al
 * Wi-Fi.
 *
 * ── LO QUE ESTA PRUEBA MIRA ─────────────────────────────────────────────
 * Que se llene UNA vez y que la villa ya no lo pida. Sin la segunda mitad,
 * el dato subiría de nivel y la pantalla seguiría pidiéndolo diez veces.
 */

function villa(campos: Record<string, unknown> = {}) {
  return {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'v1-capi-capi',
    clave: 'abc123def456',
    nombre: 'V1 · CAPI CAPI',
    tipo: 'Wellness villa',
    anfitrion: 'Tony',
    wifi_ssid: null,
    wifi_clave: null,
    wifi_siempre: true,
    huesped: null,
    llegada: null,
    salida: null,
    checkin: '15:00',
    checkout: '11:00',
    bienvenida: null,
    nota_titulo: null,
    nota_texto: null,
    foto: null,
    reloj_posicion: 'izquierda',
    habilitada: true,
    orden: 1,
    ...campos,
  };
}

beforeEach(() => {
  supabaseStub.tablas.humaya_tv_villas = [villa(), villa({ id: 'v2', nombre: 'V2', orden: 2 })];
  supabaseStub.tablas.humaya_tv_ocupacion = [];
  supabaseStub.tablas.humaya_tv_ajustes = [
    {
      negocio_id: NEGOCIO_DE_PRUEBA,
      wifi_ssid: 'HUMAYA_Villas',
      wifi_clave: 'temporal-2026',
      wifi_siempre: true,
      foto: null,
    },
  ];
});

describe('el Wi-Fi y la foto del hotel', () => {
  it('se llenan una sola vez, con lo que ya está guardado', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });

    expect(await screen.findByText('Wi-Fi y foto, para todas las pantallas')).toBeInTheDocument();
    // UNA red, no una por villa: si hubiera dos campos, `getBy` reventaría.
    expect(screen.getByLabelText('Red')).toHaveValue('HUMAYA_Villas');
    expect(screen.getByLabelText('Clave')).toHaveValue('temporal-2026');
  });

  it('la villa ya NO los pide', async () => {
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    const fila = (await screen.findByText('V1 · CAPI CAPI')).closest('div')
      ?.parentElement as HTMLElement;

    await userEvent.click(within(fila).getByRole('button', { name: 'Editar' }));

    // El editor abrió —la dirección del televisor está— pero sin Wi-Fi.
    expect(await screen.findByText(/La dirección de este televisor/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText('Red')).toHaveLength(1);
    expect(screen.getAllByLabelText('Clave')).toHaveLength(1);
  });

  it('dónde va el reloj SÍ sigue siendo de cada villa', async () => {
    // Es cómo queda el reloj sobre la foto en ESA pantalla, no un dato
    // repetido. Por eso no subió con los otros dos.
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });
    const fila = (await screen.findByText('V1 · CAPI CAPI')).closest('div')
      ?.parentElement as HTMLElement;

    await userEvent.click(within(fila).getByRole('button', { name: 'Editar' }));

    expect(await screen.findByText('Dónde va el reloj')).toBeInTheDocument();
  });
});
