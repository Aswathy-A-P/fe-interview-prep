import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import DataTable from './DataTable.tsx';
import { sortRows, type Column, type SortState } from './tableUtils.ts';

interface Fruit {
  name: string;
  price: number;
}

const fruits: Fruit[] = [
  { name: 'Banana', price: 2 },
  { name: 'Apple', price: 3 },
  { name: 'Cherry', price: 1 },
];

const columns: Column<Fruit>[] = [
  { id: 'name', header: 'Name', accessor: (fruit) => fruit.name, sortable: true },
  {
    id: 'price',
    header: 'Price',
    accessor: (fruit) => fruit.price,
    render: (fruit) => `$${fruit.price}`,
  },
];

function SortableFruits() {
  const [sort, setSort] = useState<SortState | null>(null);
  return (
    <DataTable
      rows={sortRows(fruits, columns, sort)}
      columns={columns}
      getRowId={(fruit) => fruit.name}
      sort={sort}
      onSortChange={setSort}
    />
  );
}

const firstColumn = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent);

describe('DataTable', () => {
  it('renders cells from the column description', () => {
    render(<SortableFruits />);
    expect(screen.getByRole('cell', { name: '$3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /price/i })).not.toBeInTheDocument();
  });

  it('cycles a header through ascending, descending and unsorted', async () => {
    const user = userEvent.setup();
    render(<SortableFruits />);
    const header = screen.getByRole('columnheader', { name: /name/i });
    const button = within(header).getByRole('button');

    await user.click(button);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(firstColumn()).toEqual(['Apple', 'Banana', 'Cherry']);

    await user.click(button);
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(firstColumn()).toEqual(['Cherry', 'Banana', 'Apple']);

    await user.click(button);
    expect(header).not.toHaveAttribute('aria-sort');
    expect(firstColumn()).toEqual(['Banana', 'Apple', 'Cherry']);
  });

  it('shows a message when there are no rows', () => {
    render(
      <DataTable
        rows={[]}
        columns={columns}
        getRowId={(fruit) => fruit.name}
        sort={null}
        onSortChange={() => {}}
        emptyMessage="Nothing here."
      />,
    );
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });

  it('leaves out hidden columns', () => {
    render(
      <DataTable
        rows={fruits}
        columns={columns}
        getRowId={(fruit) => fruit.name}
        sort={null}
        onSortChange={() => {}}
        hiddenColumns={['price']}
      />,
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    expect(screen.queryByRole('cell', { name: '$3' })).not.toBeInTheDocument();
  });
});
