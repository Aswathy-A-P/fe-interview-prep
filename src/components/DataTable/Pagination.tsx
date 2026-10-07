import Button from '../ui/Button.tsx';
import { fieldClass } from '../ui/fieldStyles.ts';
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
      className="mt-4 flex flex-wrap items-center justify-end gap-3 text-sm"
      aria-label="Pagination"
    >
      <label>
        Rows per page{' '}
        <select
          className={fieldClass}
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
      <Button size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </Button>
      <span>
        Page {page} of {totalPages}
      </span>
      <Button size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </Button>
    </nav>
  );
}

export default Pagination;
