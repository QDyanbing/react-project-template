import '@/i18n';
import i18n from '@/i18n';
import { getDetail, setCreate, setModify } from '@/services/home';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import HomeSetPage from '.';
import useDetail from './models/useDetail';
import usePage from './models/usePage';

const mocks = vi.hoisted(() => ({
  search: {} as Record<string, unknown>,
  onHistoryBack: vi.fn(),
  onHistoryChange: vi.fn(),
  onHistoryReplace: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mocks.search,
}));

vi.mock('@/services/home', () => ({
  getDetail: vi.fn(),
  setCreate: vi.fn(),
  setModify: vi.fn(),
}));

vi.mock('@/utils/history', () => ({
  onHistoryBack: mocks.onHistoryBack,
  onHistoryChange: mocks.onHistoryChange,
  onHistoryReplace: mocks.onHistoryReplace,
}));

const mockGetDetail = vi.mocked(getDetail);
const mockSetCreate = vi.mocked(setCreate);
const mockSetModify = vi.mocked(setModify);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={zhCN}>
    <App>{children}</App>
  </ConfigProvider>
);

beforeEach(() => {
  mocks.search = {};
  usePage.setState({ ready: false, uuid: undefined });
  useDetail.setState({ loading: false, data: undefined });
  mocks.onHistoryBack.mockReset();
  mocks.onHistoryChange.mockReset();
  mocks.onHistoryReplace.mockReset();
  mockGetDetail.mockReset();
  mockSetCreate.mockReset();
  mockSetModify.mockReset();
});

test('填写项目内容后提交新增并返回来源页面', async () => {
  mockSetCreate.mockResolvedValue({ success: true, data: true });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeSetPage />, { wrapper });

  await userEvent.fill(screen.getByLabelText('项目名称'), '新增项目');
  await userEvent.fill(screen.getByLabelText('项目描述'), '新增描述');
  await screen.getByRole('button', { name: /保\s*存/ }).click();

  await expect.element(screen.getByText('项目创建成功')).toBeVisible();
  expect(mockSetCreate).toHaveBeenCalledWith({ name: '新增项目', description: '新增描述' });
  expect(mockGetDetail).not.toHaveBeenCalled();
  expect(mockSetModify).not.toHaveBeenCalled();
  expect(mocks.onHistoryBack).toHaveBeenCalledWith('/home');
});

test('新增请求没有返回业务结果时停留在当前页面', async () => {
  mockSetCreate.mockResolvedValue(undefined);
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeSetPage />, { wrapper });

  await userEvent.fill(screen.getByLabelText('项目名称'), '新增项目');
  await screen.getByRole('button', { name: /保\s*存/ }).click();

  await expect.poll(() => mockSetCreate.mock.calls.length).toBe(1);
  expect(mocks.onHistoryBack).not.toHaveBeenCalled();
});

test('编辑页面回填详情并提交修改', async () => {
  mocks.search = { uuid: 'home-1' };
  mockGetDetail.mockResolvedValue({
    success: true,
    data: { uuid: 'home-1', name: '原项目', description: '原描述' },
  });
  mockSetModify.mockResolvedValue({ success: true, data: true });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeSetPage />, { wrapper });

  await expect.element(screen.getByLabelText('项目名称')).toHaveValue('原项目');
  await userEvent.fill(screen.getByLabelText('项目名称'), '修改项目');
  await screen.getByRole('button', { name: /保\s*存/ }).click();

  await expect.element(screen.getByText('项目修改成功')).toBeVisible();
  expect(mockGetDetail).toHaveBeenCalledWith('home-1');
  expect(mockSetModify).toHaveBeenCalledWith('home-1', {
    name: '修改项目',
    description: '原描述',
  });
  expect(mockSetCreate).not.toHaveBeenCalled();
  expect(mocks.onHistoryBack).toHaveBeenCalledWith('/home');
});

test('取消编辑时返回来源页面', async () => {
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomeSetPage />, { wrapper });

  await screen.getByRole('button', { name: /取\s*消/ }).click();

  expect(mocks.onHistoryBack).toHaveBeenCalledWith('/home');
});
