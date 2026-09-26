import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from '@/router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('rutas base', () => {
  it('monta la app del huésped en /app', async () => {
    renderAt('/app');
    expect(await screen.findByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  });

  it('redirige la raíz a la app del huésped', async () => {
    renderAt('/');
    expect(await screen.findByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  });

  it('muestra el placeholder de recepción en /staff', () => {
    renderAt('/staff');
    expect(screen.getByText('Recepción')).toBeInTheDocument();
  });

  it('monta el catálogo del sistema visual en /dev/ui', () => {
    renderAt('/dev/ui');
    expect(screen.getByRole('heading', { name: 'Sistema visual' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Tema' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SlotGrid' })).toBeInTheDocument();
  });

  it('muestra el 404 en una ruta que no existe', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { name: 'Esta dirección no existe' })).toBeInTheDocument();
  });
});
