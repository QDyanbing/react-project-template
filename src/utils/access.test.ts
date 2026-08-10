import { describe, expect, test } from 'vitest';

import { hasPermission } from './access';

describe('权限判断', () => {
  test('没有声明权限时允许访问', () => {
    expect(hasPermission([], [])).toBe(true);
  });

  test('通配权限允许访问全部受限功能', () => {
    expect(hasPermission([{ code: '*', name: '全部权限' }], ['user:delete', 'role:modify'])).toBe(
      true,
    );
  });

  test('必须同时拥有声明的全部权限', () => {
    expect(
      hasPermission(
        [
          { code: 'user:view', name: '查看用户' },
          { code: 'user:modify', name: '修改用户' },
        ],
        ['user:view', 'user:modify'],
      ),
    ).toBe(true);
    expect(
      hasPermission([{ code: 'user:view', name: '查看用户' }], ['user:view', 'user:modify']),
    ).toBe(false);
  });
});
