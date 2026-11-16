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
  // La pantalla recuerda el idioma elegido. Sin limpiar, el primer test que
  // cambie a español dejaría a los siguientes empezando en español.
  try {
    localStorage.clear();
  } catch {
    /* jsdom siempre lo tiene; el try es por simetría con la pantalla */
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Entrada', () => {
  it('abre en inglés y pide código y apellido', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Find your stay' })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmation code or email')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
  });

  it('cambia a español y se queda ahí', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Español' }));

    expect(await screen.findByRole('heading', { name: 'Encontrá tu estadía' })).toBeInTheDocument();
    expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'es');
    // Y ofrece volverse: quien lo cambió sin querer tiene que poder salir.
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });

  it('no manda nada si falta el apellido', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText('Confirmation code or email'), 'HMMS93AC2K');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Enter the last name on the booking.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('encuentra la reserva con el código de la OTA y muestra las fechas', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        found: true,
        guestName: 'Connor & Sheri Galloway',
        checkin: '2026-12-27',
        checkout: '2026-12-31',
        pedir_correo: true,
      }),
    );
    renderPage();

    await userEvent.type(screen.getByLabelText('Confirmation code or email'), 'HMMS93AC2K');
    await userEvent.type(screen.getByLabelText('Last name'), 'Galloway');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(
      await screen.findByRole('heading', { name: 'Found you, Connor & Sheri Galloway.' }),
    ).toBeInTheDocument();
    // Las fechas se formatean en UTC: sin eso, una llegada sin hora se corre
    // un día para medio mundo.
    expect(screen.getByText(/Dec 27, 2026 → Dec 31, 2026/)).toBeInTheDocument();

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      codigo: 'HMMS93AC2K',
      apellido: 'Galloway',
    });
  });

  it('cuando no la encuentra, ofrece el camino de vuelta', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ found: false }));
    renderPage();

    await userEvent.type(screen.getByLabelText('Confirmation code or email'), 'NOEXISTE1');
    await userEvent.type(screen.getByLabelText('Last name'), 'Nadie');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('heading', { name: 'We couldn’t find it' })).toBeInTheDocument();
    expect(screen.getByText('reservations@stayhumaya.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('si el servidor se cae, lo dice en vez de quedarse callado', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: 'db_error' }, 500));
    renderPage();

    await userEvent.type(screen.getByLabelText('Confirmation code or email'), 'HMMS93AC2K');
    await userEvent.type(screen.getByLabelText('Last name'), 'Galloway');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something broke on our side. Try again in a moment.',
    );
  });
});
