import { getRawDatabase, initDatabase } from '@/db/client';

import type { SqlRunner } from './repo';

/** Opens the encrypted database (once) and returns a runner over its synchronous API. */
export async function openZikrDatabase(): Promise<SqlRunner> {
  await initDatabase();
  const db = getRawDatabase();
  return {
    run: (sql, params = []) => {
      db.runSync(sql, params as (string | number | null)[]);
    },
    all: <T>(sql: string, params: readonly (string | number | null)[] = []) =>
      db.getAllSync<T>(sql, params as (string | number | null)[]),
    transaction: (fn) => db.withTransactionSync(fn),
  };
}
