import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoPage from './TodoPage.tsx';

async function addTodos(user: ReturnType<typeof userEvent.setup>, ...titles: string[]) {
  for (const title of titles) {
    await user.type(screen.getByLabelText('New todo'), `${title}{Enter}`);
  }
}

describe('TodoPage', () => {
  it('adds, completes, edits and deletes todos, ignoring blank titles', async () => {
    const user = userEvent.setup();
    render(<TodoPage />);

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
    render(<TodoPage />);
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
    const first = render(<TodoPage />);
    await addTodos(user, 'Persist me', 'Done already');
    await user.click(screen.getByLabelText('Mark "Done already" as completed'));
    await user.click(screen.getByRole('button', { name: 'Completed' }));
    first.unmount();

    render(<TodoPage />);
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('Done already')).toBeInTheDocument();
    expect(screen.queryByText('Persist me')).not.toBeInTheDocument();
    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });
});
