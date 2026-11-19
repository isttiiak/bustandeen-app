import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Drizzle schema for the encrypted local database (doc 04 section 3). Tables are added through
// migrations only. This is migration 0001: `meta`, `outbox`, `query_cache`. Content, Quran and cycle
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
