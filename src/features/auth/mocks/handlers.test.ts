import { setupServer } from 'msw/node';
import { refreshAccessToken } from '../apiClient.ts';
import { requestLogin } from '../authApi.ts';
import { clearTokens, setRefreshToken } from '../tokenStore.ts';
import { createAuthHandlers } from './handlers.ts';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  clearTokens();
});
afterAll(() => server.close());

describe('mock auth backend', () => {
  it('keeps refresh tokens valid across a page reload when given storage', async () => {
    server.use(...createAuthHandlers({ storage: localStorage }));
    const { refreshToken } = await requestLogin({
      email: 'admin@example.com',
      password: 'admin123',
    });
    setRefreshToken(refreshToken);

    server.resetHandlers(...createAuthHandlers({ storage: localStorage }));

    await expect(refreshAccessToken()).resolves.toEqual(expect.any(String));
  });

  it('forgets refresh tokens on reload without storage', async () => {
    server.use(...createAuthHandlers());
    const { refreshToken } = await requestLogin({
      email: 'admin@example.com',
      password: 'admin123',
    });
    setRefreshToken(refreshToken);

    server.resetHandlers(...createAuthHandlers());

    await expect(refreshAccessToken()).rejects.toThrow('Refresh token expired or invalid');
  });
});
