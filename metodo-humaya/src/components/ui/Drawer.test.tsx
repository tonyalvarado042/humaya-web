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
      <Drawer open={open} onClose={() => setOpen(false)} title="Recepción">
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
