import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SlotGrid } from './SlotGrid';

const slots = [
  { id: '16:00', label: '16:00' },
  { id: '17:00', label: '17:00' },
  { id: '18:00', label: '18:00', taken: true },
];

function renderGrid(onSelect = vi.fn()) {
  render(
    <SlotGrid label="Horarios de sauna" slots={slots} selectedId="17:00" onSelect={onSelect} />,
  );
  return onSelect;
}

describe('SlotGrid', () => {
  it('dice "ocupado" en el nombre accesible, no solo con el tachado', () => {
    renderGrid();

    expect(screen.getByRole('button', { name: '18:00, ocupado' })).toBeDisabled();
  });

  it('marca el horario elegido con aria-pressed', () => {
    renderGrid();

    expect(screen.getByRole('button', { name: '17:00' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '16:00' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('avisa qué horario se eligió', async () => {
    const onSelect = renderGrid();

    await userEvent.click(screen.getByRole('button', { name: '16:00' }));

    expect(onSelect).toHaveBeenCalledWith('16:00');
  });

  it('no deja elegir un horario ocupado', async () => {
    const onSelect = renderGrid();

    await userEvent.click(screen.getByRole('button', { name: '18:00, ocupado' }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('salta el horario ocupado al tabular', async () => {
    renderGrid();

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole('button', { name: '18:00, ocupado' })).not.toHaveFocus();
  });
});
