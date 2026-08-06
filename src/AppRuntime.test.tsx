import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { setMessageHandler } from '@/utils/message';
import AppRuntime from './AppRuntime';

const mocks = vi.hoisted(() => ({
  warning: vi.fn(),
  error: vi.fn(),
}));

vi.mock('antd', () => ({
  App: {
    useApp: () => ({ message: { warning: mocks.warning, error: mocks.error } }),
  },
}));

vi.mock('@/utils/message', () => ({ setMessageHandler: vi.fn() }));

const mockSetMessageHandler = vi.mocked(setMessageHandler);

beforeEach(() => {
  mocks.warning.mockReset();
  mocks.error.mockReset();
  mockSetMessageHandler.mockReset();
});

test('注册全局消息处理并在卸载时清理', async () => {
  const screen = await render(<AppRuntime />);
  const handler = mockSetMessageHandler.mock.calls[0]?.[0];

  expect(handler).toBeTypeOf('function');
  handler?.('warning', '请求警告');
  handler?.('error', '请求错误');
  expect(mocks.warning).toHaveBeenCalledWith('请求警告');
  expect(mocks.error).toHaveBeenCalledWith('请求错误');

  await screen.unmount();

  expect(mockSetMessageHandler).toHaveBeenLastCalledWith(null);
});
