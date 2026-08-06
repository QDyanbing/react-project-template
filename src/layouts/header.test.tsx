import '@/i18n';
import i18n from '@/i18n';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import Header from './header';

const mocks = vi.hoisted(() => ({
  deleteToken: vi.fn(),
  onHistoryReplace: vi.fn(),
}));

vi.mock('@/components/LocaleSwitch', () => ({
  default: () => <span>语言切换</span>,
}));

vi.mock('@/utils/history', () => ({ onHistoryReplace: mocks.onHistoryReplace }));

vi.mock('@/utils/token', () => ({ deleteToken: mocks.deleteToken }));

beforeEach(() => {
  mocks.deleteToken.mockReset();
  mocks.onHistoryReplace.mockReset();
});

test('退出登录时清除 Token 并进入登录页', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<Header />);

  await screen.getByRole('button', { name: /管理员/ }).click();
  await screen.getByText('退出登录').click();

  expect(mocks.deleteToken).toHaveBeenCalledOnce();
  expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/login');
});
