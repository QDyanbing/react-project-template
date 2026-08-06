import '@/i18n';
import i18n from '@/i18n';
import { afterEach, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import LocaleSwitch from '.';

afterEach(async () => {
  await i18n.changeLanguage('zh-CN');
});

test('选择语言后更新当前语言', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<LocaleSwitch />);
  const select = screen.getByRole('combobox', { name: '切换语言' });

  await userEvent.click(select);
  await userEvent.click(screen.getByText('English'));

  await expect.poll(() => i18n.resolvedLanguage).toBe('en-US');
});
