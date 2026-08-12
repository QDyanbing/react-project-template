import type { Page } from '@playwright/test';
import { appendFile, mkdir, readFile, rm } from 'node:fs/promises';

export const AUTH_DIRECTORY = 'playwright/.auth';
export const AUTH_FILE = `${AUTH_DIRECTORY}/admin.json`;
const SESSION_FILE = `${AUTH_DIRECTORY}/sessions`;

export const resetSessions = async () => {
  await mkdir(AUTH_DIRECTORY, { recursive: true });
  await rm(SESSION_FILE, { force: true });
};

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

export const login = async (page: Page) => {
  await page.getByLabel('账号').fill('admin');
  await page.getByLabel('密码').fill('123456');

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
  );

  await page.getByRole('button', { name: /登\s*录/ }).click();

  const response = await responsePromise;
  const result: API.SuccessResult<{ token: string }> = await response.json();

  return { response, result };
};
