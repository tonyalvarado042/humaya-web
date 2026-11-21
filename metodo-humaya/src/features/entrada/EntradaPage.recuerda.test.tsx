import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { recordarEstadia } from '@/services/miEstadia';
import { EntradaPage } from './EntradaPage';

/**
 * El QR de la villa no vuelve a pedir el código.
 *
 * ── DE DÓNDE SALE ESTO ──────────────────────────────────────────────────
 * Tony, 21 de noviembre de 2026, sobre el QR del televisor: «debería tener
 * botón de entrar en la app, desde ahí la cual debe ingresar apellido y
 * código de reserva claro, pero guarda sesión para que cada vez no se lo
 * tenga que pedir».
 *
 * El QR vive pegado en la pantalla de la villa: el huésped lo abre más de una
 * vez, y cada vez tenía que ir a buscar su código de Airbnb. Eso es fricción,
 * que es lo que el manual del equipo llama Servicio 3.0: «anticipar y
 * conectar: usar información autorizada para reducir fricciones».
 *
 * ── LO QUE ESTO NO ES ───────────────────────────────────────────────────
 * No es una sesión con permisos. No abre ninguna puerta ni autoriza nada: es
 * el nombre y las fechas que el huésped ya vio en esta misma pantalla. Vive
 * en su teléfono, y se olvida sola dos días después de la salida.
 */

const ESTADIA = {
  reserva: 'HMMK383ASS',
  guestName: 'Sowgandhi Bhanttu',
  checkin: '2026-12-17',
  checkout: '2026-12-21',
};

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
  vi.setSystemTime(new Date('2026-12-18T12:00:00Z'));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('cuando este teléfono ya encontró la estadía', () => {
  it('saluda en vez de pedir el código otra vez', async () => {
    recordarEstadia(ESTADIA);

    renderWithProviders(<EntradaPage />);

    expect(await screen.findByText(/Welcome back, Sowgandhi Bhanttu/)).toBeInTheDocument();
    // EL PUNTO: el formulario no está.
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('«no soy yo» vuelve a preguntar, y lo olvida de verdad', async () => {
    recordarEstadia(ESTADIA);
    renderWithProviders(<EntradaPage />);
    await screen.findByText(/Welcome back/);

    await userEvent.click(screen.getByRole('button', { name: /Not you/ }));

    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(localStorage.getItem('humaya.mi-estadia')).toBeNull();
  });
});

describe('sin nada guardado', () => {
  it('pide el código, como siempre', async () => {
    renderWithProviders(<EntradaPage />);

    expect(await screen.findByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.queryByText(/Welcome back/)).not.toBeInTheDocument();
  });
});

describe('qué es esto, dicho al huésped', () => {
  it('se nombra HUMAYA Experience y se dice que contesta una persona', async () => {
    // Tony: «que recuerden HUMAYA Experience». Y la regla del manual que
    // manda sobre cualquier pantalla: la tecnología prepara al equipo, la
    // persona entrega el servicio.
    renderWithProviders(<EntradaPage />);

    // Aparece más de una vez a propósito —arriba como marca y abajo
    // explicado—: de eso se trata que el nombre quede.
    expect(await screen.findAllByText('HUMAYA Experience')).not.toHaveLength(0);
    expect(screen.getByText(/a person answers/)).toBeInTheDocument();
    expect(screen.getByText(/not here to replace anyone/)).toBeInTheDocument();
  });
});
