import { emptyRegistration } from './registration.ts';
import type { Address } from './types.ts';
import {
  hasNoErrors,
  validateAddress,
  validatePersonal,
  validatePreferences,
  validateStep,
} from './validation.ts';

const address = (country: string, postalCode: string): Address => ({
  country,
  city: 'Kochi',
  postalCode,
});

describe('validatePersonal', () => {
  it('requires every field', () => {
    expect(validatePersonal(emptyRegistration.personal)).toEqual({
      name: 'Name is required.',
      email: 'Email is required.',
      phone: 'Phone is required.',
    });
  });

  it('rejects a malformed email and phone', () => {
    const errors = validatePersonal({ name: 'Asha', email: 'asha@', phone: '12ab' });
    expect(errors.email).toMatch(/valid email/);
    expect(errors.phone).toMatch(/7 to 15 digits/);
  });

  it('accepts a valid person, allowing spaces and dashes in the phone', () => {
    const errors = validatePersonal({
      name: 'Asha',
      email: 'asha@example.com',
      phone: '+91 98765-43210',
    });
    expect(hasNoErrors(errors)).toBe(true);
  });
});

describe('validateAddress', () => {
  it('requires country, city and postal code', () => {
    expect(Object.keys(validateAddress(emptyRegistration.address))).toEqual([
      'country',
      'city',
      'postalCode',
    ]);
  });

  it('requires exactly 6 digits for India', () => {
    expect(validateAddress(address('India', '68201')).postalCode).toMatch(/exactly 6 digits/);
    expect(validateAddress(address('India', '6820111')).postalCode).toMatch(/exactly 6 digits/);
    expect(validateAddress(address('India', '68A011')).postalCode).toMatch(/exactly 6 digits/);
    expect(hasNoErrors(validateAddress(address('India', '682011')))).toBe(true);
  });

  it('accepts any postal code for other countries', () => {
    expect(hasNoErrors(validateAddress(address('United Kingdom', 'SW1A 1AA')))).toBe(true);
    expect(hasNoErrors(validateAddress(address('Germany', '123')))).toBe(true);
  });
});

describe('validatePreferences', () => {
  it('requires a plan and at least one skill', () => {
    expect(validatePreferences({ plan: '', skills: [] })).toEqual({
      plan: 'Choose a plan.',
      skills: 'Add at least one skill.',
    });
    expect(hasNoErrors(validatePreferences({ plan: 'pro', skills: ['React'] }))).toBe(true);
  });
});

describe('validateStep', () => {
  it('never blocks the review step', () => {
    expect(validateStep('review', emptyRegistration)).toEqual({});
  });
});
