import '@/i18n';
import i18n from '@/i18n';
import useCurrentUser from '@/models/useCurrentUser';
import { getCurrent, setModifyPassword, setModifyProfile } from '@/services/account';
import { deleteToken } from '@/utils/token';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import ProfilePage from '.';

const mocks = vi.hoisted(() => ({ onHistoryReplace: vi.fn() }));

vi.mock('@/services/account', () => ({
  getCurrent: vi.fn(),
  setModifyPassword: vi.fn(),
  setModifyProfile: vi.fn(),
}));

vi.mock('@/utils/history', () => ({ onHistoryReplace: mocks.onHistoryReplace }));

vi.mock('@/utils/token', () => ({ deleteToken: vi.fn() }));

const account: API.Account = {
  uuid: 'user-1',
  account: 'admin',
  name: '管理员',
  email: 'admin@example.com',
  phone: '13800000000',
  roles: [
    {
      uuid: 'role-1',
      name: '超级管理员',
      permissions: [{ code: '*', name: '全部权限' }],
      userCount: 1,
      gmtCreate: '2026-01-01 09:00:00',
    },
  ],
  permissions: [{ code: '*', name: '全部权限' }],
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={zhCN}>
    <App>{children}</App>
  </ConfigProvider>
);

beforeEach(() => {
  mocks.onHistoryReplace.mockReset();
  vi.mocked(getCurrent).mockReset();
  vi.mocked(setModifyPassword).mockReset();
  vi.mocked(setModifyProfile).mockReset();
  vi.mocked(deleteToken).mockReset();
  vi.mocked(getCurrent).mockResolvedValue({ success: true, data: account });
  useCurrentUser.getState().mount();
});

afterEach(() => useCurrentUser.getState().unmount());

test('展示当前用户资料、角色和权限', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<ProfilePage />, { wrapper });

  await expect.element(screen.getByText('管理员', { exact: true })).toBeVisible();
  await expect.element(screen.getByText('超级管理员')).toBeVisible();
  await expect.element(screen.getByText('*')).toBeVisible();
});

test('修改资料后同步刷新当前用户', async () => {
  vi.mocked(setModifyProfile).mockResolvedValue({ success: true, data: true });
  vi.mocked(getCurrent).mockResolvedValue({
    success: true,
    data: { ...account, name: '新管理员' },
  });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<ProfilePage />, { wrapper });

  await screen.getByRole('tab', { name: '修改资料' }).click();
  await userEvent.fill(screen.getByLabelText('用户姓名'), '新管理员');
  await screen.getByRole('button', { name: '保存资料' }).click();

  await expect.element(screen.getByText('个人资料修改成功')).toBeVisible();
  expect(setModifyProfile).toHaveBeenCalledWith({
    name: '新管理员',
    email: 'admin@example.com',
    phone: '13800000000',
  });
  expect(useCurrentUser.getState().data?.name).toBe('新管理员');
});

test('修改密码后清理会话并进入登录页', async () => {
  vi.mocked(setModifyPassword).mockResolvedValue({ success: true, data: true });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<ProfilePage />, { wrapper });

  await screen.getByRole('tab', { name: '密码安全' }).click();
  await userEvent.fill(screen.getByLabelText('当前密码'), '123456');
  await userEvent.fill(screen.getByLabelText('新密码', { exact: true }), '654321');
  await userEvent.fill(screen.getByLabelText('确认新密码'), '654321');
  await screen.getByRole('button', { name: '修改密码' }).click();

  await expect.element(screen.getByText('密码修改成功，请重新登录')).toBeVisible();
  expect(setModifyPassword).toHaveBeenCalledWith({
    currentPassword: '123456',
    password: '654321',
  });
  expect(deleteToken).toHaveBeenCalledOnce();
  expect(useCurrentUser.getState().data).toBeUndefined();
  expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/login');
});
