import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table';

function Example() {
  return (
    <Table aria-label="Llegadas">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Huésped</TableHeaderCell>
          <TableHeaderCell>Villa</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Valeria Méndez</TableCell>
          <TableCell>Villa 04</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('usa una tabla de verdad, con su nombre accesible', () => {
    render(<Example />);

    expect(screen.getByRole('table', { name: 'Llegadas' })).toBeInTheDocument();
  });

  it('los encabezados son columnas', () => {
    render(<Example />);

    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((header) => header.textContent)).toEqual(['Huésped', 'Villa']);
    expect(headers[0]).toHaveAttribute('scope', 'col');
  });

  it('las celdas quedan dentro de su fila', () => {
    render(<Example />);

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Villa 04')).toBeInTheDocument();
  });
});
