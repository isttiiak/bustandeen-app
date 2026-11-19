import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as SQLite from 'expo-sqlite';

import { getStorageKeys } from '@/lib/storageKey';

import { journal, migrations } from './migrations';
import * as schema from './schema';

// The encrypted local database (doc 04). SQLCipher with a raw 256-bit key from the keystore. The
// file is `bustandeen.db` in the app's private SQLite directory.

export const DB_NAME = 'bustandeen.db';

export type Db = ExpoSQLiteDatabase<typeof schema>;

const keyPragma = (hexKey: string) => `PRAGMA key = "x'${hexKey}'";`;

/** True when this build has SQLCipher compiled in. Without it `PRAGMA key` is silently ignored. */
export function hasSqlCipher(db: SQLite.SQLiteDatabase): boolean {
  const row = db.getFirstSync<{ cipher_version: string }>('PRAGMA cipher_version;');
  return !!row?.cipher_version;
}

/** Reads one row to prove the connection can really decrypt the file. Throws if it cannot. */
function canRead(db: SQLite.SQLiteDatabase): boolean {
  try {
    db.getFirstSync('SELECT count(*) AS n FROM sqlite_master;');
    return true;
  } catch {
    return false;
  }
}

export interface EncryptionReport {
  sqlCipher: boolean;
  /** The file cannot be read with no key. */
  closedWithoutKey: boolean;
  /** The file cannot be read with a different key. */
  closedWithWrongKey: boolean;
}

/**
 * Startup self-check (doc 05): the database file really is encrypted. Opens the file twice more, once
 * with no key and once with a wrong one, and expects both to fail. Run it after the DB exists.
 */
export function checkEncryption(name: string = DB_NAME): EncryptionReport {
  // `useNewConnection`: expo-sqlite caches connections by file name, and the cached one already has the key.
  const plain = SQLite.openDatabaseSync(name, { useNewConnection: true });
  const sqlCipher = hasSqlCipher(plain);
  const closedWithoutKey = !canRead(plain);
  plain.closeSync();

  const wrong = SQLite.openDatabaseSync(name, { useNewConnection: true });
  wrong.execSync(keyPragma('0'.repeat(64)));
  const closedWithWrongKey = !canRead(wrong);
  wrong.closeSync();
  return { sqlCipher, closedWithoutKey, closedWithWrongKey };
}

let opened: Db | null = null;
let raw: SQLite.SQLiteDatabase | null = null;

/** The open database, or null before `initDatabase` has finished. */
export function getDatabase(): Db {
  if (!opened) throw new Error('Database used before initDatabase() finished.');
  return opened;
}

export function getRawDatabase(): SQLite.SQLiteDatabase {
  if (!raw) throw new Error('Database used before initDatabase() finished.');
  return raw;
}

export interface InitResult {
  /** The file could not be opened with the stored key (a new device, a lost key), so it was reset. */
  reset: boolean;
}

/**
 * Opens (or creates) the encrypted database and applies migrations. If the stored key cannot open an
 * existing file, the file is deleted and started again: the server is the backup (doc 04 section 2).
 */
export async function initDatabase(): Promise<InitResult> {
  if (opened) return { reset: false };
  const { dbKey } = getStorageKeys();
  let reset = false;

  let db = SQLite.openDatabaseSync(DB_NAME);
  db.execSync(keyPragma(dbKey));
  if (!hasSqlCipher(db)) {
    db.closeSync();
    throw new Error('This build has no SQLCipher: refusing to store data unencrypted.');
  }
  if (!canRead(db)) {
    db.closeSync();
    SQLite.deleteDatabaseSync(DB_NAME);
    db = SQLite.openDatabaseSync(DB_NAME);
    db.execSync(keyPragma(dbKey));
    reset = true;
  }
  db.execSync('PRAGMA journal_mode = WAL;');
  db.execSync('PRAGMA foreign_keys = ON;');

  const d = drizzle(db, { schema });
  await migrate(d, { journal, migrations });
  raw = db;
  opened = d;
  return { reset };
}
