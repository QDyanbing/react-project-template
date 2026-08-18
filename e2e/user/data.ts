import type { APIRequestContext, Page } from '@playwright/test';
import { appendFile, readFile, rm } from 'node:fs/promises';
import { AUTH_DIRECTORY, getAuthorization } from '../helpers/session';

const USER_FILE = `${AUTH_DIRECTORY}/users`;

export const registerUser = async (name: string) => {
  await appendFile(USER_FILE, `${name}\n`);
};

export const getUserNames = async () => {
  try {
    const content = await readFile(USER_FILE, 'utf8');

    return content.split('\n').filter(Boolean);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];

    throw error;
  }
};

export const getUsers = async (page: Page, data: API.UserParams) => {
  const headers = await getAuthorization(page);
  const params = new URLSearchParams({
    pageNum: String(data.pageNum),
    pageSize: String(data.pageSize),
  });
  if (data.keyword !== undefined) params.set('keyword', data.keyword);
  if (data.status !== undefined) params.set('status', data.status);

  const response = await page.request.get('/api/user', { headers, params });
  const result: API.Result<API.PageResult<API.User>> = await response.json();

  if (!response.ok() || !result.success) throw new Error('查询测试用户失败');

  return result.data;
};

export const getUser = async (page: Page, name: string) => {
  const result = await getUsers(page, { keyword: name, pageNum: 1, pageSize: 100 });
  const user = result.list.find((item) => item.name === name);

  if (!user) throw new Error(`未找到测试用户：${name}`);

  return user;
};

export const createUser = async (page: Page, data: API.UserSetParams) => {
  await registerUser(data.name);

  const headers = await getAuthorization(page);
  const response = await page.request.post('/api/user', { headers, data });
  const result: API.Result<{ password: string }> = await response.json();

  if (!response.ok() || !result.success || !result.data.password) {
    throw new Error(`创建测试用户失败：${data.name}`);
  }

  return { user: await getUser(page, data.name), password: result.data.password };
};

export const clearUsers = async (request: APIRequestContext, token: string) => {
  const names = await getUserNames();
  const searchResults = await Promise.all(
    names.map(async (name) => {
      const response = await request.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
        params: { keyword: name, pageNum: 1, pageSize: 100 },
      });
      const result: API.Result<API.PageResult<API.User>> = await response.json();

      if (!response.ok() || !result.success) {
        throw new Error(`查询待清理用户失败：${name}`);
      }

      return result.data.list.filter((user) => user.name === name);
    }),
  );
  const users = [...new Map(searchResults.flat().map((user) => [user.userId, user])).values()];

  for (const user of users) {
    const deleteResponse = await request.delete(`/api/user/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const deleteResult: API.Result<boolean> = await deleteResponse.json();

    if (!deleteResponse.ok() || !deleteResult.success || !deleteResult.data) {
      throw new Error(`清理测试用户失败：${user.name}`);
    }
  }

  await rm(USER_FILE, { force: true });
};
