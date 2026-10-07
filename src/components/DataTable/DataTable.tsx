import { nextSort, type Column, type SortState } from './tableUtils.ts';
import { cn } from '../../lib/cn.ts';
import { cardClass } from '../ui/fieldStyles.ts';

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string | number;
  sort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
  caption?: string;
  emptyMessage?: string;
  hiddenColumns?: readonly string[];
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;
const SORT_ICON = { asc: '▲', desc: '▼' } as const;
const CELL = 'border-b border-border px-3 py-2 text-left align-top';

function DataTable<T>({
  rows,
  columns,
  getRowId,
  sort,
  onSortChange,
  caption,
  emptyMessage = 'No rows to show.',
  hiddenColumns,
}: DataTableProps<T>) {
  const visibleColumns = hiddenColumns?.length
    ? columns.filter((column) => !hiddenColumns.includes(column.id))
    : columns;
  return (
    <div className={cn(cardClass, 'max-h-[70vh] overflow-auto rounded-none')}>
      <table className="w-full border-separate border-spacing-0 text-sm">
        {caption && <caption className="pb-2 text-left text-muted">{caption}</caption>}
        <thead>
          <tr>
            {visibleColumns.map((column) => {
              const direction = sort?.columnId === column.id ? sort.direction : null;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={direction ? ARIA_SORT[direction] : undefined}
                  className="sticky top-0 z-10 border-b border-border bg-surface px-3 py-2 text-left align-top font-semibold whitespace-nowrap"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(nextSort(sort, column.id))}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1.5 rounded-sm font-[inherit] hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                        direction && 'text-accent',
                      )}
                    >
                      {column.header}
                      <span
                        aria-hidden="true"
                        className={cn('text-[0.75em]', direction ? 'text-accent' : 'text-muted')}
                      >
                        {direction ? SORT_ICON[direction] : '↕'}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={visibleColumns.length} className={cn(CELL, 'text-muted')}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowId(row)} className="even:bg-surface/50 hover:bg-accent/5">
                {visibleColumns.map((column) => (
                  <td key={column.id} className={CELL}>
                    {column.render ? column.render(row) : column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
