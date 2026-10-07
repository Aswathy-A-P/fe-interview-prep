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
      return <p className="text-muted">Start typing to search products.</p>;
    case 'loading':
      return (
        <p aria-hidden="true" className="text-muted">
          Loading…
        </p>
      );
    case 'error':
      return (
        <div role="alert" className="flex items-center gap-3">
          <p className="text-danger">Could not load results: {state.message}</p>
          <Button variant="primary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      );
    case 'success':
      if (state.products.length === 0) {
        return <p className="text-muted">No results for '{query}'</p>;
      }
      if (!open) {
        return null;
      }
      return (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className={cn(cardClass, 'm-0 list-none p-0')}
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
                'flex cursor-pointer items-center justify-between gap-4 border-b border-border px-3 py-2 last:border-b-0',
                index === activeIndex && 'bg-accent/10 outline-2 -outline-offset-2 outline-accent',
              )}
            >
              <div>
                <div className="font-semibold">
                  <Highlight text={product.title} query={query} />
                </div>
                <div className="text-muted">
                  {product.brand && (
                    <>
                      <Highlight text={product.brand} query={query} /> ·{' '}
                    </>
                  )}
                  {product.category}
                </div>
              </div>
              <span className="whitespace-nowrap">{priceFormat.format(product.price)}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export default SearchResults;
