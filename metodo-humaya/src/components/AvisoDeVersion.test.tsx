import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AvisoDeVersion } from './AvisoDeVersion';
import { hayVersionNueva } from '@/services/version';

vi.mock('@/services/version', () => ({
  hayVersionNueva: vi.fn(),
  traerVersionNueva: vi.fn(),
}));

const preguntar = vi.mocked(hayVersionNueva);

beforeEach(() => {
  preguntar.mockReset();
});

afterEach(() => {
  document.body.style.paddingBottom = '';
});

describe('el aviso de versión nueva', () => {
  it('no aparece cuando la pantalla está al día', async () => {
    // Importa tanto como que aparezca: una barra que sale sin motivo en
    // recepción enseña a ignorarla, y entonces tampoco sirve el día que sí.
    preguntar.mockResolvedValue(false);
    render(<AvisoDeVersion />);

    await waitFor(() => expect(preguntar).toHaveBeenCalled());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('aparece cuando el servidor tiene algo más nuevo', async () => {
    preguntar.mockResolvedValue(true);
    render(<AvisoDeVersion />);

    expect(await screen.findByText(/versión más nueva/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
  });

  it('habla el idioma en el que está trabajando recepción', async () => {
    preguntar.mockResolvedValue(true);
    render(<AvisoDeVersion idioma="en" />);

    expect(await screen.findByText(/newer version of this screen/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('le deja el espacio libre al final en vez de tapar el pie', async () => {
    // El pie de una conversación es el botón de enviar. Una barra fija que
    // lo tape deja a recepción sin poder contestar.
    preguntar.mockResolvedValue(true);
    render(<AvisoDeVersion />);

    await screen.findByRole('status');
    await waitFor(() => expect(document.body.style.paddingBottom).not.toBe(''));
  });
});
