import type { Order, User } from '../types.ts';

export interface MockUser extends User {
  password: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    name: 'Ada Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'u2',
    name: 'Uma User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
  },
];

export const MOCK_ORDERS: Record<string, Order[]> = {
  u1: [{ id: 'A-1001', item: 'Standing desk', total: 499, status: 'delivered' }],
  u2: [
    { id: 'U-2001', item: 'Mechanical keyboard', total: 129, status: 'shipped' },
    { id: 'U-2002', item: 'USB-C hub', total: 45, status: 'processing' },
    { id: 'U-2003', item: 'Monitor arm', total: 89, status: 'delivered' },
  ],
};
