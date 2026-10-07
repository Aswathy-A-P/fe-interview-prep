import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { readStorage, writeStorage } from '../lib/storage.ts';

interface PersistentStateOptions<T> {
  isValid: (value: unknown) => value is T;
  storage?: Storage;
}

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  { isValid, storage = localStorage }: PersistentStateOptions<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue, isValid, storage));

  useEffect(() => {
    writeStorage(key, value, storage);
  }, [key, value, storage]);

  return [value, setValue];
}
