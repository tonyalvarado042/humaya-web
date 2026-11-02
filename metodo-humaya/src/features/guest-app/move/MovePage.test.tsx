import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMockState } from '@/mocks';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MovePage } from './MovePage';

beforeEach(() => {
  resetMockState();
});

describe('Move', () => {
  it('muestra las sesiones de la semana con su coach', async () => {
    renderWithProviders(<MovePage />);

    expect(await screen.findByRole('heading', { name: 'Full body' })).toBeInTheDocument();
    expect(screen.getByText(/Con Coach Tony Alvarado/)).toBeInTheDocument();
  });

  it('ofrece las tres sesiones del programa, cada una con su enlace al reproductor', async () => {
    renderWithProviders(<MovePage />);

    await screen.findByRole('heading', { name: 'Full body' });
    for (const focus of ['Upper strength', 'Lower strength']) {
      expect(screen.getByRole('heading', { name: focus })).toBeInTheDocument();
    }

    const startLinks = screen.getAllByRole('link', { name: 'Empezar sesión' });
    expect(startLinks).toHaveLength(3);
    expect(startLinks[0]).toHaveAttribute('href', '/app/move/move-session-1');
  });
});
