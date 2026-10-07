import { useState } from 'react';
import { fieldClass } from '../../components/ui/fieldStyles.ts';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import { cn } from '../../lib/cn.ts';
import SearchResults from './SearchResults.tsx';
import { useProductSearch } from './useProductSearch.ts';

export const SEARCH_DELAY_MS = 300;

function SearchPage() {
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DELAY_MS);
  const { state, retry } = useProductSearch(query);

  return (
    <section className="max-w-160">
      <h1 className="mb-4 text-3xl font-bold">Live Search</h1>
      <label htmlFor="search-input" className="mb-1 block font-semibold">
        Search products
      </label>
      <input
        id="search-input"
        type="search"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Try “phone” or “laptop”"
        autoComplete="off"
        className={cn(fieldClass, 'mb-4 w-full')}
      />
      <SearchResults state={state} query={query} onRetry={retry} />
    </section>
  );
}

export default SearchPage;
