import { useEffect, useState } from 'react';
import { errorMessage } from './apiClient.ts';
import { fetchAdminStats } from './authApi.ts';
import type { AdminStats } from './types.ts';

const detailsClass = 'grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 [&_dt]:text-muted';

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
    <section>
      <h1 className="mb-3 text-2xl font-semibold">Admin stats</h1>
      {error && <p className="text-danger">{error}</p>}
      {!stats && !error && <p className="text-muted">Loading stats…</p>}
      {stats && (
        <dl className={detailsClass}>
          <dt>Users</dt>
          <dd>{stats.totalUsers}</dd>
          <dt>Orders</dt>
          <dd>{stats.totalOrders}</dd>
          <dt>Revenue</dt>
          <dd>${stats.revenue}</dd>
          <dt>Active sessions</dt>
          <dd>{stats.activeSessions}</dd>
        </dl>
      )}
    </section>
  );
}

export default AdminPage;
