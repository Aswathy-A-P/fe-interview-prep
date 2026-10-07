import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authContext.ts';
import type { Role } from './types.ts';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return (
      <section>
        <h1 className="mb-3 text-2xl font-semibold">Access denied</h1>
        <p className="text-danger">This page is only available to {role}s.</p>
      </section>
    );
  }
  return <Outlet />;
}
