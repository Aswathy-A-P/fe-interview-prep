import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App.tsx';
import { createAuthHandlers } from './mocks/handlers.ts';
import { connectSessionSync, SESSION_CHANNEL_NAME, type SessionMessage } from './sessionSync.ts';
import { clearTokens, getAccessToken, REFRESH_TOKEN_KEY } from './tokenStore.ts';

const server = setupServer(...createAuthHandlers());
let otherTab: BroadcastChannel;
let received: unknown[];

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  received = [];
  otherTab = new BroadcastChannel(SESSION_CHANNEL_NAME);
  otherTab.addEventListener('message', (event: MessageEvent<unknown>) => {
    received.push(event.data);
  });
});
afterEach(() => {
  otherTab.close();
  server.resetHandlers();
  clearTokens();
});
afterAll(() => server.close());

async function renderLoggedIn() {
  render(
    <MemoryRouter initialEntries={['/account']}>
      <App />
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Email'), 'user@example.com');
  await user.type(screen.getByLabelText('Password'), 'user123');
  await user.click(screen.getByRole('button', { name: 'Log in' }));
  expect(await screen.findByRole('heading', { name: 'Account' })).toBeInTheDocument();
  return user;
}

describe('cross-tab session sync', () => {
  it('logs this tab out when another tab logs out', async () => {
    await renderLoggedIn();
    await waitFor(() => expect(received).toEqual([{ type: 'login' }]));

    otherTab.postMessage({ type: 'logout' } satisfies SessionMessage);

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(getAccessToken()).toBeNull();
    expect(received).toEqual([{ type: 'login' }]);
  });

  it('posts exactly one logout message on a local logout', async () => {
    const user = await renderLoggedIn();

    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    await waitFor(() => expect(received).toEqual([{ type: 'login' }, { type: 'logout' }]));
  });

  it('falls back to storage events on the refresh-token key without BroadcastChannel', () => {
    const onMessage = vi.fn();
    const sync = connectSessionSync(onMessage, null);

    window.dispatchEvent(new StorageEvent('storage', { key: 'other', newValue: null }));
    window.dispatchEvent(new StorageEvent('storage', { key: REFRESH_TOKEN_KEY, newValue: null }));
    window.dispatchEvent(new StorageEvent('storage', { key: REFRESH_TOKEN_KEY, newValue: '"t"' }));
    sync.close();

    expect(onMessage.mock.calls).toEqual([[{ type: 'logout' }], [{ type: 'login' }]]);
  });
});
