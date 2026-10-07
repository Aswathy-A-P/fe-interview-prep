export const IDLE_MS = 5 * 60_000;
export const WARNING_MS = 60_000;

export interface IdleSettings {
  idleMs: number;
  warningMs: number;
}

export function idleSettings(search: string, allowOverride: boolean): IdleSettings {
  const seconds = Number(new URLSearchParams(search).get('idle'));
  if (!allowOverride || !Number.isFinite(seconds) || seconds <= 0) {
    return { idleMs: IDLE_MS, warningMs: WARNING_MS };
  }
  return { idleMs: seconds * 1000, warningMs: Math.min(WARNING_MS, seconds * 1000) };
}
