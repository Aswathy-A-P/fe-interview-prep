import type {
  Address,
  FieldErrors,
  PersonalInfo,
  Preferences,
  Registration,
  StepId,
} from './types.ts';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;
const INDIA_POSTAL_PATTERN = /^\d{6}$/;

export function validatePersonal(personal: PersonalInfo): FieldErrors<PersonalInfo> {
  const errors: FieldErrors<PersonalInfo> = {};
  if (!personal.name.trim()) errors.name = 'Name is required.';

  const email = personal.email.trim();
  if (!email) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email, like name@example.com.';

  const phone = personal.phone.replace(/[\s-]/g, '');
  if (!phone) errors.phone = 'Phone is required.';
  else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'Enter 7 to 15 digits, optionally starting with +.';
  }

  return errors;
}

export function validateAddress(address: Address): FieldErrors<Address> {
  const errors: FieldErrors<Address> = {};
  if (!address.country) errors.country = 'Choose a country.';
  if (!address.city.trim()) errors.city = 'City is required.';

  const postalCode = address.postalCode.trim();
  if (!postalCode) errors.postalCode = 'Postal code is required.';
  else if (address.country === 'India' && !INDIA_POSTAL_PATTERN.test(postalCode)) {
    errors.postalCode = 'Indian postal codes must be exactly 6 digits.';
  }

  return errors;
}

export function validatePreferences(preferences: Preferences): FieldErrors<Preferences> {
  const errors: FieldErrors<Preferences> = {};
  if (!preferences.plan) errors.plan = 'Choose a plan.';
  if (preferences.skills.length === 0) errors.skills = 'Add at least one skill.';
  return errors;
}

export function validateStep(step: StepId, data: Registration): Record<string, string> {
  if (step === 'personal') return validatePersonal(data.personal);
  if (step === 'address') return validateAddress(data.address);
  if (step === 'preferences') return validatePreferences(data.preferences);
  return {};
}

export function hasNoErrors(errors: object): boolean {
  return Object.keys(errors).length === 0;
}
