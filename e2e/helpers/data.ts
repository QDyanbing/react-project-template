import type { APIRequestContext } from '@playwright/test';
import { appendFile, readFile, rm } from 'node:fs/promises';
import { AUTH_DIRECTORY } from './session';

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
