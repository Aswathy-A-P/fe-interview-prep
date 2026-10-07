import { delay, http } from 'msw';
import { setupServer } from 'msw/node';
import { onSessionExpired } from './apiClient.ts';
import { fetchCurrentUser, fetchOrders, requestLogin } from './authApi.ts';
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS, createAuthHandlers } from './mocks/handlers.ts';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './tokenStore.ts';

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
  onSessionExpired(null);
  refreshCalls = 0;
});
afterAll(() => server.close());

async function logIn(email = 'user@example.com', password = 'user123') {
  const result = await requestLogin({ email, password });
  setAccessToken(result.accessToken, result.expiresIn);
  setRefreshToken(result.refreshToken);
}

describe('apiClient', () => {
  it('sends a single refresh call when three requests fail with an expired access token', async () => {
    await logIn();
    const expiredToken = getAccessToken();
    now += ACCESS_TOKEN_TTL_MS + 1_000;

    const [user, orders, again] = await Promise.all([
      fetchCurrentUser(),
      fetchOrders(),
      fetchCurrentUser(),
    ]);

    expect(refreshCalls).toBe(1);
    expect(user.email).toBe('user@example.com');
    expect(again.email).toBe('user@example.com');
    expect(orders).toHaveLength(3);
    expect(getAccessToken()).not.toBe(expiredToken);
  });

  it('reuses the new token for a request whose 401 arrives after the refresh finished', async () => {
    await logIn();
    now += ACCESS_TOKEN_TTL_MS + 1_000;
    server.use(
      http.get('/api/orders', async () => {
        await delay(100);
      }),
    );

    const [user, orders] = await Promise.all([fetchCurrentUser(), fetchOrders()]);

    expect(refreshCalls).toBe(1);
    expect(user.role).toBe('user');
    expect(orders).toHaveLength(3);
  });

  it('does not refresh while the access token is still valid', async () => {
    await logIn();
    now += ACCESS_TOKEN_TTL_MS - 5_000;

    await Promise.all([fetchCurrentUser(), fetchOrders()]);

    expect(refreshCalls).toBe(0);
  });

  it('clears the session and reports it once when the refresh token has expired', async () => {
    const sessionExpired = vi.fn();
    onSessionExpired(sessionExpired);
    await logIn();
    now += REFRESH_TOKEN_TTL_MS + 1_000;

    const results = await Promise.allSettled([
      fetchCurrentUser(),
      fetchOrders(),
      fetchCurrentUser(),
    ]);

    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(sessionExpired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
