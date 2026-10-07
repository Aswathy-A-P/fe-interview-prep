import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import { cardClass, fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import DataTable from '../../components/DataTable/DataTable.tsx';
import Pagination from '../../components/DataTable/Pagination.tsx';
import type { Column } from '../../components/DataTable/tableUtils.ts';
import type { QuoteRow } from './quotes.ts';
import { changeView, parseView, serializeView, toggleColumn, type TableView } from './tableView.ts';
import { useQuotesTable } from './useQuotesTable.ts';

const COLUMNS: Column<QuoteRow>[] = [
  { id: 'id', header: '#', accessor: (row) => row.id, sortable: true },
  { id: 'quote', header: 'Quote', accessor: (row) => row.quote },
  { id: 'author', header: 'Author', accessor: (row) => row.author, sortable: true },
  { id: 'words', header: 'Words', accessor: (row) => row.words, sortable: true },
];

const COLUMN_IDS = COLUMNS.map((column) => column.id);
const SORTABLE_IDS = COLUMNS.filter((column) => column.sortable).map((column) => column.id);
const SEARCH_COLUMNS = COLUMNS.filter((column) => column.id === 'quote' || column.id === 'author');
const SERVER_COLUMNS = COLUMNS.map((column) => ({ ...column, sortable: false }));
const SERVER_NOTE_ID = 'quotes-server-note';

function QuotesTablePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const view = useMemo(() => parseView(searchParams, SORTABLE_IDS, COLUMN_IDS), [searchParams]);
  const setView = (next: TableView, options?: { replace?: boolean }) =>
    setSearchParams(serializeView(next), options);

  const server = view.mode === 'server';
  const table = useQuotesTable(view, COLUMNS, SEARCH_COLUMNS);
  const visibleCount = COLUMN_IDS.length - view.hidden.length;

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Data Table</h1>

      <div className="flex flex-wrap items-center gap-4">
        <label>
          Search{' '}
          <input
            type="search"
            value={view.q}
            disabled={server}
            aria-describedby={server ? SERVER_NOTE_ID : undefined}
            onChange={(event) =>
              setView(changeView(view, { q: event.target.value }), { replace: view.q !== '' })
            }
            placeholder="Quote or author"
            className={cn(fieldClass, 'w-72 disabled:opacity-60')}
          />
        </label>
        <label>
          Author{' '}
          <select
            className={cn(fieldClass, 'max-w-64 disabled:opacity-60')}
            value={view.author}
            disabled={server}
            aria-describedby={server ? SERVER_NOTE_ID : undefined}
            onChange={(event) => setView(changeView(view, { author: event.target.value }))}
          >
            <option value="">All authors</option>
            {table.status === 'ready' &&
              table.authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={server}
            onChange={(event) =>
              setView(changeView(view, { mode: event.target.checked ? 'server' : 'client' }))
            }
          />
          Server-side paging
        </label>
        <details className="relative">
          <summary className="cursor-pointer select-none">Columns</summary>
          <fieldset className={cn(cardClass, 'absolute z-20 mt-1 space-y-1 p-3 shadow-md')}>
            <legend className="sr-only">Visible columns</legend>
            {COLUMNS.map((column) => {
              const visible = !view.hidden.includes(column.id);
              return (
                <label key={column.id} className="flex items-center gap-2 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={visible}
                    disabled={visible && visibleCount === 1}
                    onChange={(event) =>
                      setView(toggleColumn(view, COLUMN_IDS, column.id, event.target.checked))
                    }
                  />
                  {column.header}
                </label>
              );
            })}
          </fieldset>
        </details>
      </div>

      {server && (
        <p id={SERVER_NOTE_ID} className="text-sm text-muted">
          Search, author filter and sorting are off in server-side paging: the dummyjson quotes
          endpoint only supports limit and skip, so each page is fetched as-is.
        </p>
      )}

      {table.status === 'loading' && <p className="text-muted">Loading quotes…</p>}

      {table.status === 'error' && (
        <div role="alert" className="space-y-2 text-danger">
          <p>Could not load quotes: {table.message}</p>
          <Button onClick={table.retry}>Retry</Button>
        </div>
      )}

      {table.status === 'ready' && (
        <>
          <p className="text-muted" aria-live="polite">
            {table.refreshing
              ? 'Loading page…'
              : `Showing ${table.first}–${table.first === 0 ? 0 : table.first + table.pageRows.length - 1} of ${table.total} quotes`}
          </p>
          <div aria-busy={table.refreshing} className={cn(table.refreshing && 'opacity-60')}>
            <DataTable
              rows={table.pageRows}
              columns={server ? SERVER_COLUMNS : COLUMNS}
              hiddenColumns={view.hidden}
              getRowId={(row) => row.id}
              sort={view.sort}
              onSortChange={(sort) => setView(changeView(view, { sort }))}
              caption="Quotes from dummyjson.com"
              emptyMessage="No quotes match your search."
            />
          </div>
          <Pagination
            page={table.page}
            totalPages={table.totalPages}
            pageSize={view.size}
            onPageChange={(next) => setView({ ...view, page: next })}
            onPageSizeChange={(size) => setView(changeView(view, { size }))}
          />
        </>
      )}
    </section>
  );
}

export default QuotesTablePage;
