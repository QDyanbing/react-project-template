import type { APIRequestContext, Page } from '@playwright/test';
import { appendFile, mkdir, readFile, rm } from 'node:fs/promises';

export const AUTH_DIRECTORY = 'playwright/.auth';
export const AUTH_FILE = `${AUTH_DIRECTORY}/admin.json`;
const SESSION_FILE = `${AUTH_DIRECTORY}/sessions`;

export const registerSession = async (token: string) => {
  await appendFile(SESSION_FILE, `${token}\n`);
};

export const getSessions = async () => {
  try {
    const content = await readFile(SESSION_FILE, 'utf8');

    return content.split('\n').filter(Boolean);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];

    throw error;
  }
};

export const getAuthorization = async (page: Page) => {
  const storageState = await page.context().storageState();
  const tokenValue = storageState.origins
    .flatMap((origin) => origin.localStorage)
    .find(({ name }) => name === 'token')?.value;
  const token = JSON.parse(tokenValue ?? 'null');

  if (!token) throw new Error('未找到测试认证信息');

  return { Authorization: `Bearer ${token}` };
};

export const clearSessions = async (request: APIRequestContext) => {
  const tokens = await getSessions();

  const results = await Promise.allSettled(
    tokens.map(async (token) => {
      const response = await request.post('/api/logout', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result: API.SuccessResult<boolean> = await response.json();

      if (!response.ok() || !result.success || !result.data) {
        throw new Error('认证会话清理失败');
      }
    }),
  );
  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map(({ reason }) => reason);

  if (errors.length > 0) throw new AggregateError(errors, '认证会话清理失败');

  await mkdir(AUTH_DIRECTORY, { recursive: true });
  await rm(SESSION_FILE, { force: true });
};

export const loginAccount = async (page: Page, data: API.AccountLoginParams) => {
  await page.getByLabel('账号').fill(data.account);
  await page.getByLabel('密码').fill(data.password);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
  );

  await page.getByRole('button', { name: /登\s*录/ }).click();

  const response = await responsePromise;
  const result: API.Result<{ token: string }> = await response.json();

  return { response, result };
};

export const login = async (page: Page) => {
  const { response, result } = await loginAccount(page, {
    account: 'admin',
    password: '123456',
  });

  if (!result.success) throw new Error('管理员登录失败');

  return { response, result };
};

export const loginSession = async (page: Page, data: API.AccountLoginParams) => {
  await page.goto('/login');

  const { response, result } = await loginAccount(page, data);

  if (!response.ok() || !result.success || !result.data.token) {
    throw new Error(`测试账号登录失败：${data.account}`);
  }

  await registerSession(result.data.token);
  await page.waitForFunction(
    (token) => localStorage.getItem('token') === JSON.stringify(token),
    result.data.token,
  );

  return result.data.token;
};
