import { loadKeys, type KeyDeps } from '@/lib/storageKey';

function fakeDeps(initial: Record<string, string> = {}) {
  const store = { ...initial };
  let counter = 0;
  const deps: KeyDeps = {
    read: (name) => store[name] ?? null,
    write: (name, value) => {
      store[name] = value;
    },
    // Deterministic "random" bytes for the test: a different run of bytes each call.
    random: (n) => Uint8Array.from({ length: n }, (_, i) => (i * 7 + ++counter) % 256),
  };
  return { deps, store };
}

describe('storage key', () => {
  it('makes a 256-bit key on first launch and stores it', () => {
    const { deps, store } = fakeDeps();
    const keys = loadKeys(deps);
    expect(keys.created).toBe(true);
    expect(keys.dbKey).toMatch(/^[0-9a-f]{64}$/);
    expect(keys.kvKey).toHaveLength(32); // MMKV takes at most 32 bytes
    expect(keys.dbKey.startsWith(keys.kvKey)).toBe(true);
    expect(Object.values(store)).toEqual([keys.dbKey]);
  });

  it('reuses the stored key on the next launch', () => {
    const { deps } = fakeDeps();
    const first = loadKeys(deps);
    const second = loadKeys(deps);
    expect(second.created).toBe(false);
    expect(second.dbKey).toBe(first.dbKey);
  });

  it('replaces a damaged stored value instead of using it', () => {
    const { deps, store } = fakeDeps({ bustandeen_storage_key_v1: 'not-a-key' });
    const keys = loadKeys(deps);
    expect(keys.created).toBe(true);
    expect(keys.dbKey).toMatch(/^[0-9a-f]{64}$/);
    expect(store.bustandeen_storage_key_v1).toBe(keys.dbKey);
  });
});
