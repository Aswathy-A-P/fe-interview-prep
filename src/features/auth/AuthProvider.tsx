import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onSessionExpired } from './apiClient.ts';
import { AuthContext, type AuthState } from './authContext.ts';
import { requestLogin, restoreSession } from './authApi.ts';
import { connectSessionSync, type ConnectSessionSync, type SessionSync } from './sessionSync.ts';
import { clearTokens, getRefreshToken, setAccessToken, setRefreshToken } from './tokenStore.ts';
import type { Credentials } from './types.ts';

const ANONYMOUS: AuthState = { status: 'anonymous', user: null };

function initialState(): AuthState {
  return getRefreshToken() ? { status: 'restoring', user: null } : ANONYMOUS;
}

interface AuthProviderProps {
  children: ReactNode;
  connectSync?: ConnectSessionSync;
}

function AuthProvider({ children, connectSync = connectSessionSync }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const syncRef = useRef<SessionSync | null>(null);

  useEffect(() => {
    const sync = connectSync((message) => {
      if (message.type === 'logout') {
        clearTokens();
        setState(ANONYMOUS);
        return;
      }
      if (!getRefreshToken()) return;
      restoreSession().then(
        (user) => setState({ status: 'authenticated', user }),
        () => setState(ANONYMOUS),
      );
    });
    syncRef.current = sync;
    return () => {
      syncRef.current = null;
      sync.close();
    };
  }, [connectSync]);

  useEffect(() => {
    onSessionExpired(() => {
      setState(ANONYMOUS);
      syncRef.current?.post({ type: 'logout' });
    });
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
    syncRef.current?.post({ type: 'login' });
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setState(ANONYMOUS);
    syncRef.current?.post({ type: 'logout' });
  }, []);

  const value = useMemo(() => ({ ...state, login, logout }), [state, login, logout]);

  if (state.status === 'restoring') {
    return (
      <p className="py-16 text-center text-muted" role="status">
        Restoring session…
      </p>
    );
  }

  return <AuthContext value={value}>{children}</AuthContext>;
}

export default AuthProvider;
