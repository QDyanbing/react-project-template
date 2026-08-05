import type StorageStrategy from './typing';

export default {
  set: (key, value) => localStorage.setItem(key, value),
  get: (key) => localStorage.getItem(key) ?? undefined,
  remove: (key) => localStorage.removeItem(key),
} satisfies StorageStrategy;
