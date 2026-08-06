import { beforeEach, describe, expect, test, vi } from 'vitest';

import { deleteStorage, getStorage, setStorage } from '.';
import cookie from './cookie';
import local from './localStorage';
import memory from './memory';
import session from './sessionStorage';

const createBrowserStorage = () => {
  const data = new Map<string, string>();

  return {
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => data.delete(key),
    setItem: (key: string, value: string) => data.set(key, value),
    get length() {
      return data.size;
    },
  } satisfies Storage;
};

const createDocument = () => {
  const data = new Map<string, string>();
  const document = {} as Document;

  Object.defineProperty(document, 'cookie', {
    get: () => [...data.entries()].map(([key, value]) => `${key}=${value}`).join('; '),
    set: (value: string) => {
      const [entry = '', ...attributes] = value.split('; ');
      const separator = entry.indexOf('=');
      const key = entry.slice(0, separator);
      const content = entry.slice(separator + 1);

      if (attributes.includes('Max-Age=0')) {
        data.delete(key);
      } else {
        data.set(key, content);
      }
    },
  });

  return document;
};

describe('前端存储', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createBrowserStorage());
    vi.stubGlobal('sessionStorage', createBrowserStorage());
    vi.stubGlobal('document', createDocument());
  });

  test('统一存储方法读写和删除可序列化数据', () => {
    const value = { name: '项目模板' };

    expect(setStorage('project', value)).toBe(true);
    expect(getStorage('project')).toEqual(value);
    expect(deleteStorage('project')).toBe(true);
    expect(getStorage('project')).toBeUndefined();
  });

  test('统一存储方法兼容原始字符串并自行处理失败', () => {
    localStorage.setItem('legacy', 'legacy-value');
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(getStorage('legacy')).toBe('legacy-value');
    expect(setStorage('circular', circular)).toBe(false);

    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('read error');
      },
      setItem: () => {
        throw new Error('write error');
      },
      removeItem: () => {
        throw new Error('remove error');
      },
    });

    expect(setStorage('project', 'value')).toBe(false);
    expect(getStorage('project')).toBeUndefined();
    expect(deleteStorage('project')).toBe(false);
  });

  test('内存策略读写和删除数据', () => {
    memory.set('project', 'memory');

    expect(memory.get('project')).toBe('memory');
    memory.remove('project');
    expect(memory.get('project')).toBeUndefined();
  });

  test('LocalStorage 和 SessionStorage 策略读写和删除数据', () => {
    local.set('project', 'local');
    session.set('project', 'session');

    expect(local.get('project')).toBe('local');
    expect(session.get('project')).toBe('session');

    local.remove('project');
    session.remove('project');

    expect(local.get('project')).toBeUndefined();
    expect(session.get('project')).toBeUndefined();
  });

  test('Cookie 策略编码数据并支持删除', () => {
    cookie.set('project name', 'React 模板');

    expect(cookie.get('project name')).toBe('React 模板');
    expect(cookie.get('missing')).toBeUndefined();

    cookie.remove('project name');
    expect(cookie.get('project name')).toBeUndefined();
  });
});
