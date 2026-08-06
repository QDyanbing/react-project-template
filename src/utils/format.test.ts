import { describe, expect, test } from 'vitest';

import { DATE_FORMAT, DATE_TIME_FORMAT, formatDate, formatTime } from './format';

describe('日期格式化', () => {
  test('按照统一格式输出日期和时间', () => {
    const value = '2026-08-06T12:34:56';

    expect(formatTime(value)).toBe('2026-08-06 12:34:56');
    expect(formatDate(value)).toBe('2026-08-06');
    expect(DATE_TIME_FORMAT).toBe('YYYY-MM-DD HH:mm:ss');
    expect(DATE_FORMAT).toBe('YYYY-MM-DD');
  });

  test('无效日期返回空字符串', () => {
    expect(formatTime('invalid')).toBe('');
    expect(formatDate('invalid')).toBe('');
  });
});
