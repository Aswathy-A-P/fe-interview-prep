import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from './api.ts';
import { searchCache } from './searchCache.ts';
import SearchPage from './SearchPage.tsx';

function respondWith(products: Product[], status = 200): Response {
  return new Response(JSON.stringify({ products }), { status });
}

const phones: Product[] = [
  { id: 1, title: 'iPhone 9', brand: 'Apple', category: 'smartphones', price: 549 },
  { id: 2, title: 'Phone Stand', category: 'accessories', price: 12.5 },
];

describe('SearchPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    searchCache.clear();
  });

  it('sends a single request when "react" is typed quickly', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith([]));
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByLabelText('Search products'), 'react');

    expect(await screen.findByText("No results for 'react'")).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("No results found for 'react'");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('q=react');
  });

  it('shows loading, then results with the matched text highlighted', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(phones));
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByLabelText('Search products'), 'phone');

    expect(await screen.findByText('Loading results…')).toHaveAttribute('aria-live', 'polite');
    const list = await screen.findByRole('listbox', { name: 'Search results' });
    expect(within(list).getAllByRole('option')).toHaveLength(2);
    const marks = list.querySelectorAll('mark');
    expect(Array.from(marks, (mark) => mark.textContent)).toEqual(['Phone', 'Phone']);
    expect(within(list).getByText('$549.00')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("2 results for 'phone'");
  });

  it('shows an error with a retry button that fetches again', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(respondWith([], 500))
      .mockResolvedValueOnce(respondWith(phones));
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByLabelText('Search products'), 'phone');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('status 500');
    await user.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('listbox', { name: 'Search results' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('moves the active option with the arrow keys and selects it with Enter', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(phones));
    const user = userEvent.setup();
    render(<SearchPage />);
    const input = screen.getByRole('combobox', { name: 'Search products' });

    await user.type(input, 'phone');
    const options = within(await screen.findByRole('listbox')).getAllByRole('option');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).not.toHaveAttribute('aria-activedescendant');

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', options[1]?.id);
    expect(options[0]).toHaveAttribute('aria-selected', 'false');

    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);

    await user.keyboard('{ArrowUp}{Enter}');
    expect(screen.getByText(/Selected:/)).toHaveTextContent('Selected: Phone Stand');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears the active option and then closes the list on Escape', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(phones));
    const user = userEvent.setup();
    render(<SearchPage />);
    const input = screen.getByRole('combobox', { name: 'Search products' });

    await user.type(input, 'phone');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}{Escape}');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('reuses cached results for a repeated query', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => respondWith(phones));
    const user = userEvent.setup();
    render(<SearchPage />);
    const input = screen.getByRole('combobox', { name: 'Search products' });

    await user.type(input, 'phone');
    expect(await screen.findByText("2 results for 'phone'")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'stand');
    expect(await screen.findByText("2 results for 'stand'")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'phone');
    expect(await screen.findByText("2 results for 'phone'")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
