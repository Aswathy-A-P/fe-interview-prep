import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import TodoPage from './TodoPage.tsx';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderPage(url = '/todo') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <TodoPage />
      <LocationProbe />
    </MemoryRouter>,
  );
}

function currentUrl() {
  return screen.getByTestId('location').textContent ?? '';
}

async function addTodos(user: ReturnType<typeof userEvent.setup>, ...titles: string[]) {
  for (const title of titles) {
    await user.type(screen.getByLabelText('New todo'), `${title}{Enter}`);
  }
}

describe('TodoPage', () => {
  it('adds, completes, edits and deletes todos, ignoring blank titles', async () => {
    const user = userEvent.setup();
    renderPage();

    await addTodos(user, 'Buy milk', '   ', 'Walk dog');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('2 items left')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Mark "Buy milk" as completed'));
    expect(screen.getByText('1 item left')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit "Walk dog"' }));
    const editor = screen.getByRole('textbox', { name: 'Edit "Walk dog"' });
    await user.clear(editor);
    await user.type(editor, 'Walk the dog{Enter}');
    expect(screen.getByText('Walk the dog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete "Walk the dog"' }));
    expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument();
  });

  it('filters and clears completed todos', async () => {
    const user = userEvent.setup();
    renderPage();
    await addTodos(user, 'One', 'Two');
    await user.click(screen.getByLabelText('Mark "One" as completed'));

    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Two')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));
    await user.click(screen.getByRole('button', { name: 'Clear completed' }));
    expect(screen.queryByText('One')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled();
  });

  it('keeps the todos and the selected filter after a refresh', async () => {
    const user = userEvent.setup();
    const first = renderPage();
    await addTodos(user, 'Persist me', 'Done already');
    await user.click(screen.getByLabelText('Mark "Done already" as completed'));
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    const url = currentUrl();
    expect(url).toBe('/todo?filter=completed');
    first.unmount();

    renderPage(url);
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Done already')).toBeInTheDocument();
    expect(screen.queryByText('Persist me')).not.toBeInTheDocument();
    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });

  it('restores the filter from the URL and falls back to all for invalid values', async () => {
    const user = userEvent.setup();
    const first = renderPage();
    await addTodos(user, 'Open', 'Closed');
    await user.click(screen.getByLabelText('Mark "Closed" as completed'));
    first.unmount();

    const second = renderPage('/todo?filter=completed');
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText('Open')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(currentUrl()).toBe('/todo');
    second.unmount();

    renderPage('/todo?filter=bogus');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('reorders todos with the move buttons, using the visible order under a filter', async () => {
    const user = userEvent.setup();
    renderPage();
    await addTodos(user, 'A', 'B', 'C');
    const titles = () =>
      screen.getAllByRole('listitem').map((item) => within(item).getByText(/^[ABC]$/).textContent);

    expect(screen.getByRole('button', { name: 'Move "A" up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move "C" down' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Move "C" up' }));
    expect(titles()).toEqual(['A', 'C', 'B']);

    await user.click(screen.getByLabelText('Mark "C" as completed'));
    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByRole('button', { name: 'Move "B" down' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Move "B" up' }));

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(titles()).toEqual(['B', 'A', 'C']);
  });
});
