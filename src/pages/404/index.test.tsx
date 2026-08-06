import '@/i18n';
import i18n from '@/i18n';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import NotFoundPage from '.';

const onHistoryChange = vi.hoisted(() => vi.fn());

vi.mock('@/utils/history', () => ({ onHistoryChange }));

beforeEach(() => {
  onHistoryChange.mockReset();
});

test('展示页面不存在提示并提供返回入口', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<NotFoundPage />);

  await expect.element(screen.getByText('页面不存在')).toBeVisible();
  const back = screen.getByRole('button', { name: '返回首页' });
  await expect.element(back).toBeVisible();

  await back.click();

  expect(onHistoryChange).toHaveBeenCalledWith('/');
});
