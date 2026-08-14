import { expect, test as setup } from '@playwright/test';
import { AUTH_FILE, clearSessions, login, registerSession } from './helpers/session';
import { clearRoles } from './role/data';
import { clearUsers } from './user/data';

setup('保存管理员认证状态', async ({ page }) => {
  await clearSessions(page.request);
  await page.goto('/login');

  const { response, result } = await login(page);

  expect(response.ok()).toBeTruthy();
  expect(result.success).toBeTruthy();
  expect(result.data.token).not.toBe('');
  await registerSession(result.data.token);
  await clearUsers(page.request, result.data.token);
  await clearRoles(page.request, result.data.token);
  await page.waitForURL('/home');

  await page.context().storageState({ path: AUTH_FILE });
});
