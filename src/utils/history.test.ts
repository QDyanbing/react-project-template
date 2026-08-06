import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  back: vi.fn(),
  canGoBack: vi.fn(),
  navigate: vi.fn(),
  open: vi.fn(),
}));

vi.mock('@config/router', () => ({
  router: {
    history: {
      back: mocks.back,
      canGoBack: mocks.canGoBack,
    },
    navigate: mocks.navigate,
  },
}));

import { onHistoryBack, onHistoryChange, onHistoryReplace, onOpenTab } from './history';

describe('页面跳转', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', { open: mocks.open });
  });

  test('新增或替换浏览器历史记录', () => {
    const search = { uuid: 'project-uuid' };

    onHistoryChange('/home/detail', search);
    onHistoryReplace('/login');

    expect(mocks.navigate).toHaveBeenNthCalledWith(1, {
      to: '/home/detail',
      search,
    });
    expect(mocks.navigate).toHaveBeenNthCalledWith(2, {
      to: '/login',
      search: undefined,
      replace: true,
    });
  });

  test('存在历史记录时返回上一页', () => {
    mocks.canGoBack.mockReturnValue(true);

    onHistoryBack('/home');

    expect(mocks.back).toHaveBeenCalledOnce();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test('不存在历史记录时替换为兜底页面', () => {
    mocks.canGoBack.mockReturnValue(false);

    onHistoryBack('/home');

    expect(mocks.navigate).toHaveBeenCalledWith({ to: '/home', replace: true });
    expect(mocks.back).not.toHaveBeenCalled();
  });

  test('在新标签页打开页面', () => {
    onOpenTab('/home/detail?uuid=project-uuid');

    expect(mocks.open).toHaveBeenCalledWith(
      '/home/detail?uuid=project-uuid',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
