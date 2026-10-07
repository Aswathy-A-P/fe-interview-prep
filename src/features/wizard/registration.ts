import { PLANS, STEPS, type Registration, type StepId } from './types.ts';

export const emptyRegistration: Registration = {
  personal: { name: '', email: '', phone: '' },
  address: { country: '', city: '', postalCode: '' },
  preferences: { plan: '', skills: [] },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasStrings(value: unknown, keys: string[]): boolean {
  return isRecord(value) && keys.every((key) => typeof value[key] === 'string');
}

export function isStepId(value: unknown): value is StepId {
  return typeof value === 'string' && (STEPS as readonly string[]).includes(value);
}

export function isRegistration(value: unknown): value is Registration {
  if (!isRecord(value)) return false;
  const { personal, address, preferences } = value;
  return (
    hasStrings(personal, ['name', 'email', 'phone']) &&
    hasStrings(address, ['country', 'city', 'postalCode']) &&
    isRecord(preferences) &&
    (preferences.plan === '' || (PLANS as readonly unknown[]).includes(preferences.plan)) &&
    Array.isArray(preferences.skills) &&
    preferences.skills.every((skill: unknown) => typeof skill === 'string')
  );
}

export function addSkill(skills: string[], skill: string): string[] {
  const trimmed = skill.trim();
  if (!trimmed) return skills;
  const exists = skills.some((existing) => existing.toLowerCase() === trimmed.toLowerCase());
  return exists ? skills : [...skills, trimmed];
}

export function removeSkill(skills: string[], skill: string): string[] {
  return skills.filter((existing) => existing !== skill);
}

export function nextStep(step: StepId): StepId {
  return STEPS[STEPS.indexOf(step) + 1] ?? step;
}

export function previousStep(step: StepId): StepId {
  return STEPS[STEPS.indexOf(step) - 1] ?? step;
}
