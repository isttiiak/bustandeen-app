import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Drizzle schema for the encrypted local database (doc 04 section 3). Tables are added through
// migrations only. Migration 0000_init: `meta`, `outbox`, `query_cache`; 0001_zikr: zikr counts. Content, Quran and cycle
// tables arrive with the features that need them.

/** Schema and content versions, owner uid. */
export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

/** Writes waiting to be sent. `id` is the UUID sent as `X-Client-Op-Id`. Never deleted by a migration. */
export const outbox = sqliteTable(
  'outbox',
  {
    id: text('id').primaryKey(),
    ownerUid: text('owner_uid').notNull(),
    /** 'salat' | 'zikr' | 'quran' | 'fasting' | ... */
    domain: text('domain').notNull(),
    method: text('method').notNull(),
    path: text('path').notNull(),
    /** JSON. */
    body: text('body').notNull(),
    /** The day the user acted on, captured when the write was queued. */
    trackingDay: text('tracking_day'),
    createdAt: integer('created_at').notNull(),
    attempts: integer('attempts').notNull().default(0),
    nextAttemptAt: integer('next_attempt_at'),
    /** 'pending' | 'sending' | 'failed' | 'dead' */
    state: text('state').notNull(),
    lastError: text('last_error'),
  },
  (t) => [index('outbox_owner_state_idx').on(t.ownerUid, t.state, t.createdAt)]
);

/** Server data kept for offline reads, one row per owner and key. */
export const queryCache = sqliteTable(
  'query_cache',
  {
    ownerUid: text('owner_uid').notNull(),
    key: text('key').notNull(),
    data: text('data').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.ownerUid, t.key] })]
);

// Migration 0001_zikr (task P2-zikr-counter). Local zikr counts. Owner is `guest` until sign-in exists.

/**
 * One row per owner, day and zikr. `count` is what was recorded that day (Home card, streak); `shown`
 * is the counter on screen, which Reset sets to 0 without touching `count`.
 */
export const zikrDay = sqliteTable(
  'zikr_day',
  {
    ownerUid: text('owner_uid').notNull(),
    /** YYYY-MM-DD, the day the taps were counted on. */
    day: text('day').notNull(),
    /** The web's zikr type name, e.g. 'SubhanAllah' (a key on the server, never translated). */
    zikrType: text('zikr_type').notNull(),
    count: integer('count').notNull().default(0),
    shown: integer('shown').notNull().default(0),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.ownerUid, t.day, t.zikrType] })]
);

/**
 * Counts not yet sent, in the shape of one entry of the web's `POST /api/zikr/increment/batch`
 * (`amount`, `untimedAmount`, `startTs` = first_ts, `realTs` = last_ts; `today` = day). Nothing sends
 * them yet: the outbox task turns these rows into batches. `amount` can be negative (undo).
 */
export const zikrUnsent = sqliteTable(
  'zikr_unsent',
  {
    ownerUid: text('owner_uid').notNull(),
    day: text('day').notNull(),
    zikrType: text('zikr_type').notNull(),
    amount: integer('amount').notNull().default(0),
    untimedAmount: integer('untimed_amount').notNull().default(0),
    firstTs: integer('first_ts'),
    lastTs: integer('last_ts'),
  },
  (t) => [primaryKey({ columns: [t.ownerUid, t.day, t.zikrType] })]
);
