import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Drawer } from './Drawer';

function Harness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir menú
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Recepción" tema="staff">
        <a href="#llegadas">Llegadas</a>
        <a href="#spa">Spa</a>
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
  it('no está en el documento mientras está cerrado', () => {
    render(<Harness />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se anuncia como diálogo modal con su nombre', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    const dialog = screen.getByRole('dialog', { name: 'Recepción' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('mueve el foco adentro al abrirse', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('cierra con Escape y devuelve el foco al botón que lo abrió', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir menú' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('cierra con el botón de cerrar', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el foco no se escapa del panel al tabular', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    // Cerrar, Llegadas, Spa, y de vuelta a Cerrar.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveFocus();

    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Spa' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveFocus();
  });
});

/**
 * El menú tiene que llevarse el tema puesto.
 *
 * ── EL FALLO QUE ESTO AGARRA ────────────────────────────────────────────
 * Tony, 24 de noviembre de 2026, con una captura del teléfono: «sigue el
 * error en mobile de menú, no probaste».
 *
 * El menú de recepción salía TRANSPARENTE en el teléfono: los nombres de
 * los destinos encima de los números de la pantalla, ilegible. Medido en el
 * navegador antes de arreglarlo:
 *
 *   dentro de [data-theme] → false
 *   fondo del panel        → rgba(0, 0, 0, 0)
 *   --nav en el panel      → (vacía)
 *
 * `createPortal(..., document.body)` monta el panel FUERA del
 * `<div data-theme="staff">`, y en este proyecto los colores viven en
 * variables declaradas dentro de ese atributo —a propósito, para mostrar
 * los dos temas a la vez en /dev/ui—. Sin atributo no hay variables, y
 * `bg-nav` no pinta nada.
 *
 * ── POR QUÉ SE PRUEBA EL ATRIBUTO Y NO EL COLOR ─────────────────────────
 * Porque jsdom no resuelve variables CSS de hojas externas: preguntarle el
 * `backgroundColor` devolvería vacío con el arreglo puesto y sin él, y el
 * test diría que sí siempre. El atributo es lo que de verdad decide, y es
 * lo que se puede comprobar acá. El color se miró en el navegador.
 */
describe('el tema del portal', () => {
  it('el panel queda dentro de un data-theme, no suelto en el body', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    const panel = screen.getByRole('dialog');
    const conTema = panel.closest('[data-theme]');

    // EL PUNTO: sin esto el menú se ve transparente en el teléfono.
    expect(conTema).not.toBeNull();
    expect(conTema).toHaveAttribute('data-theme', 'staff');
  });

  it('el velo oscuro también queda dentro del tema', async () => {
    // El fondo semitransparente usa una variable igual que el panel: si
    // quedara fuera, tampoco pintaría.
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

    const panel = screen.getByRole('dialog');
    const raiz = panel.parentElement;

    expect(raiz).toHaveAttribute('data-theme', 'staff');
  });
});
