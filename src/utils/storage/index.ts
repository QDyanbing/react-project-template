import cookie from './cookie';
import localStorage from './localStorage';
import memory from './memory';
import sessionStorage from './sessionStorage';

const strategies = {
  cookie,
  localStorage,
  memory,
  sessionStorage,
};

type StorageType = keyof typeof strategies;

/** 当前使用的前端存储策略。 */
const STORAGE_TYPE: StorageType = 'localStorage';
const strategy = strategies[STORAGE_TYPE];

/**
 * 将数据写入当前存储策略。
 *
 * @param key 数据标识。
 * @param value 需要存储的数据。
 * @returns 数据是否写入成功。
 */
export const setStorage = <T>(key: string, value: T): boolean => {
  try {
    const data = JSON.stringify(value);
    if (data === undefined) return false;

    strategy.set(key, data);
    return true;
  } catch {
    return false;
  }
};

/**
 * 从当前存储策略中读取数据。
 *
 * @param key 数据标识。
 * @returns 存储的数据；数据不存在时返回 `undefined`。
 */
export const getStorage = <T = string>(key: string): T | undefined => {
  let value: string | undefined;

  try {
    value = strategy.get(key);
  } catch {
    return undefined;
  }

  if (value === undefined) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

/**
 * 从当前存储策略中删除数据。
 *
 * @param key 数据标识。
 * @returns 数据是否删除成功。
 */
export const deleteStorage = (key: string): boolean => {
  try {
    strategy.remove(key);
    return true;
  } catch {
    return false;
  }
};
