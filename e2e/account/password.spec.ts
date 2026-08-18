import { errors } from '@playwright/test';
import { expect, test } from '../fixtures';
import { loginAccount, loginSession, registerSession } from '../helpers/session';
import { createRole } from '../role/data';
import { createUser } from '../user/data';

test.describe('修改密码', () => {
  test('Case 4.4：必填项或两次新密码不一致时阻止提交', async ({ page }) => {
    await page.goto('/profile/password');
    await page.getByRole('button', { name: /确\s*定/ }).click();

    await expect(page.getByText('此项为必填项')).toHaveCount(3);

    await page.getByLabel('当前密码').fill('123456');
    await page.getByLabel('新密码', { exact: true }).fill('new-password');
    await page.getByLabel('确认新密码').fill('different-password');

    const modifyRequestResultPromise = page
      .waitForRequest(
        (request) =>
          request.method() === 'PUT' && new URL(request.url()).pathname === '/api/account/password',
        { timeout: 500 },
      )
      .catch((error: unknown) => error);

    await page.getByRole('button', { name: /确\s*定/ }).click();

    await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
    await expect(page).toHaveURL('/profile/password');
    expect(await modifyRequestResultPromise).toBeInstanceOf(errors.TimeoutError);
  });

  test('Case 4.5：当前密码错误时保留在修改密码页面', async ({ page }) => {
    await page.goto('/profile/password');
    await page.getByLabel('当前密码').fill('wrong-password');
    await page.getByLabel('新密码', { exact: true }).fill('new-password');
    await page.getByLabel('确认新密码').fill('new-password');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === '/api/account/password',
    );

    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeFalsy();
    if (!result.success) expect(result.errorMessage).toBe('当前密码不正确');
    await expect(page.getByText('当前密码不正确')).toBeVisible();
    await expect(page).toHaveURL('/profile/password');
  });

  test('Case 4.6：修改密码后旧会话失效且新密码可以登录', async ({ page }) => {
    const roleName = `密码修改角色-${Date.now()}`;
    const name = `密码修改用户-${Date.now()}`;
    const newPassword = `New-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user, password } = await createUser(page, { name, roleUuids: [role.uuid] });
    const previousToken = await loginSession(page, { account: user.account, password });

    await page.goto('/profile/password');
    await page.getByLabel('当前密码').fill(password);
    await page.getByLabel('新密码', { exact: true }).fill(newPassword);
    await page.getByLabel('确认新密码').fill(newPassword);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === '/api/account/password',
    );

    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    if (result.success) expect(result.data).toBeTruthy();
    await expect(page.getByText('密码修改成功，请重新登录')).toBeVisible();
    await expect(page).toHaveURL('/login');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();

    const expiredSessionResponse = await page.request.get('/api/account/current', {
      headers: { Authorization: `Bearer ${previousToken}` },
    });
    const expiredSessionResult: API.Result<API.Account> = await expiredSessionResponse.json();

    expect(expiredSessionResponse.status()).toBe(401);
    expect(expiredSessionResult.success).toBeFalsy();
    if (!expiredSessionResult.success) expect(expiredSessionResult.errorCode).toBe('401');

    const oldLogin = await loginAccount(page, { account: user.account, password });

    expect(oldLogin.response.ok()).toBeTruthy();
    expect(oldLogin.result.success).toBeFalsy();
    await expect(page.getByText('账号或密码错误')).toBeVisible();

    const newLogin = await loginAccount(page, { account: user.account, password: newPassword });

    expect(newLogin.response.ok()).toBeTruthy();
    expect(newLogin.result.success).toBeTruthy();
    if (!newLogin.result.success) throw new Error('新密码登录失败');

    await registerSession(newLogin.result.data.token);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('token')))
      .toBe(JSON.stringify(newLogin.result.data.token));
    await page.goto('/profile');
    await expect(page.getByRole('rowgroup').getByText(name, { exact: true })).toBeVisible();
  });
});
