import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('avisa cuando se lo toca', async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>En pareja</Chip>);

    await userEvent.click(screen.getByRole('button', { name: 'En pareja' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('expone aria-pressed cuando actúa como interruptor', () => {
    render(<Chip selected>En familia</Chip>);

    expect(screen.getByRole('button', { name: 'En familia' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('no expone aria-pressed cuando no es un interruptor', () => {
    render(<Chip>Con amigos</Chip>);

    expect(screen.getByRole('button', { name: 'Con amigos' })).not.toHaveAttribute('aria-pressed');
  });

  it('no dispara onClick si está deshabilitado', async () => {
    const onClick = vi.fn();
    render(
      <Chip onClick={onClick} disabled>
        Solo o sola
      </Chip>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Solo o sola' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
