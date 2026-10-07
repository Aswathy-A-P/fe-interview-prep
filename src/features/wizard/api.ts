import type { Registration } from './types.ts';

export type SubmitRegistration = (data: Registration) => Promise<void>;

export function submitRegistration(_data: Registration, delayMs = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}
