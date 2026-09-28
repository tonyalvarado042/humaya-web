import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

const items = [
  { id: 'aire', title: 'Aire acondicionado', body: 'El control está al lado de la cama.' },
  { id: 'agua', title: 'Agua caliente', body: 'Girá la llave hacia la izquierda.' },
];

describe('Accordion', () => {
  it('arranca cerrado si no se le dice cuál abrir', () => {
    render(<Accordion items={items} />);

    expect(screen.getByRole('button', { name: 'Aire acondicionado' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('El control está al lado de la cama.')).not.toBeInTheDocument();
  });

  it('abre y cierra con el teclado', async () => {
    render(<Accordion items={items} />);
    const trigger = screen.getByRole('button', { name: 'Aire acondicionado' });

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('El control está al lado de la cama.')).toBeInTheDocument();

    await userEvent.keyboard(' ');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('deja un solo panel abierto a la vez', async () => {
    render(<Accordion items={items} defaultOpenId="aire" />);

    await userEvent.click(screen.getByRole('button', { name: 'Agua caliente' }));

    expect(screen.getByRole('button', { name: 'Agua caliente' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Aire acondicionado' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('El control está al lado de la cama.')).not.toBeInTheDocument();
  });

  it('ata el disparador con su panel por aria-controls', async () => {
    render(<Accordion items={items} defaultOpenId="aire" />);
    const trigger = screen.getByRole('button', { name: 'Aire acondicionado' });

    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId as string)).toHaveTextContent(
      'El control está al lado de la cama.',
    );
  });
});
