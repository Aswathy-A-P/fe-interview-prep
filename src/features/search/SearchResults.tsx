import Button from '../../components/ui/Button.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import type { Product } from './api.ts';
import Highlight from './Highlight.tsx';
import { optionId } from './searchIds.ts';
import type { SearchState } from './useProductSearch.ts';

interface SearchResultsProps {
  state: SearchState;
  query: string;
  listboxId: string;
  open: boolean;
  activeIndex: number;
  onSelect: (product: Product) => void;
  onRetry: () => void;
}

const stateClass = cn(cardClass, 'px-5 py-10 text-center text-muted');

const priceFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function SearchResults({
  state,
  query,
  listboxId,
  open,
  activeIndex,
  onSelect,
  onRetry,
}: SearchResultsProps) {
  switch (state.status) {
    case 'idle':
      return <p className={stateClass}>Start typing to search products.</p>;
    case 'loading':
      return (
        <p aria-hidden="true" className={stateClass}>
          Loading…
        </p>
      );
    case 'error':
      return (
        <div
          role="alert"
          className={cn(cardClass, 'flex flex-col items-center gap-4 px-5 py-10 text-center')}
        >
          <p className="text-danger">Could not load results: {state.message}</p>
          <Button variant="primary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      );
    case 'success':
      if (state.products.length === 0) {
        return <p className={stateClass}>No results for '{query}'</p>;
      }
      if (!open) {
        return null;
      }
      return (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className={cn(cardClass, 'm-0 list-none overflow-hidden p-0')}
        >
          {state.products.map((product, index) => (
            <li
              key={product.id}
              id={optionId(product)}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(product)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-accent/5',
                index === activeIndex && 'bg-accent/10 outline-2 -outline-offset-2 outline-accent',
              )}
            >
              <div className="min-w-0 space-y-1">
                <div className="font-semibold text-ink">
                  <Highlight text={product.title} query={query} />
                </div>
                <div className="text-sm text-muted">
                  {product.brand && (
                    <>
                      <Highlight text={product.brand} query={query} /> ·{' '}
                    </>
                  )}
                  {product.category}
                </div>
              </div>
              <span className="shrink-0 font-semibold whitespace-nowrap text-ink tabular-nums">
                {priceFormat.format(product.price)}
              </span>
            </li>
          ))}
        </ul>
      );
  }
}

export default SearchResults;
