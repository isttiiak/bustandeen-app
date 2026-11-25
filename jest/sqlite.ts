import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import type { SqlRunner } from '@/features/zikr/data/repo';

// Test helpers: Node's built-in SQLite with the app's real migrations applied, and the same small
// runner interface the app uses over expo-sqlite. Encryption needs the native build (checked on a
// device, G7); everything else about the SQL is tested here.
export const MIGRATIONS = join(__dirname, '../src/db/migrations');

export function proxy(sqlite: DatabaseSync) {
  const db = drizzle(async (sql, params, method) => {
    const stmt = sqlite.prepare(sql);
    if (method === 'run') {
      stmt.run(...(params as never[]));
      return { rows: [] };
    }
    stmt.setReturnArrays(true);
    const rows = stmt.all(...(params as never[])) as unknown as unknown[][];
    return { rows: method === 'get' ? (rows[0] ?? []) : rows };
  });
  const run = async (queries: string[]) => {
    sqlite.exec('BEGIN');
    try {
      for (const q of queries) sqlite.exec(q);
      sqlite.exec('COMMIT');
    } catch (e) {
      sqlite.exec('ROLLBACK');
      throw e;
    }
  };
  return { db, run };
}

/** Opens (or creates) a SQLite file or `:memory:` and applies every migration. */
export async function openMigrated(path = ':memory:'): Promise<DatabaseSync> {
  const sqlite = new DatabaseSync(path);
  const { db, run } = proxy(sqlite);
  await migrate(db, run, { migrationsFolder: MIGRATIONS });
  return sqlite;
}

export function runner(sqlite: DatabaseSync): SqlRunner {
  return {
    run: (sql, params = []) => {
      sqlite.prepare(sql).run(...(params as never[]));
    },
    all: <T>(sql: string, params: readonly (string | number | null)[] = []) =>
      sqlite.prepare(sql).all(...(params as never[])) as T[],
    transaction: (fn) => {
      sqlite.exec('BEGIN');
      try {
        fn();
        sqlite.exec('COMMIT');
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
