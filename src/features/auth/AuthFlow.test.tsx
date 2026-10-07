import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App.tsx';
import { requestLogin } from './authApi.ts';
import { REFRESH_TOKEN_TTL_MS, createAuthHandlers } from './mocks/handlers.ts';
import { clearTokens, getRefreshToken, setRefreshToken } from './tokenStore.ts';

let now = Date.now();
const server = setupServer(...createAuthHandlers({ now: () => now }));

let refreshCalls = 0;
server.events.on('request:start', ({ request }) => {
  if (new URL(request.url).pathname === '/api/auth/refresh') refreshCalls += 1;
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  clearTokens();
  refreshCalls = 0;
});
afterAll(() => server.close());

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

async function logInThroughForm(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
  return user;
}

describe('login and session handling', () => {
  it('sends a logged-out visitor to login and back to the admin page afterwards', async () => {
    renderAt('/admin');

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    await logInThroughForm('admin@example.com', 'admin123');

    expect(await screen.findByRole('heading', { name: 'Admin stats' })).toBeInTheDocument();
    expect(await screen.findByText('Active sessions')).toBeInTheDocument();
  });

  it('shows an error for wrong credentials', async () => {
    renderAt('/login');

    await logInThroughForm('user@example.com', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('hides the admin page from a normal user', async () => {
    renderAt('/admin');

    await logInThroughForm('user@example.com', 'user123');

    expect(await screen.findByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('restores the session on reload without showing the login form', async () => {
    const { refreshToken } = await requestLogin({
      email: 'user@example.com',
      password: 'user123',
    });
    setRefreshToken(refreshToken);

    renderAt('/account');

    expect(screen.getByRole('status')).toHaveTextContent('Restoring session…');
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('Uma User')).toBeInTheDocument();
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(refreshCalls).toBe(1);
  });

  it('logs the user out and shows the login page when the refresh token has expired', async () => {
    renderAt('/account');
    const user = await logInThroughForm('user@example.com', 'user123');
    expect(await screen.findByText('Mechanical keyboard')).toBeInTheDocument();

    now += REFRESH_TOKEN_TTL_MS + 1_000;
    await user.click(screen.getByRole('button', { name: 'Fire 3 requests' }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(refreshCalls).toBe(1);
    expect(getRefreshToken()).toBeNull();
  });

  it('logs out from the nav and forgets the session', async () => {
    renderAt('/account');
    const user = await logInThroughForm('admin@example.com', 'admin123');

    await user.click(await screen.findByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(getRefreshToken()).toBeNull();
  });
});
