import { beforeEach, expect, test, vi } from 'vitest';

import { emitMessage, setMessageHandler } from '.';

beforeEach(() => {
  setMessageHandler(null);
});

test('注册后向运行时消息处理器发送消息', () => {
  const handler = vi.fn();
  setMessageHandler(handler);

  emitMessage('warning', '请求未完成');

  expect(handler).toHaveBeenCalledWith('warning', '请求未完成');
});

test('未注册处理器时静默忽略消息', () => {
  expect(() => emitMessage('error', '系统异常')).not.toThrow();
});
