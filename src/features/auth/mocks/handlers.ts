import { delay, http, HttpResponse, type PathParams } from 'msw';
import type {
  AdminStats,
  Credentials,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  User,
} from '../types.ts';
import { MOCK_ORDERS, MOCK_USERS } from './data.ts';

export const ACCESS_TOKEN_TTL_MS = 30_000;
export const REFRESH_TOKEN_TTL_MS = 10 * 60_000;

export interface MockBackendOptions {
  now?: () => number;
  accessTokenTtlMs?: number;
  refreshTokenTtlMs?: number;
}

interface TokenRecord {
  userId: string;
  expiresAt: number;
}

function toPublicUser({ id, name, email, role }: User): User {
  return { id, name, email, role };
}

function errorResponse(status: number, message: string) {
  return HttpResponse.json({ message }, { status });
}

export function createAuthHandlers({
  now = Date.now,
  accessTokenTtlMs = ACCESS_TOKEN_TTL_MS,
  refreshTokenTtlMs = REFRESH_TOKEN_TTL_MS,
}: MockBackendOptions = {}) {
  const accessTokens = new Map<string, TokenRecord>();
  const refreshTokens = new Map<string, TokenRecord>();

  const issueToken = (store: Map<string, TokenRecord>, userId: string, ttlMs: number) => {
    const token = crypto.randomUUID();
    store.set(token, { userId, expiresAt: now() + ttlMs });
    return token;
  };

  const issueAccessToken = (userId: string): RefreshResponse => ({
    accessToken: issueToken(accessTokens, userId, accessTokenTtlMs),
    expiresIn: accessTokenTtlMs / 1000,
  });

  const findUser = (store: Map<string, TokenRecord>, token: string | null | undefined) => {
    const record = token ? store.get(token) : undefined;
    if (!record || record.expiresAt <= now()) return undefined;
    return MOCK_USERS.find((user) => user.id === record.userId);
  };

  const authenticate = (request: Request) => {
    const header = request.headers.get('Authorization');
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
    return findUser(accessTokens, token);
  };

  const activeSessions = () =>
    [...refreshTokens.values()].filter((record) => record.expiresAt > now()).length;

  return [
    http.post<PathParams, Credentials>('/api/auth/login', async ({ request }) => {
      await delay();
      const { email, password } = await request.json();
      const user = MOCK_USERS.find(
        (candidate) => candidate.email === email && candidate.password === password,
      );
      if (!user) return errorResponse(401, 'Invalid email or password');
      const body: LoginResponse = {
        ...issueAccessToken(user.id),
        refreshToken: issueToken(refreshTokens, user.id, refreshTokenTtlMs),
        user: toPublicUser(user),
      };
      return HttpResponse.json(body);
    }),

    http.post<PathParams, RefreshRequest>('/api/auth/refresh', async ({ request }) => {
      await delay();
      const { refreshToken } = await request.json();
      const user = findUser(refreshTokens, refreshToken);
      if (!user) return errorResponse(401, 'Refresh token expired or invalid');
      return HttpResponse.json(issueAccessToken(user.id));
    }),

    http.get('/api/me', async ({ request }) => {
      await delay();
      const user = authenticate(request);
      if (!user) return errorResponse(401, 'Access token expired or invalid');
      return HttpResponse.json(toPublicUser(user));
    }),

    http.get('/api/orders', async ({ request }) => {
      await delay();
      const user = authenticate(request);
      if (!user) return errorResponse(401, 'Access token expired or invalid');
      return HttpResponse.json(MOCK_ORDERS[user.id] ?? []);
    }),

    http.get('/api/admin/stats', async ({ request }) => {
      await delay();
      const user = authenticate(request);
      if (!user) return errorResponse(401, 'Access token expired or invalid');
      if (user.role !== 'admin') return errorResponse(403, 'Admins only');
      const orders = Object.values(MOCK_ORDERS).flat();
      const body: AdminStats = {
        totalUsers: MOCK_USERS.length,
        totalOrders: orders.length,
        revenue: orders.reduce((sum, order) => sum + order.total, 0),
        activeSessions: activeSessions(),
      };
      return HttpResponse.json(body);
    }),
  ];
}
