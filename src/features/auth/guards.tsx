import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Page from '../../components/ui/Page.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
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
      <Page title="Access denied" width="sm">
        <div className={cn(cardClass, 'border-danger/30 bg-danger/5 p-6 text-center')}>
          <p className="text-danger">This page is only available to {role}s.</p>
        </div>
      </Page>
    );
  }
  return <Outlet />;
}
