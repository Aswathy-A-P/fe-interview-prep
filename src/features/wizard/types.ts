export const STEPS = ['personal', 'address', 'preferences', 'review'] as const;
export type StepId = (typeof STEPS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  personal: 'Personal info',
  address: 'Address',
  preferences: 'Preferences',
  review: 'Review',
};

export const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Germany', 'Canada'] as const;

export const PLANS = ['free', 'pro', 'team'] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
};

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  country: string;
  city: string;
  postalCode: string;
}

export interface Preferences {
  plan: Plan | '';
  skills: string[];
}

export interface Registration {
  personal: PersonalInfo;
  address: Address;
  preferences: Preferences;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
