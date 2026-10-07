import { readStorage, writeStorage } from '../../../lib/storage.ts';

export interface TokenRecord {
  userId: string;
  expiresAt: number;
}

type Entry = [string, TokenRecord];

function isTokenRecord(value: unknown): value is TokenRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    typeof value.userId === 'string' &&
    'expiresAt' in value &&
    typeof value.expiresAt === 'number'
  );
}

function isEntryList(value: unknown): value is Entry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry: unknown) =>
        Array.isArray(entry) && typeof entry[0] === 'string' && isTokenRecord(entry[1]),
    )
  );
}

export function createTokenTable(persistence?: { key: string; storage: Storage }) {
  const initial = persistence
    ? readStorage<Entry[]>(persistence.key, [], isEntryList, persistence.storage)
    : [];
  const records = new Map<string, TokenRecord>(initial);

  return {
    get: (token: string) => records.get(token),
    set: (token: string, record: TokenRecord) => {
      records.set(token, record);
      if (persistence) writeStorage(persistence.key, [...records], persistence.storage);
    },
    records: () => [...records.values()],
  };
}

export type TokenTable = ReturnType<typeof createTokenTable>;
