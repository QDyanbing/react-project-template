import type StorageStrategy from './typing';

export default {
  set: (key, value) => {
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  },
  get: (key) => {
    const prefix = `${encodeURIComponent(key)}=`;
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix));

    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
  },
  remove: (key) => {
    document.cookie = `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
} satisfies StorageStrategy;
