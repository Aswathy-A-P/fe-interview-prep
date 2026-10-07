import { useState, type KeyboardEvent } from 'react';
import { fieldClass } from '../../components/ui/fieldStyles.ts';
import Page from '../../components/ui/Page.tsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import { cn } from '../../lib/cn.ts';
import type { Product } from './api.ts';
import SearchResults from './SearchResults.tsx';
import { LISTBOX_ID, optionId } from './searchIds.ts';
import { useProductSearch, type SearchState } from './useProductSearch.ts';

export const SEARCH_DELAY_MS = 300;

function announcement(state: SearchState, query: string): string {
  switch (state.status) {
    case 'idle':
      return '';
    case 'loading':
      return 'Loading results…';
    case 'error':
      return 'Search failed. Use the Retry button to try again.';
    case 'success':
      return state.products.length === 0
        ? `No results found for '${query}'`
        : `${state.products.length} results for '${query}'`;
  }
}

function SearchPage() {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState<Product | null>(null);
  const query = useDebouncedValue(input.trim(), SEARCH_DELAY_MS);
  const { state, retry } = useProductSearch(query);

  const products = state.status === 'success' ? state.products : [];
  const expanded = open && products.length > 0;
  const activeProduct = expanded ? products[activeIndex] : undefined;

  const select = (product: Product) => {
    setSelected(product);
    setActiveIndex(-1);
    setOpen(false);
  };

  const move = (step: number) => {
    setOpen(true);
    setActiveIndex((current) => {
      if (current === -1) {
        return step > 0 ? 0 : products.length - 1;
      }
      return (current + step + products.length) % products.length;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (activeIndex !== -1) {
        setActiveIndex(-1);
      } else {
        setOpen(false);
      }
      return;
    }
    if (products.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (expanded && event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (expanded && event.key === 'End') {
      event.preventDefault();
      setActiveIndex(products.length - 1);
    } else if (event.key === 'Enter' && activeProduct) {
      event.preventDefault();
      select(activeProduct);
    }
  };

  return (
    <Page
      title="Live Search"
      description="Debounced product search that always shows results for the latest query."
      width="md"
    >
      <div className="space-y-2">
        <label htmlFor="search-input" className="block text-sm font-medium text-ink">
          Search products
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m17 17-3.5-3.5" />
          </svg>
          <input
            id="search-input"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeProduct ? optionId(activeProduct) : undefined}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Try “phone” or “laptop”"
            autoComplete="off"
            className={cn(fieldClass, 'w-full py-3 pr-4 pl-12 text-base')}
          />
        </div>
      </div>
      {selected && (
        <p className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-ink">
          Selected: <span className="font-semibold">{selected.title}</span>
        </p>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement(state, query)}
      </p>
      <SearchResults
        state={state}
        query={query}
        listboxId={LISTBOX_ID}
        open={open}
        activeIndex={activeIndex}
        onSelect={select}
        onRetry={retry}
      />
    </Page>
  );
}

export default SearchPage;
