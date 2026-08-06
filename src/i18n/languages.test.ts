import { expect, test } from 'vitest';

import languages, { getLanguage } from './languages';

test('精确匹配和前缀匹配支持的语言', () => {
  expect(getLanguage('en-US').locale).toBe('en-US');
  expect(getLanguage('EN-gb').locale).toBe('en-US');
  expect(getLanguage('zh-Hans').locale).toBe('zh-CN');
});

test('未知语言回退为第一种语言', () => {
  expect(getLanguage('fr-FR')).toBe(languages[0]);
  expect(getLanguage()).toBe(languages[0]);
});
