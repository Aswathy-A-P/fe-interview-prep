import {
  isPageSize,
  type PageSize,
  type SortState,
} from '../../components/DataTable/tableUtils.ts';

export interface TableView {
  q: string;
  author: string;
  sort: SortState | null;
  page: number;
  size: PageSize;
}

export const DEFAULT_VIEW: TableView = { q: '', author: '', sort: null, page: 1, size: 10 };

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

export function parseView(params: URLSearchParams, sortableIds: readonly string[]): TableView {
  const size = parsePositiveInt(params.get('size'));
  return {
    q: params.get('q') ?? DEFAULT_VIEW.q,
    author: params.get('author') ?? DEFAULT_VIEW.author,
    sort: parseSort(params, sortableIds),
    page: parsePositiveInt(params.get('page')) ?? DEFAULT_VIEW.page,
    size: size !== null && isPageSize(size) ? size : DEFAULT_VIEW.size,
  };
}

export function serializeView(view: TableView): URLSearchParams {
  const params = new URLSearchParams();
  if (view.q) params.set('q', view.q);
  if (view.author) params.set('author', view.author);
  if (view.sort) {
    params.set('sort', view.sort.columnId);
    params.set('dir', view.sort.direction);
  }
  if (view.page !== DEFAULT_VIEW.page) params.set('page', String(view.page));
  if (view.size !== DEFAULT_VIEW.size) params.set('size', String(view.size));
  return params;
}

export function changeView(
  view: TableView,
  change: Partial<Pick<TableView, 'q' | 'author' | 'sort' | 'size'>>,
): TableView {
  return { ...view, ...change, page: 1 };
}
