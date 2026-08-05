import type StorageStrategy from './typing';

export default {
  set: (key, value) => sessionStorage.setItem(key, value),
  get: (key) => sessionStorage.getItem(key) ?? undefined,
  remove: (key) => sessionStorage.removeItem(key),
} satisfies StorageStrategy;
