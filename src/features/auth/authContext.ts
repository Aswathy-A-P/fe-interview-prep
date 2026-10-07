import { createContext, useContext } from 'react';
import type { Credentials, User } from './types.ts';

export type AuthState =
  | { status: 'restoring'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'anonymous'; user: null };

export type AuthContextValue = AuthState & {
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
