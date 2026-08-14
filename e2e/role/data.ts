import type { APIRequestContext, Page } from '@playwright/test';
import { appendFile, readFile, rm } from 'node:fs/promises';
import { AUTH_DIRECTORY, getAuthorization } from '../helpers/session';

const ROLE_FILE = `${AUTH_DIRECTORY}/roles`;

export const registerRole = async (name: string) => {
  await appendFile(ROLE_FILE, `${name}\n`);
};

export const getRoleNames = async () => {
  try {
    const content = await readFile(ROLE_FILE, 'utf8');

    return content.split('\n').filter(Boolean);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return [];

    throw error;
  }
};

export const getRoles = async (page: Page, data: API.RoleParams) => {
  const headers = await getAuthorization(page);
  const params = new URLSearchParams({
    pageNum: String(data.pageNum),
    pageSize: String(data.pageSize),
  });
  if (data.keyword !== undefined) params.set('keyword', data.keyword);

  const response = await page.request.get('/api/role', { headers, params });
  const result: API.Result<API.PageResult<API.Role>> = await response.json();

  if (!response.ok() || !result.success) throw new Error('查询测试角色失败');

  return result.data;
};

export const getRole = async (page: Page, name: string) => {
  const result = await getRoles(page, { keyword: name, pageNum: 1, pageSize: 100 });
  const role = result.list.find((item) => item.name === name);

  if (!role) throw new Error(`未找到测试角色：${name}`);

  return role;
};

export const createRole = async (page: Page, data: API.RoleSetParams) => {
  await registerRole(data.name);

  const headers = await getAuthorization(page);
  const response = await page.request.post('/api/role', { headers, data });
  const result: API.Result<boolean> = await response.json();

  if (!response.ok() || !result.success || !result.data) {
    throw new Error(`创建测试角色失败：${data.name}`);
  }

  return getRole(page, data.name);
};

export const clearRoles = async (request: APIRequestContext, token: string) => {
  const names = await getRoleNames();

  for (const name of names) {
    const searchResponse = await request.get('/api/role', {
      headers: { Authorization: `Bearer ${token}` },
      params: { keyword: name, pageNum: 1, pageSize: 100 },
    });
    const searchResult: API.SuccessResult<API.PageResult<API.Role>> = await searchResponse.json();

    if (!searchResponse.ok() || !searchResult.success) {
      throw new Error(`查询待清理角色失败：${name}`);
    }

    const roles = searchResult.data.list.filter((role) => role.name === name);

    for (const role of roles) {
      const deleteResponse = await request.delete(`/api/role/${role.uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deleteResult: API.SuccessResult<boolean> = await deleteResponse.json();

      if (!deleteResponse.ok() || !deleteResult.success || !deleteResult.data) {
        throw new Error(`清理测试角色失败：${name}`);
      }
    }
  }

  await rm(ROLE_FILE, { force: true });
};
