import { StrictMode } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aplicarHotel } from '@/marca';
import { renderWithProviders } from '@/test/renderWithProviders';
import { EntradaPage } from './EntradaPage';

/**
 * El QR de la villa entra solo.
 *
 * ── DE DÓNDE SALE ESTO ──────────────────────────────────────────────────
 * Tony, 21 de noviembre de 2026: «si ya la villa está ocupada y tienen los
 * datos de la reservación, ¿no es mejor que automáticamente, cuando le hace
 * QR, ya venga con los datos precargados y me lleve a la aplicación sin
 * necesidad de entrar los datos?».
 *
 * Tenía razón: el QR está pegado en la pantalla DENTRO de la villa, y la
 * pantalla ya sabe quién duerme ahí. Pedirle el código de Airbnb al que está
 * adentro es fricción y nada más.
 *
 * La llave la firma `humaya-tv` y la abre `humaya-entrada`, que vuelve a
 * comprobar contra las reservas que esa reserva siga en esa villa hoy.
 */

const LLAVE = 'v1-capi-capi.6892JEMFAN.20809.firmafalsa';

function conLaLlave(respuesta: unknown) {
  window.history.replaceState({}, '', `/entrada?s=${encodeURIComponent(LLAVE)}`);
  const fetchFalso = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(respuesta), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchFalso);
  return fetchFalso;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/entrada');
  aplicarHotel(null);
});

describe('cuando el QR trae la llave de la estadía', () => {
  it('abre la estadía sin pedir nada', async () => {
    conLaLlave({
      found: true,
      guestName: 'Sowgandhi Bhanttu',
      checkin: '2026-12-17',
      checkout: '2026-12-21',
      reserva: '6892JEMFAN',
    });

    renderWithProviders(<EntradaPage />);

    expect(await screen.findByText(/Found you, Sowgandhi Bhanttu/)).toBeInTheDocument();
    // EL PUNTO: nunca se le puso un formulario delante.
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('manda la llave y NO manda código ni apellido', async () => {
    const fetchFalso = conLaLlave({ found: true, guestName: 'Ana', reserva: 'R1' });

    renderWithProviders(<EntradaPage />);
    await screen.findByText(/Found you, Ana/);

    const cuerpo = JSON.parse(String(fetchFalso.mock.calls[0]![1]!.body));
    expect(cuerpo.llave).toBe(LLAVE);
    expect(cuerpo.codigo).toBeUndefined();
    expect(cuerpo.apellido).toBeUndefined();
  });

  it('la pide una sola vez por visita', async () => {
    // No es una prueba de adorno: se rompió a propósito poniendo `check`
    // como dependencia del efecto en vez de `check.mutate` —el error fácil,
    // porque se ve igual— y la pantalla pidió la llave 25.087 veces en diez
    // segundos. El techo por IP de la función habría leído al huésped como
    // alguien probando códigos a ciegas y lo habría dejado afuera.
    //
    // Se monta dentro de StrictMode porque así la monta `main.tsx`.
    const fetchFalso = conLaLlave({ found: true, guestName: 'Ana', reserva: 'R1' });

    renderWithProviders(
      <StrictMode>
        <EntradaPage />
      </StrictMode>,
    );
    await screen.findByText(/Found you, Ana/);

    await waitFor(() => expect(fetchFalso).toHaveBeenCalledTimes(1));
  });

  it('se acuerda de la estadía, igual que si la hubiera buscado a mano', async () => {
    conLaLlave({
      found: true,
      guestName: 'Sowgandhi Bhanttu',
      checkin: '2026-12-17',
      checkout: '2026-12-21',
      reserva: '6892JEMFAN',
    });

    renderWithProviders(<EntradaPage />);
    await screen.findByText(/Found you/);

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('humaya.mi-estadia')!).reserva).toBe('6892JEMFAN'),
    );
  });
});

describe('cuando la llave ya no abre', () => {
  it('da el formulario de siempre, diciendo por qué', async () => {
    // Pasa de verdad: la foto que alguien le tomó al televisor en diciembre,
    // abierta en enero. La reserva ya no está en esa villa.
    conLaLlave({ found: false, error: 'llave_vencida' });

    renderWithProviders(<EntradaPage />);

    // Se vuelve a consultar en cada intento, no se guarda el nodo: la
    // pantalla cambia de rama cuando la llave rebota y React reemplaza los
    // elementos; un nodo guardado antes del cambio ya no está en la página.
    await waitFor(() =>
      expect(screen.getByText(/That link is no longer open/)).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    // Y no dice «no encontramos tu reserva», que sería echarle la culpa a un
    // código que el huésped nunca escribió.
    expect(screen.queryByText(/We couldn/)).not.toBeInTheDocument();
  });
});

describe('en otro hotel', () => {
  it('la experiencia se llama como la llama ESE hotel, arriba y abajo', async () => {
    // El fallo que esto agarra: el bloque de abajo tenía escrito «HUMAYA
    // Experience». Visto en vivo el 21 de noviembre de 2026 en el hotel
    // demo: arriba decía «DEMO EXPERIENCE» y abajo «HUMAYA EXPERIENCE», en
    // la misma pantalla del teléfono. Decirle a un huésped el nombre de otra
    // empresa no es un detalle: es decirle que está en otro hotel.
    aplicarHotel({
      negocioId: 'n-demo',
      codigo: 'demo',
      marcaExperiencia: 'Demo Experience',
      marcaHotel: 'HOTEL DEMO',
      correo: 'demo@liderax10.com',
      esDemo: false,
      portadaTitulo: null,
      portadaBajada: null,
      tema: null,
    });
    conLaLlave({ found: true, guestName: 'Ana', reserva: 'R1' });

    renderWithProviders(<EntradaPage />);
    await screen.findByText(/Found you, Ana/);

    expect(screen.getAllByText('Demo Experience').length).toBeGreaterThan(1);
    expect(screen.queryByText('HUMAYA Experience')).not.toBeInTheDocument();
  });
});
