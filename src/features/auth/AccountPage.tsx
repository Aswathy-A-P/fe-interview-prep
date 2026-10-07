import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button.tsx';
import { cardClass } from '../../components/ui/fieldStyles.ts';
import { cn } from '../../lib/cn.ts';
import { errorMessage } from './apiClient.ts';
import { fetchCurrentUser, fetchOrders } from './authApi.ts';
import { useAuth } from './authContext.ts';
import TokenCountdown from './TokenCountdown.tsx';
import { forgetAccessToken } from './tokenStore.ts';
import type { Order } from './types.ts';

const detailsClass = 'grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 [&_dt]:text-muted';
const headingClass = 'mt-6 mb-2 text-xl font-semibold';
const cellClass = 'border-b border-border px-2.5 py-1.5 text-left';

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
    <section>
      <h1 className="mb-3 text-2xl font-semibold">Account</h1>
      <dl className={detailsClass}>
        <dt>Name</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Role</dt>
        <dd>{user.role}</dd>
      </dl>

      <h2 className={headingClass}>Session demo</h2>
      <TokenCountdown />
      <div className="flex gap-2">
        <Button type="button" variant="primary" onClick={fireThreeRequests}>
          Fire 3 requests
        </Button>
        <Button type="button" onClick={forgetAccessToken}>
          Expire access token now
        </Button>
      </div>
      {burstResult && (
        <p className="mt-2" role="status">
          {burstResult}
        </p>
      )}

      <h2 className={headingClass}>Orders</h2>
      {ordersError && <p className="text-danger">{ordersError}</p>}
      {!orders && !ordersError && <p className="text-muted">Loading orders…</p>}
      {orders && orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      {orders && orders.length > 0 && (
        <table className={cn(cardClass, 'w-full border-collapse rounded-none')}>
          <thead>
            <tr>
              <th scope="col" className={cellClass}>
                Order
              </th>
              <th scope="col" className={cellClass}>
                Item
              </th>
              <th scope="col" className={cellClass}>
                Total
              </th>
              <th scope="col" className={cellClass}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={cellClass}>{order.id}</td>
                <td className={cellClass}>{order.item}</td>
                <td className={cellClass}>${order.total}</td>
                <td className={cellClass}>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default AccountPage;
