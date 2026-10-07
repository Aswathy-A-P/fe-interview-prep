import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import { fieldClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import DataTable from '../../components/DataTable/DataTable.tsx';
import Pagination from '../../components/DataTable/Pagination.tsx';
import {
  pageCount,
  paginate,
  searchRows,
  sortRows,
  type Column,
} from '../../components/DataTable/tableUtils.ts';
import { distinctAuthors, fetchQuotes, filterByAuthor, type QuoteRow } from './quotes.ts';
import { changeView, parseView, serializeView, type TableView } from './tableView.ts';

const COLUMNS: Column<QuoteRow>[] = [
  { id: 'id', header: '#', accessor: (row) => row.id, sortable: true },
  { id: 'quote', header: 'Quote', accessor: (row) => row.quote },
  { id: 'author', header: 'Author', accessor: (row) => row.author, sortable: true },
  { id: 'words', header: 'Words', accessor: (row) => row.words, sortable: true },
];

const SORTABLE_IDS = COLUMNS.filter((column) => column.sortable).map((column) => column.id);
const SEARCH_COLUMNS = COLUMNS.filter((column) => column.id === 'quote' || column.id === 'author');
const NO_ROWS: QuoteRow[] = [];

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; rows: QuoteRow[] };

function QuotesTablePage() {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const view = useMemo(() => parseView(searchParams, SORTABLE_IDS), [searchParams]);
  const setView = (next: TableView, options?: { replace?: boolean }) =>
    setSearchParams(serializeView(next), options);

  useEffect(() => {
    const controller = new AbortController();
    fetchQuotes(controller.signal).then(
      (rows) => setLoad({ status: 'ready', rows }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setLoad({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong.',
        });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const allRows = load.status === 'ready' ? load.rows : NO_ROWS;
  const authors = useMemo(() => distinctAuthors(allRows), [allRows]);
  const matchingRows = useMemo(
    () =>
      sortRows(
        searchRows(filterByAuthor(allRows, view.author), SEARCH_COLUMNS, view.q),
        COLUMNS,
        view.sort,
      ),
    [allRows, view.author, view.q, view.sort],
  );

  const totalPages = pageCount(matchingRows.length, view.size);
  const page = Math.min(view.page, totalPages);
  const pageRows = paginate(matchingRows, page, view.size);
  const first = matchingRows.length === 0 ? 0 : (page - 1) * view.size + 1;
  const last = (page - 1) * view.size + pageRows.length;

  const retry = () => {
    setLoad({ status: 'loading' });
    setAttempt((current) => current + 1);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Data Table</h1>

      <div className="flex flex-wrap items-center gap-4">
        <label>
          Search{' '}
          <input
            type="search"
            value={view.q}
            onChange={(event) =>
              setView(changeView(view, { q: event.target.value }), { replace: view.q !== '' })
            }
            placeholder="Quote or author"
            className={cn(fieldClass, 'w-72')}
          />
        </label>
        <label>
          Author{' '}
          <select
            className={cn(fieldClass, 'max-w-64')}
            value={view.author}
            onChange={(event) => setView(changeView(view, { author: event.target.value }))}
          >
            <option value="">All authors</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </label>
      </div>

      {load.status === 'loading' && <p className="text-muted">Loading quotes…</p>}

      {load.status === 'error' && (
        <div role="alert" className="space-y-2 text-danger">
          <p>Could not load quotes: {load.message}</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      )}

      {load.status === 'ready' && (
        <>
          <p className="text-muted" aria-live="polite">
            Showing {first}–{last} of {matchingRows.length} quotes
          </p>
          <DataTable
            rows={pageRows}
            columns={COLUMNS}
            getRowId={(row) => row.id}
            sort={view.sort}
            onSortChange={(sort) => setView(changeView(view, { sort }))}
            caption="Quotes from dummyjson.com"
            emptyMessage="No quotes match your search."
          />
          <Pagination
            page={page}
            totalPages={totalPages}
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
