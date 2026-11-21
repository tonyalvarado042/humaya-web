import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n';
import { resetMockState } from '@/mocks';
import { DEFAULT_OPCIONES, stubAdminApi } from '@/test/adminApiStub';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HomePage } from './HomePage';

/**
 * Lo que el hotel escribe en /staff/admin tiene que llegar al huésped.
 *
 * ── POR QUÉ ESTE ARCHIVO EXISTE ─────────────────────────────────────────
 * Porque hasta el 20 de noviembre de 2026 NO llegaba. `HomePage` hacía
 * `t('nav.' + clave, opcion.etiqueta)`: para las seis opciones sembradas
 * ganaba siempre la traducción del archivo, y la etiqueta de la base no se
 * veía nunca. /staff/admin mostraba un campo editable que no editaba nada.
 *
 * Un fallo así no lo agarra un test de la pantalla de admin: ahí guardar
 * funcionaba perfecto. Solo lo agarra un test que mire la pantalla del OTRO
 * lado.
 */

const VALERIA = 's-mendez-rojas';

function conEtiquetas(clave: string, etiquetas: Record<string, string>) {
  return DEFAULT_OPCIONES.map((opcion) =>
    opcion.clave === clave ? { ...opcion, etiquetas } : opcion,
  );
}

beforeEach(() => {
  resetMockState();
});

afterEach(async () => {
  vi.unstubAllGlobals();
  // El idioma es global de i18next: dejarlo en inglés le cambiaría la
  // pantalla al test siguiente.
  await i18n.changeLanguage('es');
});

async function fichas() {
  return within(await screen.findByRole('navigation', { name: /Accesos rápidos|Quick access/ }));
}

/**
 * Pasar a inglés como lo hace un huésped: apretando el botón.
 *
 * `i18n.changeLanguage()` a mano no sirve acá: `GuestLanguageProvider` vuelve
 * a poner el idioma de la estadía en cuanto se monta, así que el cambio se
 * deshacía solo y el test leía español creyendo que leía inglés.
 */
async function pasarAIngles() {
  await userEvent.click(await screen.findByRole('button', { name: 'Cambiar idioma a inglés' }));
}

describe('el nombre que le puso el hotel', () => {
  it('le gana a la traducción de la app', async () => {
    stubAdminApi({ opciones: conEtiquetas('bookings', { es: 'Rituales', en: 'Rituals' }) });
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    const nav = await fichas();
    expect(nav.getByRole('link', { name: /Rituales/ })).toHaveAttribute('href', '/app/bookings');
    expect(nav.queryByRole('link', { name: /^Reservas/ })).not.toBeInTheDocument();
  });

  it('en inglés muestra el inglés que escribió el hotel', async () => {
    stubAdminApi({ opciones: conEtiquetas('bookings', { es: 'Rituales', en: 'Rituals' }) });
    renderWithProviders(<HomePage />, { stayId: VALERIA });
    await fichas();
    await pasarAIngles();

    const nav = await fichas();
    expect(nav.getByRole('link', { name: /Rituals/ })).toHaveAttribute('href', '/app/bookings');
  });

  /**
   * El caso que decide el orden: renombrar solo el español NO le cambia el
   * inglés a nadie. Si cayera al otro idioma, un huésped en inglés leería
   * «Rituales».
   */
  it('renombrar solo el español deja el inglés como estaba', async () => {
    stubAdminApi({ opciones: conEtiquetas('bookings', { es: 'Rituales' }) });
    renderWithProviders(<HomePage />, { stayId: VALERIA });
    await fichas();
    await pasarAIngles();

    const nav = await fichas();
    expect(nav.getByRole('link', { name: /Bookings/ })).toHaveAttribute('href', '/app/bookings');
    expect(nav.queryByRole('link', { name: /Rituales/ })).not.toBeInTheDocument();
  });

  it('sin nada escrito sigue valiendo la traducción de la app', async () => {
    stubAdminApi();
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    const nav = await fichas();
    expect(nav.getByRole('link', { name: /Reservas/ })).toBeInTheDocument();
  });

  it('la línea de abajo también sale de lo que escribió el hotel', async () => {
    stubAdminApi({
      opciones: DEFAULT_OPCIONES.map((opcion) =>
        opcion.clave === 'bookings'
          ? { ...opcion, descripciones: { es: 'Sauna, hielo y masajes.' } }
          : opcion,
      ),
    });
    renderWithProviders(<HomePage />, { stayId: VALERIA });

    await fichas();
    expect(screen.getByText('Sauna, hielo y masajes.')).toBeInTheDocument();
  });
});
