import Button from '../ui/Button.tsx';
import { fieldClass } from '../ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { PAGE_SIZES, isPageSize, type PageSize } from './tableUtils.ts';

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

function Pagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 text-sm"
      aria-label="Pagination"
    >
      <label className="inline-flex items-center gap-2 font-medium">
        Rows per page
        <select
          className={cn(fieldClass, 'py-1.5 text-sm font-normal')}
          value={pageSize}
          onChange={(event) => {
            const size = Number(event.target.value);
            if (isPageSize(size)) onPageSizeChange(size);
          }}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3">
        <span className="text-muted tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <Button size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
