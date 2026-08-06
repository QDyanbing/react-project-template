import '@/i18n';
import i18n from '@/i18n';
import { getSearch, setDelete } from '@/services/home';
import DEFAULT_PAGE_SIZE from '@/utils/pageSize';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

import HomePage from '.';
import useData from './models/useData';
import usePage from './models/usePage';

const mocks = vi.hoisted(() => ({
  onHistoryChange: vi.fn(),
}));

vi.mock('@/services/home', () => ({
  getSearch: vi.fn(),
  setDelete: vi.fn(),
}));

vi.mock('@/utils/history', () => ({ onHistoryChange: mocks.onHistoryChange }));

const mockGetSearch = vi.mocked(getSearch);
const mockSetDelete = vi.mocked(setDelete);
const item = { uuid: 'home-1', name: '项目一', description: '项目描述' };
const anotherItem = { uuid: 'home-2', name: '项目二', description: undefined };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={zhCN}>
    <App>{children}</App>
  </ConfigProvider>
);

beforeEach(() => {
  usePage.setState({
    ready: false,
    params: { pageNum: 1, pageSize: DEFAULT_PAGE_SIZE },
  });
  useData.setState({ loading: false, data: [], total: 0 });
  mocks.onHistoryChange.mockReset();
  mockGetSearch.mockReset();
  mockSetDelete.mockReset();
});

test('加载项目列表并按输入条件查询', async () => {
  mockGetSearch.mockImplementation(async (params) => ({
    success: true,
    data: {
      list: params.keyword ? [item] : [item, anotherItem],
      total: params.keyword ? 1 : 2,
    },
  }));
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomePage />, { wrapper });

  await expect.element(screen.getByText('项目一')).toBeVisible();
  await expect.element(screen.getByText('项目二')).toBeVisible();
  await userEvent.fill(screen.getByPlaceholder('请输入项目名称或描述'), '项目一');
  await screen.getByRole('button', { name: /查\s*询/ }).click();

  await expect.element(screen.getByText('项目一')).toBeVisible();
  await expect.element(screen.getByText('项目二')).not.toBeInTheDocument();
  expect(mockGetSearch).toHaveBeenLastCalledWith({
    keyword: '项目一',
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
});

test('支持进入新增、详情和编辑页面', async () => {
  mockGetSearch.mockResolvedValue({
    success: true,
    data: { list: [item], total: 1 },
  });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomePage />, { wrapper });

  await expect.element(screen.getByText('项目一')).toBeVisible();
  await screen.getByRole('button', { name: /新增项目/ }).click();
  await screen.getByRole('button', { name: '详情' }).click();
  await screen.getByRole('button', { name: '编辑' }).click();

  expect(mocks.onHistoryChange).toHaveBeenCalledWith('/home/create');
  expect(mocks.onHistoryChange).toHaveBeenCalledWith('/home/detail', { uuid: 'home-1' });
  expect(mocks.onHistoryChange).toHaveBeenCalledWith('/home/modify', { uuid: 'home-1' });
});

test('删除成功后提示并刷新列表', async () => {
  mockGetSearch
    .mockResolvedValueOnce({ success: true, data: { list: [item, anotherItem], total: 2 } })
    .mockResolvedValue({ success: true, data: { list: [anotherItem], total: 1 } });
  mockSetDelete.mockResolvedValue({ success: true, data: true });
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomePage />, { wrapper });

  await expect.element(screen.getByText('项目一')).toBeVisible();
  await screen.getByRole('button', { name: '删除' }).first().click();
  await screen.getByRole('button', { name: '确 定' }).click();

  await expect.element(screen.getByText('项目删除成功')).toBeVisible();
  await expect.element(screen.getByText('项目一')).not.toBeInTheDocument();
  await expect.element(screen.getByText('项目二')).toBeVisible();
  expect(mockSetDelete).toHaveBeenCalledWith('home-1');
});

test('切换分页后展示对应页数据', async () => {
  mockGetSearch.mockImplementation(async ({ pageNum }) => ({
    success: true,
    data: { list: pageNum === 2 ? [anotherItem] : [item], total: 12 },
  }));
  await i18n.changeLanguage('zh-CN');
  const screen = await render(<HomePage />, { wrapper });

  await expect.element(screen.getByText('项目一')).toBeVisible();
  await screen.getByText('2', { exact: true }).last().click();

  await expect.element(screen.getByText('项目二')).toBeVisible();
  await expect.element(screen.getByText('项目一')).not.toBeInTheDocument();
  expect(mockGetSearch).toHaveBeenLastCalledWith({ pageNum: 2, pageSize: DEFAULT_PAGE_SIZE });
});

test('离开页面后再次进入仍使用上次的搜索条件', async () => {
  mockGetSearch.mockResolvedValue({
    success: true,
    data: { list: [item], total: 1 },
  });
  await i18n.changeLanguage('zh-CN');
  const firstScreen = await render(<HomePage />, { wrapper });

  await expect.element(firstScreen.getByText('项目一')).toBeVisible();
  await userEvent.fill(firstScreen.getByPlaceholder('请输入项目名称或描述'), '项目一');
  await firstScreen.getByRole('button', { name: /查\s*询/ }).click();
  await firstScreen.unmount();

  const secondScreen = await render(<HomePage />, { wrapper });
  await expect.element(secondScreen.getByPlaceholder('请输入项目名称或描述')).toHaveValue('项目一');
  await expect.element(secondScreen.getByText('项目一')).toBeVisible();
});
