export const DEFAULT_REDIRECT = '/account';

export function redirectPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) return DEFAULT_REDIRECT;
  const { from } = state;
  if (typeof from !== 'object' || from === null) return DEFAULT_REDIRECT;
  if (!('pathname' in from) || typeof from.pathname !== 'string') return DEFAULT_REDIRECT;
  if (from.pathname === '/login') return DEFAULT_REDIRECT;
  const search = 'search' in from && typeof from.search === 'string' ? from.search : '';
  return `${from.pathname}${search}`;
}
