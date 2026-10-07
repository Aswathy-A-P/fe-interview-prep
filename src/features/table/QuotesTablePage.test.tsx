import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import QuotesTablePage from './QuotesTablePage.tsx';
import type { Quote } from './quotes.ts';

const quotes: Quote[] = Array.from({ length: 30 }, (_, index) => {
  const id = index + 1;
  return { id, quote: `Line ${id}${' more'.repeat(id)}`, author: id % 2 === 0 ? 'Ada' : 'Linus' };
});

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="Current query">{location.search}</output>
      <button type="button" onClick={() => navigate(-1)}>
        Browser back
      </button>
    </>
  );
}

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <QuotesTablePage />
      <LocationProbe />
    </MemoryRouter>,
  );
}

const firstIds = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent);

const query = () => screen.getByLabelText('Current query').textContent;

describe('QuotesTablePage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ quotes }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('restores the exact view from a shared link', async () => {
    renderAt('/table?q=line&author=Ada&sort=words&dir=desc&page=2&size=10');

    expect(await screen.findByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('line');
    expect(screen.getByRole('combobox', { name: 'Author' })).toHaveValue('Ada');
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveValue('10');
    expect(screen.getByRole('columnheader', { name: /words/i })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(firstIds()).toEqual(['10', '8', '6', '4', '2']);
  });

  it('goes back to page 1 when the author filter changes', async () => {
    const user = userEvent.setup();
    renderAt('/table?page=3');
    expect(await screen.findByText('Page 3 of 3')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Author' }), 'Linus');

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(query()).toBe('?author=Linus');
    expect(firstIds()[0]).toBe('1');
  });

  it('records each change in history so back restores the previous view', async () => {
    const user = userEvent.setup();
    renderAt('/table');
    await screen.findByText('Page 1 of 3');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: /words/i }));
    await user.click(screen.getByRole('button', { name: /words/i }));
    expect(query()).toBe('?sort=words&dir=desc');
    expect(firstIds()[0]).toBe('30');

    await user.click(screen.getByRole('button', { name: 'Browser back' }));
    expect(query()).toBe('?sort=words&dir=asc');
    await user.click(screen.getByRole('button', { name: 'Browser back' }));
    expect(query()).toBe('?page=2');
    expect(firstIds()[0]).toBe('11');
  });

  it('keeps one history entry while typing a search', async () => {
    const user = userEvent.setup();
    renderAt('/table');
    await screen.findByText('Page 1 of 3');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'line 2');
    expect(query()).toBe('?q=line+2');
    expect(screen.getByText('Showing 1–10 of 11 quotes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Browser back' }));
    expect(query()).toBe('');
  });

  it('shows an error with a retry when loading fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    renderAt('/table');
    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed with status 500');
  });

  it('hides a column and keeps the page', async () => {
    const user = userEvent.setup();
    renderAt('/table?page=2');
    await screen.findByText('Page 2 of 3');

    await user.click(screen.getByText('Columns'));
    await user.click(screen.getByRole('checkbox', { name: 'Author' }));

    expect(screen.queryByRole('columnheader', { name: /author/i })).not.toBeInTheDocument();
    expect(query()).toBe('?page=2&hide=author');
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('restores hidden columns from the URL and keeps the last one visible', async () => {
    renderAt('/table?hide=id&hide=quote&hide=author');
    await screen.findByText('Page 1 of 3');

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Words↕',
    ]);
    expect(screen.getByRole('checkbox', { name: 'Words' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Author' })).not.toBeChecked();
  });
});

describe('QuotesTablePage in server-side mode', () => {
  const fetchPage = vi.fn((url: string) => {
    const params = new URL(url).searchParams;
    const limit = Number(params.get('limit'));
    const skip = Number(params.get('skip'));
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ quotes: quotes.slice(skip, skip + limit), total: 30 }),
    });
  });

  beforeEach(() => {
    fetchPage.mockClear();
    vi.stubGlobal('fetch', fetchPage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lastUrl = () => fetchPage.mock.calls.at(-1)?.[0];

  it('fetches each page with limit and skip', async () => {
    const user = userEvent.setup();
    renderAt('/table?mode=server');
    expect(await screen.findByText('Page 1 of 3')).toBeInTheDocument();
    expect(lastUrl()).toBe('https://dummyjson.com/quotes?limit=10&skip=0');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: /words/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(lastUrl()).toBe('https://dummyjson.com/quotes?limit=10&skip=10');
    expect(await screen.findByText('Showing 11–20 of 30 quotes')).toBeInTheDocument();
    expect(firstIds()[0]).toBe('11');
  });

  it('requests the new limit from page 1 when the page size changes', async () => {
    const user = userEvent.setup();
    renderAt('/table?mode=server&page=3');
    await screen.findByText('Page 3 of 3');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');

    expect(lastUrl()).toBe('https://dummyjson.com/quotes?limit=25&skip=0');
    expect(query()).toBe('?mode=server&size=25');
    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
  });
});
