import * as SQLite from 'expo-sqlite';

import { getStorageKeys } from '@/lib/storageKey';

// Development only (task P2-07, gate G7). Measures the local query engine (expo-sqlite with SQLCipher)
// with a Quran-sized dataset: 6,236 ayahs, 604 pages, one translation. The text is SYNTHETIC filler of
// a realistic length, not Quran text: this measures speed, nothing religious is stored. Runs in its own
// throwaway database file and deletes it afterwards.

const BENCH_DB = 'g7-bench.db';
const AYAHS = 6236;
const PAGES = 604;

export interface BenchResult {
  rows: number;
  open: number;
  insert: number;
  pageLoad: number;
  searchLike: number;
  searchFts: number;
  likeHits: number;
  ftsHits: number;
  sqlCipher: boolean;
}

const WORDS = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore ' +
  'et dolore magna aliqua enim minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea ' +
  'commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur ' +
  'excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

// Small deterministic generator so every run measures the same data.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function sentence(rand: () => number, length: number, needle?: string) {
  const out: string[] = [];
  let n = 0;
  while (n < length) {
    const w = WORDS[Math.floor(rand() * WORDS.length)];
    out.push(w);
    n += w.length + 1;
  }
  if (needle) out[Math.floor(out.length / 2)] = needle;
  return out.join(' ');
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

function time<T>(fn: () => T): { ms: number; value: T } {
  const t = Date.now();
  const value = fn();
  return { ms: Date.now() - t, value };
}

function removeBenchDb() {
  try {
    SQLite.deleteDatabaseSync(BENCH_DB);
  } catch {
    // not there yet
  }
}

export function runBenchmark(): BenchResult {
  removeBenchDb();
  const { dbKey } = getStorageKeys();

  const opened = time(() => {
    const db = SQLite.openDatabaseSync(BENCH_DB);
    db.execSync(`PRAGMA key = "x'${dbKey}'";`);
    db.getFirstSync('SELECT count(*) FROM sqlite_master;');
    return db;
  });
  const db = opened.value;
  const cipher = !!db.getFirstSync<{ cipher_version: string }>('PRAGMA cipher_version;')
    ?.cipher_version;

  db.execSync(`
    CREATE TABLE quran_ayah (surah INTEGER, ayah INTEGER, text TEXT, page INTEGER, PRIMARY KEY (surah, ayah));
    CREATE INDEX quran_ayah_page ON quran_ayah (page);
    CREATE TABLE edition_text (edition INTEGER, surah INTEGER, ayah INTEGER, text TEXT, PRIMARY KEY (edition, surah, ayah));
    CREATE VIRTUAL TABLE edition_fts USING fts5(text, content='edition_text', content_rowid='rowid');
  `);

  const rand = rng(42);
  const insert = time(() => {
    db.withTransactionSync(() => {
      const a = db.prepareSync('INSERT INTO quran_ayah VALUES (?, ?, ?, ?)');
      const t = db.prepareSync('INSERT INTO edition_text VALUES (1, ?, ?, ?)');
      let surah = 1;
      let ayah = 1;
      for (let i = 0; i < AYAHS; i++) {
        // About 190 bytes for the "Arabic" column and 150 characters for the translation.
        const needle = i % 31 === 0 ? 'mercy' : undefined;
        a.executeSync([surah, ayah, sentence(rand, 190), Math.floor((i / AYAHS) * PAGES) + 1]);
        t.executeSync([surah, ayah, sentence(rand, 150, needle)]);
        ayah++;
        if (ayah > 60) {
          ayah = 1;
          surah++;
        }
      }
      a.finalizeSync();
      t.finalizeSync();
    });
    db.execSync("INSERT INTO edition_fts(edition_fts) VALUES ('rebuild');");
  });

  const pages = Array.from({ length: 20 }, (_, i) => 5 + i * 29);
  const pageLoads = pages.map((p) =>
    time(() =>
      db.getAllSync(
        'SELECT a.surah, a.ayah, a.text, e.text AS translation FROM quran_ayah a JOIN edition_text e ' +
          'ON e.surah = a.surah AND e.ayah = a.ayah AND e.edition = 1 WHERE a.page = ? ORDER BY a.surah, a.ayah',
        [p]
      )
    )
  );
  const likeRuns = Array.from({ length: 5 }, () =>
    time(() =>
      db.getAllSync("SELECT surah, ayah FROM edition_text WHERE text LIKE '%mercy%' LIMIT 100")
    )
  );
  const ftsRuns = Array.from({ length: 5 }, () =>
    time(() =>
      db.getAllSync("SELECT rowid FROM edition_fts WHERE edition_fts MATCH 'mercy' LIMIT 100")
    )
  );
  const result: BenchResult = {
    rows: AYAHS,
    open: opened.ms,
    insert: insert.ms,
    pageLoad: median(pageLoads.map((r) => r.ms)),
    searchLike: median(likeRuns.map((r) => r.ms)),
    searchFts: median(ftsRuns.map((r) => r.ms)),
    likeHits: likeRuns[0].value.length,
    ftsHits: ftsRuns[0].value.length,
    sqlCipher: cipher,
  };
  db.closeSync();
  removeBenchDb();
  return result;
}
