import '@/i18n';
import i18n from '@/i18n';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import RootLayout from './root';

const mocks = vi.hoisted(() => ({
  pathname: '/home',
  onHistoryChange: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <span>页面内容</span>,
  useLocation: ({ select }: { select: (location: { pathname: string }) => string }) =>
    select({ pathname: mocks.pathname }),
}));

vi.mock('@/utils/history', () => ({ onHistoryChange: mocks.onHistoryChange }));

vi.mock('./header', () => ({
  default: () => <span>顶部导航</span>,
}));

beforeEach(() => {
  mocks.pathname = '/home';
  mocks.onHistoryChange.mockReset();
});

test('展示公共布局并通过菜单进入项目管理', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<RootLayout />);

  await expect.element(screen.getByText('顶部导航')).toBeVisible();
  await expect.element(screen.getByText('页面内容')).toBeVisible();
  await screen.getByText('项目管理').click();

  expect(mocks.onHistoryChange).toHaveBeenCalledWith('/home');
});
