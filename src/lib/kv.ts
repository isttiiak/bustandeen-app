import { createMMKV, type MMKV } from 'react-native-mmkv';

import { getStorageKeys } from './storageKey';

// Fast, synchronous, encrypted key-value storage for preferences and small UI state (doc 04
// section 2). Preference keys keep their web names (`bustandeen_*`). Nothing sensitive goes here
// that the SQLCipher database should hold instead (outbox, cycle data, caches).

let instance: MMKV | null = null;

function store(): MMKV {
  instance ??= createMMKV({
    id: 'bustandeen.prefs',
    encryptionKey: getStorageKeys().kvKey,
    encryptionType: 'AES-256',
  });
  return instance;
}

export const kv = {
  getString: (key: string): string | undefined => store().getString(key),
  setString: (key: string, value: string): void => store().set(key, value),
  getBoolean: (key: string): boolean | undefined => store().getBoolean(key),
  setBoolean: (key: string, value: boolean): void => store().set(key, value),
  getNumber: (key: string): number | undefined => store().getNumber(key),
  setNumber: (key: string, value: number): void => store().set(key, value),
  remove: (key: string): void => {
    store().remove(key);
  },
  clearAll: (): void => store().clearAll(),
};
