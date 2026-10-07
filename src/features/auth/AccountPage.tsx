import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button.tsx';
import Page from '../../components/ui/Page.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { errorMessage } from './apiClient.ts';
import { fetchCurrentUser, fetchOrders } from './authApi.ts';
import { useAuth } from './authContext.ts';
import TokenCountdown from './TokenCountdown.tsx';
import { forgetAccessToken } from './tokenStore.ts';
import type { Order } from './types.ts';

const headingClass = 'text-lg font-semibold text-ink';
const headCellClass = 'px-4 py-3 text-left font-semibold';
const cellClass = 'px-4 py-3 text-left';

function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [burstResult, setBurstResult] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchOrders().then(
      (result) => {
        if (active) setOrders(result);
      },
      (error: unknown) => {
        if (active) setOrdersError(errorMessage(error));
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const fireThreeRequests = async () => {
    setBurstResult('Sending 3 requests…');
    try {
      await Promise.all([fetchCurrentUser(), fetchOrders(), fetchCurrentUser()]);
      setBurstResult(`All 3 requests succeeded at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setBurstResult(errorMessage(error));
    }
  };

  if (!user) return null;

  return (
    <Page
      title="Account"
      description="Your profile, a live token demo and your recent orders."
      width="md"
    >
      <div className={cn(cardClass, 'p-6')}>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted">Name</dt>
          <dd className="font-medium text-ink">{user.name}</dd>
          <dt className="text-muted">Email</dt>
          <dd className="font-medium text-ink">{user.email}</dd>
          <dt className="text-muted">Role</dt>
          <dd className="font-medium text-ink">{user.role}</dd>
        </dl>
      </div>

      <div className={cn(cardClass, 'space-y-3 p-6')}>
        <h2 className={headingClass}>Session demo</h2>
        <TokenCountdown />
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={fireThreeRequests}>
            Fire 3 requests
          </Button>
          <Button type="button" onClick={forgetAccessToken}>
            Expire access token now
          </Button>
        </div>
        {burstResult && (
          <p className="text-sm text-ink" role="status">
            {burstResult}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className={headingClass}>Orders</h2>
        {ordersError && <p className="text-danger">{ordersError}</p>}
        {!orders && !ordersError && <p className="text-muted">Loading orders…</p>}
        {orders && orders.length === 0 && <p className="text-muted">No orders yet.</p>}
        {orders && orders.length > 0 && (
          <div className={cn(cardClass, 'overflow-x-auto')}>
            <table className="w-full border-collapse text-sm">
              <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th scope="col" className={headCellClass}>
                    Order
                  </th>
                  <th scope="col" className={headCellClass}>
                    Item
                  </th>
                  <th scope="col" className={headCellClass}>
                    Total
                  </th>
                  <th scope="col" className={headCellClass}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className={cellClass}>{order.id}</td>
                    <td className={cellClass}>{order.item}</td>
                    <td className={cn(cellClass, 'tabular-nums')}>${order.total}</td>
                    <td className={cellClass}>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  );
}

export default AccountPage;
