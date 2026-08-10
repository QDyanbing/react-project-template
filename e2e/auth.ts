import type { APIRequestContext } from '@playwright/test';

export default async (request: APIRequestContext) => {
  const response = await request.post('/api/login', {
    data: { account: 'admin', password: '123456' },
  });
  if (!response.ok()) throw new Error(`获取 E2E 认证信息失败：${response.status()}`);

  const result = (await response.json()) as API.Result<{ token: string }>;
  if (!result.success) {
    throw new Error(`获取 E2E 认证信息失败：${result.errorMessage ?? '未知错误'}`);
  }

  return { Authorization: `Bearer ${result.data.token}` };
};
