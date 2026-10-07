export function readStorage<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
  storage: Storage = localStorage,
): T {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T, storage: Storage = localStorage): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function removeStorage(key: string, storage: Storage = localStorage): void {
  try {
    storage.removeItem(key);
  } catch {
    return;
  }
}
