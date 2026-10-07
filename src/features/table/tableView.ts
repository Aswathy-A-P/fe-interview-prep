import {
  isPageSize,
  type PageSize,
  type SortState,
} from '../../components/DataTable/tableUtils.ts';

export type PagingMode = 'client' | 'server';

export interface TableView {
  q: string;
  author: string;
  sort: SortState | null;
  page: number;
  size: PageSize;
  hidden: string[];
  mode: PagingMode;
}

export const DEFAULT_VIEW: TableView = {
  q: '',
  author: '',
  sort: null,
  page: 1,
  size: 10,
  hidden: [],
  mode: 'client',
};

function parseSort(params: URLSearchParams, sortableIds: readonly string[]): SortState | null {
  const columnId = params.get('sort');
  const direction = params.get('dir');
  if (!columnId || !sortableIds.includes(columnId)) return null;
  if (direction !== 'asc' && direction !== 'desc') return null;
  return { columnId, direction };
}

function parsePositiveInt(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= 1 ? number : null;
}

function parseHidden(params: URLSearchParams, columnIds: readonly string[]): string[] {
  const requested = params.getAll('hide');
  const hidden = columnIds.filter((id) => requested.includes(id));
  return hidden.length < columnIds.length ? hidden : [];
}

export function parseView(
  params: URLSearchParams,
  sortableIds: readonly string[],
  columnIds: readonly string[] = [],
): TableView {
  const size = parsePositiveInt(params.get('size'));
  const mode: PagingMode = params.get('mode') === 'server' ? 'server' : 'client';
  const server = mode === 'server';
  return {
    q: server ? DEFAULT_VIEW.q : (params.get('q') ?? DEFAULT_VIEW.q),
    author: server ? DEFAULT_VIEW.author : (params.get('author') ?? DEFAULT_VIEW.author),
    sort: server ? DEFAULT_VIEW.sort : parseSort(params, sortableIds),
    page: parsePositiveInt(params.get('page')) ?? DEFAULT_VIEW.page,
    size: size !== null && isPageSize(size) ? size : DEFAULT_VIEW.size,
    hidden: parseHidden(params, columnIds),
    mode,
  };
}

export function serializeView(view: TableView): URLSearchParams {
  const params = new URLSearchParams();
  const server = view.mode === 'server';
  if (server) params.set('mode', 'server');
  if (view.q && !server) params.set('q', view.q);
  if (view.author && !server) params.set('author', view.author);
  if (view.sort && !server) {
    params.set('sort', view.sort.columnId);
    params.set('dir', view.sort.direction);
  }
  if (view.page !== DEFAULT_VIEW.page) params.set('page', String(view.page));
  if (view.size !== DEFAULT_VIEW.size) params.set('size', String(view.size));
  for (const id of view.hidden) params.append('hide', id);
  return params;
}

export function changeView(
  view: TableView,
  change: Partial<Pick<TableView, 'q' | 'author' | 'sort' | 'size' | 'mode'>>,
): TableView {
  return { ...view, ...change, page: 1 };
}

export function toggleColumn(
  view: TableView,
  columnIds: readonly string[],
  columnId: string,
  visible: boolean,
): TableView {
  const hidden = columnIds.filter((id) => (id === columnId ? !visible : view.hidden.includes(id)));
  return hidden.length < columnIds.length ? { ...view, hidden } : view;
}
