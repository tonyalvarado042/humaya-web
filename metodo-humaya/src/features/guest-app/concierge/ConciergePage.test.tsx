import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMockState } from '@/mocks';
import { stubConciergeApi } from '@/test/conciergeApiStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ConciergePage } from './ConciergePage';

beforeEach(() => {
  resetMockState();
  stubConciergeApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function thread() {
  return screen.getByRole('log', { name: 'Conversación con el concierge' });
}

describe('Concierge', () => {
  it('avisa que es un asistente con IA', async () => {
    renderWithProviders(<ConciergePage />);

    expect(await screen.findByRole('heading', { name: 'Concierge' })).toBeInTheDocument();
    expect(screen.getByText(/Asistente con IA/)).toBeInTheDocument();
  });

  it('arranca con el saludo del concierge', async () => {
    renderWithProviders(<ConciergePage />);

    expect(await screen.findByText(/soy tu concierge de Humaya/)).toBeInTheDocument();
  });

  it('anuncia los mensajes nuevos a los lectores de pantalla', async () => {
    renderWithProviders(<ConciergePage />);

    await screen.findByText(/soy tu concierge de Humaya/);
    expect(thread()).toHaveAttribute('aria-live', 'polite');
  });

  it('responde por palabra clave a lo que se escribe', async () => {
    renderWithProviders(<ConciergePage />);

    const field = await screen.findByLabelText('Mensaje para el concierge');
    await userEvent.type(field, '¿Cómo pongo el agua caliente?');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText(/calentador ya está encendido/)).toBeInTheDocument();
    expect(within(thread()).getByText('¿Cómo pongo el agua caliente?')).toBeInTheDocument();
  });

  it('las sugerencias rápidas también preguntan', async () => {
    renderWithProviders(<ConciergePage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Desayuno' }));

    expect(await screen.findByText(/de 7:00 a 10:00 a.m./)).toBeInTheDocument();
  });

  it('no envía un mensaje vacío', async () => {
    renderWithProviders(<ConciergePage />);

    await screen.findByText(/soy tu concierge de Humaya/);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  it('el campo se vacía después de enviar', async () => {
    renderWithProviders(<ConciergePage />);

    const field = await screen.findByLabelText('Mensaje para el concierge');
    await userEvent.type(field, 'luces{Enter}');

    expect(field).toHaveValue('');
  });
});
