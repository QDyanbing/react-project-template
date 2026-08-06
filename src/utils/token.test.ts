import { beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteStorage: vi.fn(),
  getStorage: vi.fn(),
  setStorage: vi.fn(),
}));

vi.mock('@/utils/storage', () => mocks);

import { deleteToken, getToken, setToken } from './token';

beforeEach(() => {
  vi.clearAllMocks();
});

test('Token 统一使用固定存储标识', () => {
  setToken('access-token');
  getToken();
  deleteToken();

  expect(mocks.setStorage).toHaveBeenCalledWith('token', 'access-token');
  expect(mocks.getStorage).toHaveBeenCalledWith('token');
  expect(mocks.deleteStorage).toHaveBeenCalledWith('token');
});
