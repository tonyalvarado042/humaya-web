import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { renderWithProviders } from '@/test/renderWithProviders';
import { VillaPage } from './VillaPage';

const VALERIA = 's-mendez-rojas';

beforeEach(() => {
  resetMockState();
});

describe('Mi villa', () => {
  it('muestra la villa de la estadía con sus características', async () => {
    renderWithProviders(<VillaPage />, { stayId: VALERIA });

    expect(await screen.findByRole('heading', { name: 'Villa 04' })).toBeInTheDocument();
    expect(screen.getByText(/Vista al volcán · Terraza privada/)).toBeInTheDocument();
  });

  it('muestra la foto oficial de la villa', async () => {
    renderWithProviders(<VillaPage />, { stayId: VALERIA });

    expect(
      await screen.findByRole('img', { name: 'Exterior de la Villa 04 de Humaya' }),
    ).toHaveAttribute('src', '/villa-02.jpg');
  });

  it('muestra la red y la clave del wifi', async () => {
    renderWithProviders(<VillaPage />, { stayId: VALERIA });

    expect(await screen.findByText('Humaya-Villa04')).toBeInTheDocument();
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Clave')).toBeInTheDocument();
  });

  it('los instructivos arrancan cerrados y se abren de a uno', async () => {
    renderWithProviders(<VillaPage />, { stayId: VALERIA });

    const aire = await screen.findByRole('button', { name: 'Aire acondicionado' });
    expect(aire).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(aire);
    expect(aire).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/al lado de la cama/)).toBeInTheDocument();
  });

  it('ofrece los cuatro instructivos del prototipo', async () => {
    renderWithProviders(<VillaPage />, { stayId: VALERIA });

    await screen.findByRole('button', { name: 'Aire acondicionado' });
    for (const title of ['Agua caliente', 'Luces inteligentes', 'Cocina']) {
      expect(screen.getByRole('button', { name: title })).toBeInTheDocument();
    }
  });

  it('el botón de ayuda lleva al concierge', async () => {
    renderWithProviders(<VillaPage />, { stayId: VALERIA });

    expect(await screen.findByRole('link', { name: 'Pedir ayuda' })).toHaveAttribute(
      'href',
      '/app/concierge',
    );
  });
});
