import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { createRoutes, routes } from '@/router';

function renderAt(path: string, routeSet: RouteObject[] = routes) {
  const router = createMemoryRouter(routeSet, { initialEntries: [path] });
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

  it('muestra la portada con accesos a huésped y recepción', async () => {
    document.documentElement.lang = 'en';
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Become More Human' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'App del huésped' })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: 'Recepción' })).toHaveAttribute('href', '/staff');
    expect(screen.getByText(/Demo con datos ficticios/)).toBeVisible();
    await waitFor(() => expect(document.documentElement.lang).toBe('es'));
  });

  it('monta /entrada', () => {
    renderAt('/entrada');
    expect(screen.getByRole('heading', { name: 'Encontrá tu estadía' })).toBeInTheDocument();
  });

  it('la portada enlaza a /entrada', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /Buscá tu estadía/ })).toHaveAttribute(
      'href',
      '/entrada',
    );
  });

  it('muestra recepción en /staff', () => {
    renderAt('/staff');
    expect(screen.getByText('Recepción')).toBeInTheDocument();
  });

  it('monta el catálogo del sistema visual en desarrollo', () => {
    renderAt('/dev/ui');
    expect(screen.getByRole('heading', { name: 'Sistema visual' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Tema' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SlotGrid' })).toBeInTheDocument();
  });

  it('excluye el catálogo del árbol de producción', () => {
    renderAt('/dev/ui', createRoutes({ includeDevUi: false }));
    expect(screen.getByRole('heading', { name: 'Esta dirección no existe' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sistema visual' })).not.toBeInTheDocument();
  });

  it('muestra el 404 en una ruta que no existe', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { name: 'Esta dirección no existe' })).toBeInTheDocument();
  });
});
