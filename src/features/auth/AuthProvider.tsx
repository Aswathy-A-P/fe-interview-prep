import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onSessionExpired } from './apiClient.ts';
import { AuthContext, type AuthState } from './authContext.ts';
import { requestLogin, restoreSession } from './authApi.ts';
import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from './tokenStore.ts';
import type { Credentials } from './types.ts';

const ANONYMOUS: AuthState = { status: 'anonymous', user: null };

function initialState(): AuthState {
  return getRefreshToken() ? { status: 'restoring', user: null } : ANONYMOUS;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    onSessionExpired(() => setState(ANONYMOUS));
    return () => onSessionExpired(null);
  }, []);

  useEffect(() => {
    if (!getRefreshToken()) return;
    let active = true;
    restoreSession().then(
      (user) => {
        if (active) setState({ status: 'authenticated', user });
      },
      () => {
        if (active) setState(ANONYMOUS);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const { accessToken, expiresIn, refreshToken, user } = await requestLogin(credentials);
    setAccessToken(accessToken, expiresIn);
    setRefreshToken(refreshToken);
    setState({ status: 'authenticated', user });
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setState(ANONYMOUS);
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);

  if (state.status === 'restoring') {
    return (
      <p className="text-muted" role="status">
        Restoring session…
      </p>
    );
  }

  return <AuthContext value={value}>{children}</AuthContext>;
}

export default AuthProvider;
