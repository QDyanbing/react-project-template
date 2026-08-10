import '@/i18n';
import i18n from '@/i18n';
import { getDetail } from '@/services/home';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import HomeDetailPage from '.';
import useDetail from './models/useDetail';
import usePage from './models/usePage';

const mocks = vi.hoisted(() => ({
  search: { uuid: 'home-1' } as Record<string, unknown>,
  onHistoryBack: vi.fn(),
  onHistoryChange: vi.fn(),
  onHistoryReplace: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mocks.search,
}));

vi.mock('@/services/home', () => ({ getDetail: vi.fn() }));

vi.mock('@/utils/history', () => ({
  onHistoryBack: mocks.onHistoryBack,
  onHistoryChange: mocks.onHistoryChange,
  onHistoryReplace: mocks.onHistoryReplace,
}));

const mockGetDetail = vi.mocked(getDetail);
const item = { uuid: 'home-1', name: '项目一', description: '项目描述' };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
);

beforeEach(() => {
  mocks.search = { uuid: 'home-1' };
  usePage.setState({ uuid: undefined });
  useDetail.setState({ loading: false, data: undefined });
  mocks.onHistoryBack.mockReset();
  mocks.onHistoryChange.mockReset();
  mocks.onHistoryReplace.mockReset();
  mockGetDetail.mockReset();
});

test('根据 URL 中的 uuid 加载详情并支持返回和编辑', async () => {
  mockGetDetail.mockResolvedValue({ success: true, data: item });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeDetailPage />, { wrapper });

  await expect.element(screen.getByText('项目一')).toBeVisible();
  await expect.element(screen.getByRole('cell', { name: '项目描述', exact: true })).toBeVisible();
  await screen.getByRole('button', { name: /返回/ }).click();
  await screen.getByRole('button', { name: '编辑项目' }).click();

  expect(mockGetDetail).toHaveBeenCalledWith('home-1');
  expect(mocks.onHistoryBack).toHaveBeenCalledWith('/home');
  expect(mocks.onHistoryChange).toHaveBeenCalledWith('/home/modify', { uuid: 'home-1' });
});

test('详情请求没有返回业务结果时展示空状态', async () => {
  mockGetDetail.mockResolvedValue(undefined);
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeDetailPage />, { wrapper });

  await expect.element(screen.getByText('暂无数据').last()).toBeVisible();
});

test('uuid 变化时忽略上一个项目的迟到响应', async () => {
  let resolveFirst: ((value: API.SuccessResult<API.Home>) => void) | undefined;
  mockGetDetail
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      }),
    )
    .mockResolvedValueOnce({
      success: true,
      data: { uuid: 'home-2', name: '项目二' },
    });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeDetailPage />, { wrapper });

  mocks.search = { uuid: 'home-2' };
  await screen.rerender(<HomeDetailPage />);
  await expect.element(screen.getByText('项目二')).toBeVisible();
  resolveFirst?.({ success: true, data: item });

  await expect.element(screen.getByText('项目二')).toBeVisible();
  await expect.element(screen.getByText('项目一')).not.toBeInTheDocument();
});
