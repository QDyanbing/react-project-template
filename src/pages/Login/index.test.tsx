import '@/i18n';
import i18n from '@/i18n';
import { setLogin } from '@/services/account';
import { setToken } from '@/utils/token';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import LoginPage from '.';

const mocks = vi.hoisted(() => ({
  search: {} as Record<string, unknown>,
  onHistoryChange: vi.fn(),
  onHistoryReplace: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mocks.search,
}));

vi.mock('@/components/LocaleSwitch', () => ({
  default: () => <span>语言切换</span>,
}));

vi.mock('@/services/account', () => ({ setLogin: vi.fn() }));

vi.mock('@/utils/history', () => ({
  onHistoryChange: mocks.onHistoryChange,
  onHistoryReplace: mocks.onHistoryReplace,
}));

vi.mock('@/utils/token', () => ({ setToken: vi.fn() }));

const mockSetLogin = vi.mocked(setLogin);
const mockSetToken = vi.mocked(setToken);

beforeEach(() => {
  mocks.search = {};
  mocks.onHistoryChange.mockReset();
  mocks.onHistoryReplace.mockReset();
  mockSetLogin.mockReset();
  mockSetToken.mockReset();
});

test('登录成功后保存 Token 并进入首页', async () => {
  mockSetLogin.mockResolvedValue({ success: true, data: { token: 'token-value' } });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<LoginPage />);

  await screen.getByRole('button', { name: /登\s*录/ }).click();

  await expect.poll(() => mockSetLogin.mock.calls.length).toBe(1);
  expect(mockSetLogin).toHaveBeenCalledWith({ account: 'admin', password: '123456' });
  expect(mockSetToken).toHaveBeenCalledWith('token-value');
  expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/');
});

test('登录成功后返回 URL 指定的来源页面', async () => {
  mocks.search = { redirect: '/403' };
  mockSetLogin.mockResolvedValue({ success: true, data: { token: 'token-value' } });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<LoginPage />);

  await screen.getByRole('button', { name: /登\s*录/ }).click();

  await expect.poll(() => mockSetLogin.mock.calls.length).toBe(1);
  expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/403');
});

test('登录请求没有返回业务结果时停留在当前页面', async () => {
  mockSetLogin.mockResolvedValue(undefined);
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<LoginPage />);

  await screen.getByRole('button', { name: /登\s*录/ }).click();

  await expect.poll(() => mockSetLogin.mock.calls.length).toBe(1);
  expect(mockSetToken).not.toHaveBeenCalled();
  expect(mocks.onHistoryReplace).not.toHaveBeenCalled();
});

test('账号和密码为空时展示校验信息且不提交', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<LoginPage />);

  await userEvent.fill(screen.getByLabelText('账号'), '');
  await userEvent.fill(screen.getByLabelText('密码'), '');
  await screen.getByRole('button', { name: /登\s*录/ }).click();

  await expect.element(screen.getByText('请输入账号', { exact: true })).toBeVisible();
  await expect.element(screen.getByText('请输入密码')).toBeVisible();
  expect(mockSetLogin).not.toHaveBeenCalled();
});
