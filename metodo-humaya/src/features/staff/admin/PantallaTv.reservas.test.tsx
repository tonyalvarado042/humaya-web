import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { NEGOCIO_DE_PRUEBA, supabaseStub } from '@/test/supabaseStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PantallaTv } from './PantallaTv';

/**
 * La pantalla del TV se llena sola con las reservas.
 *
 * ── DE DÓNDE SALE ESTO ──────────────────────────────────────────────────
 * Tony, 21 de noviembre de 2026, con una captura de `/staff/admin/tv`
 * abierta en V1 · CAPI CAPI:
 *
 *   «todo debe ser automatizado, tú tienes las reservas, se debe correr
 *    automático, ¿por qué me pides agregar nombre de huésped?»
 *
 * Tenía razón: el hotel ya tiene 67 reservas en la base y la pantalla pedía
 * escribir el nombre y las fechas a mano.
 *
 * ── POR QUÉ NO ALCANZABA CON LEER LA RESERVA ────────────────────────────
 * Porque los dos lados escriben el mismo cuarto distinto: Cloudbeds manda
 * «V1 - CAPI CAPI » —guion y espacio al final— y la pantalla se llama
 * «V1 · CAPI CAPI», con punto medio. Y «VF(1)» contra «VF (1)». La vista
 * `humaya_tv_ocupacion` normaliza los dos y además parte por comas las
 * reservas que ocupan varias villas: una sola reserva puede llenar siete
 * pantallas.
 *
 * ── LO ESCRITO A MANO NO SE BORRA ───────────────────────────────────────
 * Queda para una entrada que todavía no esté en Cloudbeds, que es el único
 * caso donde hacía falta. Si hay reserva, manda la reserva.
 */

function villa(campos: Record<string, unknown> = {}) {
  return {
    negocio_id: NEGOCIO_DE_PRUEBA,
    id: 'v1-capi-capi',
    clave: 'abc123def456',
    nombre: 'V1 · CAPI CAPI',
    tipo: 'Wellness villa',
    anfitrion: 'Tony',
    wifi_ssid: 'HUMAYA_Villas',
    wifi_clave: 'temporal-2026',
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

async function abrirElEditor() {
  renderWithProviders(<PantallaTv />, { recepcion: 'es' });
  const fila = (await screen.findByText('V1 · CAPI CAPI')).closest('div')
    ?.parentElement as HTMLElement;
  await userEvent.click(within(fila).getByRole('button', { name: 'Editar' }));
}

beforeEach(() => {
  supabaseStub.tablas.humaya_tv_villas = [villa()];
  supabaseStub.tablas.humaya_tv_ocupacion = [];
});

describe('cuando la reserva tiene la villa asignada', () => {
  beforeEach(() => {
    supabaseStub.tablas.humaya_tv_ocupacion = [
      {
        negocio_id: NEGOCIO_DE_PRUEBA,
        villa_id: 'v1-capi-capi',
        huesped: 'Casey Herrera',
        llegada: '2026-12-18',
        salida: '2026-12-21',
      },
    ];
  });

  it('ya no se pide el nombre: se muestra el de la reserva', async () => {
    await abrirElEditor();

    expect(
      await screen.findByText(/Casey Herrera, de la reserva de Cloudbeds/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Del 2026-12-18 al 2026-12-21/)).toBeInTheDocument();
    // EL PUNTO DE TODO ESTO: el campo a mano desaparece.
    expect(screen.queryByLabelText('Nombre del huésped')).not.toBeInTheDocument();
  });

  it('el horario de la casa sigue siendo del hotel, no de la reserva', async () => {
    await abrirElEditor();

    // Entrada y salida son política del hotel: se editan siempre.
    expect(await screen.findByLabelText('Hora de entrada')).toHaveValue('15:00');
    expect(screen.getByLabelText('Hora de salida')).toHaveValue('11:00');
  });
});

describe('cuando ninguna reserva tiene esta villa', () => {
  it('se puede escribir a mano, y se explica por qué', async () => {
    await abrirElEditor();

    expect(
      await screen.findByText(/Hoy ninguna reserva tiene esta villa asignada/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del huésped')).toBeInTheDocument();
  });
});

describe('el instructivo del televisor', () => {
  it('está siempre a la vista, con el código de Downloader', async () => {
    // Se busca justo cuando uno está parado frente a un televisor nuevo, sin
    // acordarse del código. Escondido detrás de un «ver más» no sirve.
    renderWithProviders(<PantallaTv />, { recepcion: 'es' });

    expect(await screen.findByText('Cómo se prepara un televisor')).toBeInTheDocument();
    expect(
      screen.getByText(/Downloader y bajar la app Guest TV con el código 1061533/),
    ).toBeInTheDocument();
  });
});
