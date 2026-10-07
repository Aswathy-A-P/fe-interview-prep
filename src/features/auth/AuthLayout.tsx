import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import AuthProvider from './AuthProvider.tsx';
import { useAuth } from './authContext.ts';
import { idleSettings } from './idleSettings.ts';
import IdleWarning from './IdleWarning.tsx';

function SessionNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <nav
        className="flex flex-wrap items-center gap-3 border-b border-border pb-3 mb-4"
        aria-label="Session"
      >
        <span className="text-muted">Not logged in</span>
        <NavLink to="/login" className="text-accent hover:underline">
          Log in
        </NavLink>
      </nav>
    );
  }

  return (
    <nav
      className="flex flex-wrap items-center gap-3 border-b border-border pb-3 mb-4"
      aria-label="Session"
    >
      <NavLink to="/account" className="text-accent hover:underline">
        Account
      </NavLink>
      {user.role === 'admin' && (
        <NavLink to="/admin" className="text-accent hover:underline">
          Admin
        </NavLink>
      )}
      <span className="ml-auto text-muted">
        Signed in as {user.name} ({user.role})
      </span>
      <Button
        type="button"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      >
        Log out
      </Button>
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
      <div className="max-w-160">
        <SessionNav />
        <SessionIdleWarning />
        <Outlet />
      </div>
    </AuthProvider>
  );
}

export default AuthLayout;
