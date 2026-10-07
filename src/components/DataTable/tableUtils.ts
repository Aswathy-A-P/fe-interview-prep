import type { ReactNode } from 'react';

export type CellValue = string | number;

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => CellValue;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export function nextSort(current: SortState | null, columnId: string): SortState | null {
  if (current?.columnId !== columnId) return { columnId, direction: 'asc' };
  if (current.direction === 'asc') return { columnId, direction: 'desc' };
  return null;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compareValues(a: CellValue, b: CellValue): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

export function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState | null): T[] {
  const column = sort && columns.find((candidate) => candidate.id === sort.columnId);
  if (!sort || !column) return rows;
  const sign = sort.direction === 'asc' ? 1 : -1;
  return rows.toSorted((a, b) => sign * compareValues(column.accessor(a), column.accessor(b)));
}

export function searchRows<T>(rows: T[], columns: Column<T>[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    columns.some((column) => String(column.accessor(row)).toLowerCase().includes(needle)),
  );
}

export const PAGE_SIZES = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export function isPageSize(value: number): value is PageSize {
  return (PAGE_SIZES as readonly number[]).includes(value);
}

export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
