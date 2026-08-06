import '@/i18n';
import i18n from '@/i18n';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import ForbiddenPage from '.';

test('展示无权限提示和返回入口', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<ForbiddenPage />);

  await expect.element(screen.getByText('暂无访问权限')).toBeVisible();
  await expect.element(screen.getByRole('button', { name: '返回首页' })).toBeVisible();
});
