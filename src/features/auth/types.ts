export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse extends RefreshResponse {
  refreshToken: string;
  user: User;
}

export interface Order {
  id: string;
  item: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  revenue: number;
  activeSessions: number;
}
