import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { migrate } from 'drizzle-orm/sqlite-proxy/migrator';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

import { journal, migrations } from '@/db/migrations';

// Runs Drizzle's own migrator against an in-memory SQLite (Node's built-in), which proves the SQL and
// the "forward-only, idempotent" rule. Encryption itself needs the native SQLCipher build: it is
// checked on a device by `checkEncryption()` (see docs/00-DECISIONS.md, G7).
const FOLDER = join(__dirname, '../db/migrations');

function open() {
  const sqlite = new DatabaseSync(':memory:');
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
  return { sqlite, db, run };
}

const tables = (sqlite: DatabaseSync) =>
  (
    sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '\\_\\_%' ESCAPE '\\'"
      )
      .all() as { name: string }[]
  )
    .map((r) => r.name)
    .sort();

const ALL_TABLES = ['meta', 'outbox', 'query_cache', 'zikr_day', 'zikr_unsent'];

describe('migrations (0000_init, 0001_zikr)', () => {
  it('bundles exactly the SQL files drizzle-kit wrote', () => {
    for (const e of journal.entries) {
      const key = `m${String(e.idx).padStart(4, '0')}` as keyof typeof migrations;
      expect(migrations[key]).toBe(readFileSync(join(FOLDER, `${e.tag}.sql`), 'utf8'));
    }
  });

  it('builds the schema from an empty database', async () => {
    const { sqlite, db, run } = open();
    await migrate(db, run, { migrationsFolder: FOLDER });
    expect(tables(sqlite)).toEqual(ALL_TABLES);
    const cols = (sqlite.prepare('PRAGMA table_info(outbox)').all() as { name: string }[]).map(
      (c) => c.name
    );
    expect(cols).toEqual(
      expect.arrayContaining(['id', 'owner_uid', 'domain', 'body', 'tracking_day', 'state'])
    );
  });

  it('is idempotent and keeps outbox rows when run again on a migrated database', async () => {
    const { sqlite, db, run } = open();
    await migrate(db, run, { migrationsFolder: FOLDER });
    sqlite
      .prepare(
        "INSERT INTO outbox (id, owner_uid, domain, method, path, body, created_at, state) VALUES ('op-1','u1','salat','POST','/x','{}',1,'pending')"
      )
      .run();
    await migrate(db, run, { migrationsFolder: FOLDER });
    await migrate(db, run, { migrationsFolder: FOLDER });
    expect(tables(sqlite)).toEqual(ALL_TABLES);
    const row = sqlite.prepare('SELECT id, attempts, state FROM outbox').all();
    expect(row).toEqual([expect.objectContaining({ id: 'op-1', attempts: 0, state: 'pending' })]);
    const applied = sqlite.prepare('SELECT count(*) AS n FROM __drizzle_migrations').get() as {
      n: number;
    };
    expect(applied.n).toBe(journal.entries.length);
  });

  it('upgrades a 0000_init database to 0001_zikr without touching outbox rows', async () => {
    // A folder holding only the first migration plays the database of the previous app version.
    const old = mkdtempSync(join(tmpdir(), 'mig-'));
    try {
      mkdirSync(join(old, 'meta'));
      const first = journal.entries[0]!;
      copyFileSync(join(FOLDER, `${first.tag}.sql`), join(old, `${first.tag}.sql`));
      writeFileSync(
        join(old, 'meta/_journal.json'),
        JSON.stringify({ ...journal, entries: [first] })
      );
      const { sqlite, db, run } = open();
      await migrate(db, run, { migrationsFolder: old });
      expect(tables(sqlite)).toEqual(['meta', 'outbox', 'query_cache']);
      sqlite
        .prepare(
          "INSERT INTO outbox (id, owner_uid, domain, method, path, body, created_at, state) VALUES ('op-9','u1','zikr','POST','/api/zikr/increment/batch','{}',1,'pending')"
        )
        .run();

      await migrate(db, run, { migrationsFolder: FOLDER });
      expect(tables(sqlite)).toEqual(ALL_TABLES);
      expect(sqlite.prepare('SELECT id, state FROM outbox').all()).toEqual([
        expect.objectContaining({ id: 'op-9', state: 'pending' }),
      ]);
    } finally {
      rmSync(old, { recursive: true, force: true });
    }
  });
});
