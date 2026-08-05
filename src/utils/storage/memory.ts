import type StorageStrategy from './typing';

const storage = new Map<string, string>();

export default {
  set: (key, value) => storage.set(key, value),
  get: (key) => storage.get(key),
  remove: (key) => storage.delete(key),
} satisfies StorageStrategy;
