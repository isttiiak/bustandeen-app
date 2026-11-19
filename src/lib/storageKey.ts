import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// The one secret the app generates: a 256-bit random key kept in the OS keystore (Android Keystore,
// iOS Keychain). It opens the SQLCipher database and the encrypted MMKV store, and nothing else is
// kept in SecureStore (doc 04 section 2). It is made on first launch and never leaves the device.

const KEY_NAME = 'bustandeen_storage_key_v1';

export interface KeyDeps {
  read: (name: string) => string | null;
  write: (name: string, value: string) => void;
  /** `n` cryptographically secure random bytes. */
  random: (n: number) => Uint8Array;
}

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

export interface StorageKeys {
  /** 64 hex characters: the raw 256-bit key for SQLCipher. */
  dbKey: string;
  /** 32 hex characters: a 128-bit key used as the AES-256 key text for MMKV (it accepts at most 32 bytes). */
  kvKey: string;
  /** True on the first launch, when the key was just made. */
  created: boolean;
}

/** Reads the key, or makes and stores one. Synchronous, so storage is ready before the first frame. */
export function loadKeys(deps: KeyDeps): StorageKeys {
  const existing = deps.read(KEY_NAME);
  if (existing && /^[0-9a-f]{64}$/.test(existing)) {
    return { dbKey: existing, kvKey: existing.slice(0, 32), created: false };
  }
  const fresh = toHex(deps.random(32));
  deps.write(KEY_NAME, fresh);
  return { dbKey: fresh, kvKey: fresh.slice(0, 32), created: true };
}

let cached: StorageKeys | null = null;

/** The keys for this app run, from the device keystore. */
export function getStorageKeys(): StorageKeys {
  cached ??= loadKeys({
    read: (name) => SecureStore.getItem(name),
    write: (name, value) =>
      // "After first unlock" so the key is readable when the app starts in the background after a
      // reboot; it is never backed up or moved to another device.
      SecureStore.setItem(name, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      }),
    random: (n) => Crypto.getRandomBytes(n),
  });
  return cached;
}
