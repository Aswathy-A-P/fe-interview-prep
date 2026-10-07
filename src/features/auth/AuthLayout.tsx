import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import { cn } from '../../lib/cn.ts';
import AuthProvider from './AuthProvider.tsx';
import { useAuth } from './authContext.ts';
import { idleSettings } from './idleSettings.ts';
import IdleWarning from './IdleWarning.tsx';

const barClass =
  'mx-auto mb-8 flex w-full max-w-2xl flex-wrap items-center justify-between gap-4 border-b border-border pb-4';

function pillClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-full px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface hover:text-ink',
  );
}

function SessionNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <nav className={barClass} aria-label="Session">
        <span className="text-sm text-muted">Not logged in</span>
        <NavLink to="/login" className={pillClass}>
          Log in
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className={barClass} aria-label="Session">
      <div className="flex flex-wrap items-center gap-1 rounded-full border border-border bg-white p-1 shadow-xs">
        <NavLink to="/account" className={pillClass}>
          Account
        </NavLink>
        {user.role === 'admin' && (
          <NavLink to="/admin" className={pillClass}>
            Admin
          </NavLink>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">
          Signed in as {user.name} ({user.role})
        </span>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Log out
        </Button>
      </div>
    </nav>
  );
}

function SessionIdleWarning() {
  const { status, logout } = useAuth();
  const [settings] = useState(() => idleSettings(window.location.search, import.meta.env.DEV));

  if (status !== 'authenticated') return null;
  return <IdleWarning {...settings} onLogout={logout} />;
}

function AuthLayout() {
  return (
    <AuthProvider>
      <div className="w-full">
        <SessionNav />
        <SessionIdleWarning />
        <Outlet />
      </div>
    </AuthProvider>
  );
}

export default AuthLayout;
