import { act, fireEvent, render, screen } from '@testing-library/react';
import IdleWarning from './IdleWarning.tsx';

const IDLE_MS = 5 * 60_000;
const WARNING_MS = 60_000;

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function renderWarning() {
  const onLogout = vi.fn();
  render(<IdleWarning idleMs={IDLE_MS} warningMs={WARNING_MS} onLogout={onLogout} />);
  return onLogout;
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('IdleWarning', () => {
  it('warns after the idle time and focuses the primary button', () => {
    renderWarning();
    advance(IDLE_MS - 1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    advance(1);

    const dialog = screen.getByRole('alertdialog', { name: 'Are you still there?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent("You'll be logged out in 60s due to inactivity.");
    expect(screen.getByRole('button', { name: 'Stay signed in' })).toHaveFocus();
    advance(1000);
    expect(dialog).toHaveTextContent('logged out in 59s');
  });

  it('treats user activity as a reset of the idle timer', () => {
    renderWarning();
    advance(IDLE_MS - 1000);
    fireEvent.keyDown(window);
    advance(IDLE_MS - 1000);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('hides the warning and restarts the timer on "Stay signed in"', () => {
    const onLogout = renderWarning();
    advance(IDLE_MS);

    fireEvent.click(screen.getByRole('button', { name: 'Stay signed in' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    advance(IDLE_MS - 1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    advance(1);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('logs out when the countdown reaches zero', () => {
    const onLogout = renderWarning();
    advance(IDLE_MS);
    advance(WARNING_MS - 1000);
    expect(onLogout).not.toHaveBeenCalled();

    advance(1000);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
