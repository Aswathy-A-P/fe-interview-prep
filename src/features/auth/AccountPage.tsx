import { useEffect, useState } from 'react';
import { errorMessage } from './apiClient.ts';
import { fetchCurrentUser, fetchOrders } from './authApi.ts';
import { useAuth } from './authContext.ts';
import TokenCountdown from './TokenCountdown.tsx';
import { forgetAccessToken } from './tokenStore.ts';
import type { Order } from './types.ts';

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
      <h1>Account</h1>
      <dl className="auth-details">
        <dt>Name</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Role</dt>
        <dd>{user.role}</dd>
      </dl>

      <h2>Session demo</h2>
      <TokenCountdown />
      <div className="auth-actions">
        <button type="button" className="primary" onClick={fireThreeRequests}>
          Fire 3 requests
        </button>
        <button type="button" onClick={forgetAccessToken}>
          Expire access token now
        </button>
      </div>
      {burstResult && <p role="status">{burstResult}</p>}

      <h2>Orders</h2>
      {ordersError && <p className="error">{ordersError}</p>}
      {!orders && !ordersError && <p className="muted">Loading orders…</p>}
      {orders && orders.length === 0 && <p className="muted">No orders yet.</p>}
      {orders && orders.length > 0 && (
        <table className="auth-table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Item</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.item}</td>
                <td>${order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default AccountPage;
