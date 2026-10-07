import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import AuthProvider from './AuthProvider.tsx';
import { useAuth } from './authContext.ts';
import './auth.css';

function SessionNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <nav className="auth-nav" aria-label="Session">
        <span className="muted">Not logged in</span>
        <NavLink to="/login">Log in</NavLink>
      </nav>
    );
  }

  return (
    <nav className="auth-nav" aria-label="Session">
      <NavLink to="/account">Account</NavLink>
      {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      <span className="auth-nav-user muted">
        Signed in as {user.name} ({user.role})
      </span>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      >
        Log out
      </button>
    </nav>
  );
}

function AuthLayout() {
  return (
    <AuthProvider>
      <div className="auth">
        <SessionNav />
        <Outlet />
      </div>
    </AuthProvider>
  );
}

export default AuthLayout;
