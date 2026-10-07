import { useEffect, useMemo, useState } from 'react';
import {
  pageCount,
  paginate,
  searchRows,
  sortRows,
  type Column,
} from '../../components/DataTable/tableUtils.ts';
import {
  distinctAuthors,
  fetchQuotes,
  fetchQuotesPage,
  filterByAuthor,
  type QuoteRow,
} from './quotes.ts';
import type { TableView } from './tableView.ts';

type ClientLoad =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; rows: QuoteRow[] };

type ServerLoad =
  | { status: 'error'; message: string; key: string }
  | { status: 'ready'; rows: QuoteRow[]; total: number; first: number; key: string };

export type QuotesTable =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      pageRows: QuoteRow[];
      total: number;
      first: number;
      page: number;
      totalPages: number;
      authors: string[];
      refreshing: boolean;
    };

const NO_ROWS: QuoteRow[] = [];

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong.';

export function useQuotesTable(
  view: TableView,
  columns: Column<QuoteRow>[],
  searchColumns: Column<QuoteRow>[],
): QuotesTable & { retry: () => void } {
  const server = view.mode === 'server';
  const [attempt, setAttempt] = useState(0);
  const [clientLoad, setClientLoad] = useState<ClientLoad>({ status: 'loading' });
  const [serverLoad, setServerLoad] = useState<ServerLoad | null>(null);
  const requestKey = `${view.page}:${view.size}:${attempt}`;

  useEffect(() => {
    if (server) return;
    const controller = new AbortController();
    fetchQuotes(controller.signal).then(
      (rows) => setClientLoad({ status: 'ready', rows }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setClientLoad({ status: 'error', message: errorMessage(error) });
        }
      },
    );
    return () => controller.abort();
  }, [server, attempt]);

  useEffect(() => {
    if (!server) return;
    const controller = new AbortController();
    const key = `${view.page}:${view.size}:${attempt}`;
    fetchQuotesPage(view.page, view.size, controller.signal).then(
      ({ rows, total }) =>
        setServerLoad({
          status: 'ready',
          rows,
          total,
          first: (view.page - 1) * view.size + 1,
          key,
        }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setServerLoad({ status: 'error', message: errorMessage(error), key });
        }
      },
    );
    return () => controller.abort();
  }, [server, view.page, view.size, attempt]);

  const allRows = !server && clientLoad.status === 'ready' ? clientLoad.rows : NO_ROWS;
  const authors = useMemo(() => distinctAuthors(allRows), [allRows]);
  const matchingRows = useMemo(
    () =>
      sortRows(
        searchRows(filterByAuthor(allRows, view.author), searchColumns, view.q),
        columns,
        view.sort,
      ),
    [allRows, view.author, view.q, view.sort, columns, searchColumns],
  );

  const retry = () => {
    setClientLoad({ status: 'loading' });
    setAttempt((current) => current + 1);
  };

  if (server) {
    if (serverLoad?.status === 'error' && serverLoad.key === requestKey) {
      return { status: 'error', message: serverLoad.message, retry };
    }
    if (serverLoad?.status !== 'ready') return { status: 'loading', retry };
    const totalPages = pageCount(serverLoad.total, view.size);
    return {
      status: 'ready',
      pageRows: serverLoad.rows,
      total: serverLoad.total,
      first: serverLoad.rows.length === 0 ? 0 : serverLoad.first,
      page: Math.min(view.page, totalPages),
      totalPages,
      authors: [],
      refreshing: serverLoad.key !== requestKey,
      retry,
    };
  }

  if (clientLoad.status !== 'ready') return { ...clientLoad, retry };
  const totalPages = pageCount(matchingRows.length, view.size);
  const page = Math.min(view.page, totalPages);
  return {
    status: 'ready',
    pageRows: paginate(matchingRows, page, view.size),
    total: matchingRows.length,
    first: matchingRows.length === 0 ? 0 : (page - 1) * view.size + 1,
    page,
    totalPages,
    authors,
    refreshing: false,
    retry,
  };
}
