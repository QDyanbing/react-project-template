import { expect, test } from './fixtures';
import { login, registerSession } from './helpers/session';
import { createRole } from './role/data';
import { createUser, setUserStatus } from './user/data';

test.describe('登录成功', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Case 1.1：使用正确账号和密码登录成功', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('账号').fill('admin');
    await page.getByLabel('密码').fill('123456');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
    );

    await page.getByRole('button', { name: /登\s*录/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ token: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.token).not.toBe('');
    await registerSession(result.data.token);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('token')))
      .toBe(JSON.stringify(result.data.token));
  });

  test('Case 1.2：登录成功后进入首页', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('账号').fill('admin');
    await page.getByLabel('密码').fill('123456');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
    );

    await page.getByRole('button', { name: /登\s*录/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ token: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    await registerSession(result.data.token);

    await expect(page).toHaveURL('/roles');
    await expect(page.getByRole('menuitem', { name: '角色管理' })).toBeVisible();
  });
});

test('Case 1.3：登录成功后加载当前用户、角色和权限', async ({ page }) => {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      new URL(response.url()).pathname === '/api/account/current',
  );

  await page.goto('/profile');

  const response = await responsePromise;
  const result: API.SuccessResult<API.Account> = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(result.success).toBeTruthy();
  expect(result.data.roles.length).toBeGreaterThan(0);
  expect(result.data.permissions.length).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: result.data.name })).toBeVisible();
  await expect(page.getByText('超级管理员', { exact: true })).toBeVisible();
  await expect(page.getByText('全部权限 (*)', { exact: true })).toBeVisible();
});

test('Case 1.11：被禁用账号无法登录', async ({ page }) => {
  const roleName = `禁用登录角色-${Date.now()}`;
  const name = `禁用登录用户-${Date.now()}`;
  const role = await createRole(page, { name: roleName, permissionCodes: [] });
  const { user, password } = await createUser(page, { name, roleUuids: [role.uuid] });
  await setUserStatus(page, user.userId, 'disabled');

  await page.goto('/login');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByLabel('账号').fill(user.account);
  await page.getByLabel('密码').fill(password);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
  );

  await page.getByRole('button', { name: /登\s*录/ }).click();

  const response = await responsePromise;
  const result: API.Result<{ token: string }> = await response.json();

  expect(response.ok()).toBeTruthy();
  expect(result.success).toBeFalsy();
  if (!result.success) expect(result.errorMessage).toBe('当前账号已被禁用');
  await expect(page.getByText('当前账号已被禁用')).toBeVisible();
  await expect(page).toHaveURL('/login');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test.describe('独立未登录会话', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Case 1.4：账号错误时登录失败', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('账号').fill('unknown');
    await page.getByLabel('密码').fill('123456');
    await page.getByRole('button', { name: /登\s*录/ }).click();

    await expect(page.getByText('账号或密码错误')).toBeVisible();
    await expect(page).toHaveURL('/login');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('Case 1.5：密码错误时登录失败', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('账号').fill('admin');
    await page.getByLabel('密码').fill('error');
    await page.getByRole('button', { name: /登\s*录/ }).click();

    await expect(page.getByText('账号或密码错误')).toBeVisible();
    await expect(page).toHaveURL('/login');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('Case 1.6：未登录访问业务页面时跳转登录页并携带 redirect', async ({ page }) => {
    await page.goto('/roles');

    await expect(page).toHaveURL('/login?redirect=%2Froles');
  });

  test('Case 1.7：存在 redirect 时登录成功后返回来源页面', async ({ page }) => {
    await page.goto('/login?redirect=%2Fprofile');

    await page.getByLabel('账号').fill('admin');
    await page.getByLabel('密码').fill('123456');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
    );

    await page.getByRole('button', { name: /登\s*录/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ token: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    await registerSession(result.data.token);

    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('button', { name: '修改账号信息' })).toBeVisible();
  });

  test('Case 1.8：不存在 redirect 时登录成功后进入根路径', async ({ page }) => {
    await page.goto('/login');

    const rootPromise = page.waitForURL((url) => url.pathname === '/');

    await page.getByLabel('账号').fill('admin');
    await page.getByLabel('密码').fill('123456');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
    );

    await page.getByRole('button', { name: /登\s*录/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ token: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    await registerSession(result.data.token);

    await rootPromise;
    await expect(page).toHaveURL('/roles');
    await expect(page.getByRole('menuitem', { name: '角色管理' })).toBeVisible();
  });

  test('Case 1.9：无效 Token 触发登录失效处理', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.setItem('token', JSON.stringify('invalid-token')));

    await page.goto('/roles');

    await expect(page).toHaveURL('/login?redirect=%2Froles');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('Case 1.10：退出登录后本地 Token 清除且服务端会话失效', async ({ page }) => {
    await page.goto('/login');

    const { response, result } = await login(page);

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.token).not.toBe('');
    await registerSession(result.data.token);
    await expect(page).toHaveURL('/roles');

    await page.getByRole('button', { name: '管理员' }).click();

    const logoutResponsePromise = page.waitForResponse(
      (logoutResponse) =>
        logoutResponse.request().method() === 'POST' &&
        new URL(logoutResponse.url()).pathname === '/api/logout',
    );

    await page.getByRole('menuitem', { name: '退出登录' }).click();

    const logoutResponse = await logoutResponsePromise;
    const logoutResult: API.SuccessResult<boolean> = await logoutResponse.json();

    expect(logoutResponse.ok()).toBeTruthy();
    expect(logoutResult.success).toBeTruthy();
    expect(logoutResult.data).toBeTruthy();
    await expect(page).toHaveURL('/login');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();

    await page.evaluate(
      (token) => localStorage.setItem('token', JSON.stringify(token)),
      result.data.token,
    );
    await page.goto('/roles');

    await expect(page).toHaveURL('/login?redirect=%2Froles');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });
});
