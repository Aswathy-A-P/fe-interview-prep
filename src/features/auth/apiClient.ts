import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './tokenStore.ts';
import type { RefreshResponse } from './types.ts';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let refreshPromise: Promise<string> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function onSessionExpired(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

async function readMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return String(body.message);
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new ApiError(response.status, await readMessage(response));
  return (await response.json()) as T;
}

export function postJson(path: string, body: unknown): Promise<Response> {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function requestAccessToken(): Promise<string> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new ApiError(401, 'Not logged in');
    const response = await postJson('/api/auth/refresh', { refreshToken });
    const { accessToken, expiresIn } = await parseResponse<RefreshResponse>(response);
    setAccessToken(accessToken, expiresIn);
    return accessToken;
  } catch (error) {
    clearTokens();
    sessionExpiredHandler?.();
    throw error;
  }
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function getWithToken(path: string, token: string | null): Promise<Response> {
  return fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}

export async function apiGet<T>(path: string): Promise<T> {
  const sentToken = getAccessToken();
  let response = await getWithToken(path, sentToken);
  if (response.status === 401) {
    const currentToken = getAccessToken();
    const refreshedMeanwhile = currentToken !== null && currentToken !== sentToken;
    const token = refreshedMeanwhile ? currentToken : await refreshAccessToken();
    response = await getWithToken(path, token);
  }
  return parseResponse<T>(response);
}
