import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deleteToken: vi.fn(),
  emitMessage: vi.fn(),
  getToken: vi.fn(),
  onHistoryReplace: vi.fn(),
}));

vi.mock('@/i18n', () => ({
  default: {
    t: (key: string, options?: { status?: number }) =>
      options?.status === undefined ? key : `${key}:${options.status}`,
  },
}));
vi.mock('@/utils/history', () => ({ onHistoryReplace: mocks.onHistoryReplace }));
vi.mock('@/utils/message', () => ({ emitMessage: mocks.emitMessage }));
vi.mock('@/utils/token', () => ({
  deleteToken: mocks.deleteToken,
  getToken: mocks.getToken,
}));

import Request, { RequestError } from './request';

const fetchMock = vi.fn();

const response = (data: unknown, status = 200, contentType = 'application/json') =>
  new Response(data === undefined ? undefined : JSON.stringify(data), {
    status,
    headers: { 'Content-Type': contentType },
  });

describe('统一请求', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mocks.deleteToken.mockReset();
    mocks.emitMessage.mockReset();
    mocks.getToken.mockReset();
    mocks.onHistoryReplace.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('location', { pathname: '/roles', search: '?page=1' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('GET 请求组装查询参数、Hash 和登录凭证', async () => {
    mocks.getToken.mockReturnValue('access-token');
    fetchMock.mockResolvedValue(response({ success: true, data: ['item'] }));

    const result = await Request.get<
      { keyword?: string; tags: string[]; pageNum: number },
      string[]
    >('/api/test?source=template#result', {
      keyword: undefined,
      tags: ['react', 'vite'],
      pageNum: 2,
    });

    expect(result?.data).toEqual(['item']);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(url).toBe('/api/test?source=template&tags=react&tags=vite&pageNum=2#result');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Authorization')).toBe('Bearer access-token');
  });

  test('写请求序列化 JSON 并保留调用方请求头', async () => {
    mocks.getToken.mockReturnValue('access-token');
    fetchMock.mockResolvedValue(response({ success: true, data: true }));

    await Request.post(
      '/api/test',
      { name: '测试数据' },
      {
        headers: {
          Accept: 'application/problem+json',
          Authorization: 'Custom token',
          'Content-Type': 'application/custom+json',
        },
        credentials: 'include',
      },
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(init).toMatchObject({
      body: JSON.stringify({ name: '测试数据' }),
      credentials: 'include',
      method: 'POST',
    });
    expect(headers.get('Accept')).toBe('application/problem+json');
    expect(headers.get('Authorization')).toBe('Custom token');
    expect(headers.get('Content-Type')).toBe('application/custom+json');
  });

  test('PUT 和 DELETE 使用对应 HTTP 方法', async () => {
    fetchMock.mockResolvedValue(response({ success: true, data: true }));

    await Request.put('/api/test/resource-id', { name: '修改后的数据' });
    await Request.delete('/api/test/resource-id');

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/test/resource-id',
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/test/resource-id',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  test('HTTP 401 按响应地址跳转登录页', async () => {
    fetchMock.mockResolvedValue(
      response(
        {
          errorMessage: '登录状态失效',
          data: '/login?redirect=%2Froles',
        },
        401,
      ),
    );

    const result = await Request.get('/api/test');

    expect(result).toBeUndefined();
    expect(mocks.deleteToken).toHaveBeenCalledOnce();
    expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/login?redirect=%2Froles');
    expect(mocks.emitMessage).not.toHaveBeenCalled();
  });

  test('已经位于重定向地址时展示错误而不重复跳转', async () => {
    vi.stubGlobal('location', { pathname: '/login', search: '?redirect=%2Froles' });
    fetchMock.mockResolvedValue(
      response(
        {
          errorMessage: '登录状态失效',
          data: '/login?redirect=%2Froles',
        },
        401,
      ),
    );

    await Request.get('/api/test');

    expect(mocks.onHistoryReplace).not.toHaveBeenCalled();
    expect(mocks.emitMessage).toHaveBeenCalledWith('error', '登录状态失效');
  });

  test('HTTP 401 没有返回跳转地址时携带当前页面跳转登录', async () => {
    fetchMock.mockResolvedValue(response({ errorMessage: '登录状态失效' }, 401));

    await Request.get('/api/test');

    expect(mocks.deleteToken).toHaveBeenCalledOnce();
    expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/login?redirect=%2Froles%3Fpage%3D1');
  });

  test('登录页发生 401 时展示错误且忽略响应中的跳转地址', async () => {
    vi.stubGlobal('location', { pathname: '/login', search: '' });
    fetchMock.mockResolvedValue(
      response(
        {
          errorMessage: '账号或密码错误',
          data: '/login?redirect=%2Froles',
        },
        401,
      ),
    );

    await Request.post('/api/login', { account: 'admin', password: 'error' });

    expect(mocks.deleteToken).toHaveBeenCalledOnce();
    expect(mocks.onHistoryReplace).not.toHaveBeenCalled();
    expect(mocks.emitMessage).toHaveBeenCalledWith('error', '账号或密码错误');
  });

  test.each([
    [403, 'warning', 'request.forbidden'],
    [404, 'error', 'request.notFound'],
    [500, 'error', 'request.serverError'],
    [422, 'error', 'request.failed:422'],
  ] as const)('HTTP %s 使用统一状态提示', async (status, level, message) => {
    fetchMock.mockResolvedValue(response({}, status));

    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenCalledWith(level, message);
  });

  test('HTTP 错误优先使用后端 Message', async () => {
    fetchMock.mockResolvedValue(response({ message: '后端错误' }, 400));

    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenCalledWith('error', '后端错误');
  });

  test('业务重定向错误执行页面替换', async () => {
    fetchMock.mockResolvedValue(
      response({ success: false, errorCode: '302', data: '/login?redirect=%2Froles' }),
    );

    await Request.get('/api/test');

    expect(mocks.onHistoryReplace).toHaveBeenCalledWith('/login?redirect=%2Froles');
  });

  test('业务警告和系统错误使用对应兜底文案', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ success: false, errorType: 'WARNING' }))
      .mockResolvedValueOnce(response({ success: false }))
      .mockResolvedValueOnce(response({ success: false, errorCode: '404' }));

    await Request.get('/api/test');
    await Request.get('/api/test');
    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenNthCalledWith(1, 'warning', 'request.unfinished');
    expect(mocks.emitMessage).toHaveBeenNthCalledWith(2, 'error', 'request.systemError');
    expect(mocks.emitMessage).toHaveBeenNthCalledWith(3, 'error', 'request.notFound');
  });

  test('非法成功响应和 JSON 解析失败使用响应格式错误', async () => {
    fetchMock
      .mockResolvedValueOnce(response({ data: 'missing success' }))
      .mockResolvedValueOnce(
        new Response('{', { headers: { 'Content-Type': 'application/json' } }),
      );

    await Request.get('/api/test');
    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenNthCalledWith(1, 'error', 'request.invalidResponse');
    expect(mocks.emitMessage).toHaveBeenNthCalledWith(2, 'error', 'request.invalidResponse');
  });

  test('HTTP 错误响应 JSON 解析失败仍按状态处理', async () => {
    fetchMock.mockResolvedValue(
      new Response('{', { status: 500, headers: { 'Content-Type': 'application/json' } }),
    );

    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenCalledWith('error', 'request.serverError');
  });

  test('空响应和文本响应均视为非法业务响应', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(undefined, { status: 204 }))
      .mockResolvedValueOnce(new Response('plain text', { status: 200 }));

    await Request.get('/api/test');
    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenNthCalledWith(1, 'error', 'request.invalidResponse');
    expect(mocks.emitMessage).toHaveBeenNthCalledWith(2, 'error', 'request.invalidResponse');
  });

  test('网络错误由全局错误处理转换', async () => {
    fetchMock.mockRejectedValue(new TypeError('network failed'));

    await Request.get('/api/test');

    expect(mocks.emitMessage).toHaveBeenCalledWith('error', 'request.networkError');
  });

  test('取消请求默认静默，关闭全局处理时向调用方抛出', async () => {
    const error = new DOMException('aborted', 'AbortError');
    fetchMock.mockRejectedValue(error);

    await expect(Request.get('/api/test')).resolves.toBeUndefined();
    await expect(Request.get('/api/test', undefined, { skipErrorHandler: true })).rejects.toBe(
      error,
    );
    expect(mocks.emitMessage).not.toHaveBeenCalled();
  });

  test('关闭全局错误处理时抛出包含状态和响应数据的 RequestError', async () => {
    const data = { errorMessage: '参数错误' };
    fetchMock.mockResolvedValue(response(data, 400));

    const request = Request.get('/api/test', undefined, { skipErrorHandler: true });

    await expect(request).rejects.toMatchObject({
      name: 'RequestError',
      message: '参数错误',
      data,
      level: 'error',
      status: 400,
    });
    await expect(request).rejects.toBeInstanceOf(RequestError);
    expect(mocks.emitMessage).not.toHaveBeenCalled();
  });
});
