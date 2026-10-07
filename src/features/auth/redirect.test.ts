import { DEFAULT_REDIRECT, redirectPath } from './redirect.ts';

describe('redirectPath', () => {
  it('returns the page the user originally asked for', () => {
    expect(redirectPath({ from: { pathname: '/admin', search: '?tab=1' } })).toBe('/admin?tab=1');
  });

  it('falls back to the account page for missing or malformed state', () => {
    expect(redirectPath(null)).toBe(DEFAULT_REDIRECT);
    expect(redirectPath({})).toBe(DEFAULT_REDIRECT);
    expect(redirectPath({ from: 'admin' })).toBe(DEFAULT_REDIRECT);
    expect(redirectPath({ from: { pathname: 42 } })).toBe(DEFAULT_REDIRECT);
  });

  it('never redirects back to the login page', () => {
    expect(redirectPath({ from: { pathname: '/login' } })).toBe(DEFAULT_REDIRECT);
  });
});
