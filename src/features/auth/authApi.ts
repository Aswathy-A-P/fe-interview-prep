import { apiGet, parseResponse, postJson, refreshAccessToken } from './apiClient.ts';
import type { AdminStats, Credentials, LoginResponse, Order, User } from './types.ts';

export async function requestLogin(credentials: Credentials): Promise<LoginResponse> {
  return parseResponse<LoginResponse>(await postJson('/api/auth/login', credentials));
}

export const fetchCurrentUser = () => apiGet<User>('/api/me');

export const fetchOrders = () => apiGet<Order[]>('/api/orders');

export const fetchAdminStats = () => apiGet<AdminStats>('/api/admin/stats');

export async function restoreSession(): Promise<User> {
  await refreshAccessToken();
  return fetchCurrentUser();
}
