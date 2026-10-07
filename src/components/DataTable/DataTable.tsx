import { nextSort, type Column, type SortState } from './tableUtils.ts';
import './DataTable.css';

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string | number;
  sort: SortState | null;
  onSortChange: (sort: SortState | null) => void;
  caption?: string;
  emptyMessage?: string;
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;
const SORT_ICON = { asc: '▲', desc: '▼' } as const;

function DataTable<T>({
  rows,
  columns,
  getRowId,
  sort,
  onSortChange,
  caption,
  emptyMessage = 'No rows to show.',
}: DataTableProps<T>) {
  return (
    <table className="data-table">
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column) => {
            const direction = sort?.columnId === column.id ? sort.direction : null;
            return (
              <th
                key={column.id}
                scope="col"
                aria-sort={direction ? ARIA_SORT[direction] : undefined}
              >
                {column.sortable ? (
                  <button type="button" onClick={() => onSortChange(nextSort(sort, column.id))}>
                    {column.header}
                    <span aria-hidden="true" className="sort-icon">
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
            <td colSpan={columns.length} className="muted">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column) => (
                <td key={column.id}>{column.render ? column.render(row) : column.accessor(row)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default DataTable;
