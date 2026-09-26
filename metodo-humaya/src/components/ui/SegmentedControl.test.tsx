import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'week', label: 'Esta semana' },
];

function Harness() {
  const [value, setValue] = useState('today');
  return <SegmentedControl label="Periodo" options={options} value={value} onChange={setValue} />;
}

describe('SegmentedControl', () => {
  it('marca la opción activa con aria-checked', () => {
    render(<Harness />);

    expect(screen.getByRole('radio', { name: 'Hoy' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Mañana' })).not.toBeChecked();
  });

  it('cambia de opción al hacer clic', async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole('radio', { name: 'Esta semana' }));

    expect(screen.getByRole('radio', { name: 'Esta semana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Hoy' })).not.toBeChecked();
  });

  it('avanza con la flecha derecha y da la vuelta al llegar al final', async () => {
    render(<Harness />);
    const group = screen.getByRole('radiogroup', { name: 'Periodo' });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Mañana' })).toBeChecked();

    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Hoy' })).toBeChecked();
    expect(group).toBeInTheDocument();
  });

  it('retrocede con la flecha izquierda', async () => {
    render(<Harness />);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('radio', { name: 'Esta semana' })).toBeChecked();
  });

  it('deja una sola parada de tabulador en el grupo', () => {
    render(<Harness />);

    expect(screen.getByRole('radio', { name: 'Hoy' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: 'Mañana' })).toHaveAttribute('tabindex', '-1');
  });
});
