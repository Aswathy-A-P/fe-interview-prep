import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from './api.ts';
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
  });

  it('sends a single request when "react" is typed quickly', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith([]));
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByLabelText('Search products'), 'react');

    expect(await screen.findByText("No results for 'react'")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('q=react');
  });

  it('shows loading, then results with the matched text highlighted', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(respondWith(phones));
    const user = userEvent.setup();
    render(<SearchPage />);

    await user.type(screen.getByLabelText('Search products'), 'phone');

    expect(await screen.findByRole('status')).toHaveTextContent('Loading');
    const list = await screen.findByRole('list', { name: 'Search results' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    const marks = list.querySelectorAll('mark');
    expect(Array.from(marks, (mark) => mark.textContent)).toEqual(['Phone', 'Phone']);
    expect(within(list).getByText('$549.00')).toBeInTheDocument();
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

    expect(await screen.findByRole('list', { name: 'Search results' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
