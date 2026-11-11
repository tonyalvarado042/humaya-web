import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EntradaPage } from './EntradaPage';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <EntradaPage />
    </QueryClientProvider>,
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Entrada', () => {
  it('pide el correo', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Encontrá tu estadía' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
  });

  it('no deja mandar un correo inválido', async () => {
    renderPage();

    const field = screen.getByLabelText('Correo');
    await userEvent.type(field, 'no-es-un-correo');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Escribí un correo válido.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('cuando encuentra la reserva, confirma sin meterlo a la app', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      jsonResponse({
        found: true,
        guestName: 'Valeria',
        checkin: '2026-11-14',
        checkout: '2026-11-17',
      }),
    );
    renderPage();

    await userEvent.type(screen.getByLabelText('Correo'), 'valeria@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByRole('heading', { name: '¡Te encontramos, Valeria!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ya tenemos tu reserva/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/humaya-entrada'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'valeria@example.com' }),
      }),
    );
  });

  it('cuando no encuentra la reserva, ofrece contacto y reintentar', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(jsonResponse({ found: false }));
    renderPage();

    await userEvent.type(screen.getByLabelText('Correo'), 'nadie@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByRole('heading', { name: 'No encontramos tu reserva' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'reservations@stayhumaya.com' })).toHaveAttribute(
      'href',
      'mailto:reservations@stayhumaya.com',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Probar con otro correo' }));
    expect(screen.getByRole('heading', { name: 'Encontrá tu estadía' })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveValue('');
  });

  it('avisa si la función falla', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));
    renderPage();

    await userEvent.type(screen.getByLabelText('Correo'), 'valeria@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText('Algo falló de nuestro lado. Probá de nuevo en un momento.'),
    ).toBeInTheDocument();
  });
});
