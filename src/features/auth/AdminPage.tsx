import { useEffect, useState } from 'react';
import Page from '../../components/ui/Page.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { errorMessage } from './apiClient.ts';
import { fetchAdminStats } from './authApi.ts';
import type { AdminStats } from './types.ts';

const tileClass = cn(cardClass, 'flex flex-col-reverse gap-1 p-5 text-center');
const valueClass = 'text-3xl font-bold tracking-tight text-ink tabular-nums';
const labelClass = 'text-sm text-muted';

function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAdminStats().then(
      (result) => {
        if (active) setStats(result);
      },
      (loadError: unknown) => {
        if (active) setError(errorMessage(loadError));
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <Page title="Admin stats" description="Store-wide numbers, visible to admins only." width="md">
      {error && <p className="text-center text-danger">{error}</p>}
      {!stats && !error && <p className="text-center text-muted">Loading stats…</p>}
      {stats && (
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className={tileClass}>
            <dt className={labelClass}>Users</dt>
            <dd className={valueClass}>{stats.totalUsers}</dd>
          </div>
          <div className={tileClass}>
            <dt className={labelClass}>Orders</dt>
            <dd className={valueClass}>{stats.totalOrders}</dd>
          </div>
          <div className={tileClass}>
            <dt className={labelClass}>Revenue</dt>
            <dd className={valueClass}>${stats.revenue}</dd>
          </div>
          <div className={cn(tileClass, 'sm:col-span-3')}>
            <dt className={labelClass}>Active sessions</dt>
            <dd className={valueClass}>{stats.activeSessions}</dd>
          </div>
        </dl>
      )}
    </Page>
  );
}

export default AdminPage;
