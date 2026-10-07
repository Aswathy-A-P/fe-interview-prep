import { readStorage, removeStorage, writeStorage } from '../../lib/storage.ts';

export const REFRESH_TOKEN_KEY = 'q5.refreshToken';

let accessToken: string | null = null;
let accessTokenExpiresAt: number | null = null;

const isString = (value: unknown): value is string => typeof value === 'string';

export function getAccessToken(): string | null {
  return accessToken;
}

export function getAccessTokenExpiresAt(): number | null {
  return accessTokenExpiresAt;
}

export function setAccessToken(token: string, expiresInSeconds: number): void {
  accessToken = token;
  accessTokenExpiresAt = Date.now() + expiresInSeconds * 1000;
}

export function forgetAccessToken(): void {
  accessToken = null;
  accessTokenExpiresAt = null;
}

export function getRefreshToken(): string | null {
  return readStorage<string | null>(REFRESH_TOKEN_KEY, null, isString);
}

export function setRefreshToken(token: string): void {
  writeStorage(REFRESH_TOKEN_KEY, token);
}

export function clearTokens(): void {
  forgetAccessToken();
  removeStorage(REFRESH_TOKEN_KEY);
}
