import { expect, test } from '../fixtures';
import { registerSession } from '../helpers/session';
import { createRole } from '../role/data';
import { createUser, getUser, registerUser } from './data';

test.describe('用户新增', () => {
  test('Case 3.1：用户姓名为空时阻止提交', async ({ page }) => {
    const roleName = `姓名校验角色-${Date.now()}`;
    await createRole(page, { name: roleName, permissionCodes: [] });

    const roleResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/role/options',
    );

    await page.goto('/users/create');
    await roleResponsePromise;
    await page.getByLabel('角色').click();
    await page.getByText(roleName, { exact: true }).click();

    const createRequestResultPromise = page
      .waitForRequest(
        (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/user',
        { timeout: 500 },
      )
      .catch((error: unknown) => error);

    await page.getByRole('button', { name: /保\s*存/ }).click();

    await expect(page.getByText('此项为必填项')).toBeVisible();
    await expect(page).toHaveURL('/users/create');

    const createRequestResult = await createRequestResultPromise;

    expect(createRequestResult).toHaveProperty('name', 'TimeoutError');
  });

  test('Case 3.2：通过真实角色接口加载角色选项', async ({ page }) => {
    const roleName = `用户选项角色-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: ['user:view'] });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/role/options',
    );

    await page.goto('/users/create');

    const response = await responsePromise;
    const result: API.SuccessResult<API.Role[]> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uuid: role.uuid,
          name: roleName,
          permissions: expect.arrayContaining([
            expect.objectContaining({ code: 'user:view', name: '查看用户' }),
          ]),
        }),
      ]),
    );

    await page.getByLabel('角色').click();

    await expect(page.getByText(roleName, { exact: true })).toBeVisible();
  });

  test('Case 3.3：新增用户并选择角色成功', async ({ page }) => {
    const roleName = `用户新增角色-${Date.now()}`;
    const name = `新增用户-${Date.now()}`;
    const email = 'create-user@example.com';
    const phone = '13800000001';
    const role = await createRole(page, { name: roleName, permissionCodes: ['user:view'] });

    await registerUser(name);
    await page.goto('/users');
    await page.getByRole('button', { name: '新增用户' }).click();
    await expect(page).toHaveURL('/users/create');
    await page.getByLabel('用户姓名').fill(name);
    await page.getByLabel('邮箱').fill(email);
    await page.getByLabel('手机号').fill(phone);
    await page.getByLabel('角色').click();
    await page.getByText(roleName, { exact: true }).click();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/user',
    );

    await page.getByRole('button', { name: /保\s*存/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ password: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.password).not.toBe('');
    expect(response.request().postDataJSON()).toEqual({
      name,
      email,
      phone,
      roleUuids: [role.uuid],
    });
    await expect(page.getByText('密码信息', { exact: true })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/users');
    await page.goForward();
    await expect(page).toHaveURL('/users/create');

    await expect(page.getByText('密码信息', { exact: true })).not.toBeVisible();

    const user = await getUser(page, name);

    expect(user.roles).toEqual(
      expect.arrayContaining([expect.objectContaining({ uuid: role.uuid })]),
    );
  });

  test('Case 3.4：新增成功后展示后端生成的初始密码', async ({ page }) => {
    const roleName = `初始密码角色-${Date.now()}`;
    const name = `初始密码用户-${Date.now()}`;
    await createRole(page, { name: roleName, permissionCodes: [] });

    await registerUser(name);
    await page.goto('/users/create');
    await page.getByLabel('用户姓名').fill(name);
    await page.getByLabel('角色').click();
    await page.getByText(roleName, { exact: true }).click();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/user',
    );

    await page.getByRole('button', { name: /保\s*存/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ password: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.password).not.toBe('');

    await expect(page.getByText('密码信息', { exact: true })).toBeVisible();
    await expect(page.getByText(result.data.password, { exact: true })).toBeVisible();

    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: '复制密码' }).click();

    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toBe(result.data.password);

    await page
      .getByRole('dialog', { name: '密码信息' })
      .getByRole('button', { name: '关闭' })
      .click();
    await expect(page).toHaveURL('/users');
  });

  test('Case 3.9：无修改权限时直接访问用户编辑页进入 403', async ({ page }) => {
    const roleName = `用户查看角色-${Date.now()}`;
    const name = `无修改权限用户-${Date.now()}`;
    const role = await createRole(page, {
      name: roleName,
      permissionCodes: ['user:view'],
    });
    const { user, password } = await createUser(page, {
      name,
      roleUuids: [role.uuid],
    });

    await page.goto('/login');
    await page.getByLabel('账号').fill(user.account);
    await page.getByLabel('密码').fill(password);

    const loginResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/login',
    );

    await page.getByRole('button', { name: /登\s*录/ }).click();

    const loginResponse = await loginResponsePromise;
    const loginResult: API.SuccessResult<{ token: string }> = await loginResponse.json();

    expect(loginResponse.ok()).toBeTruthy();
    expect(loginResult.success).toBeTruthy();
    await registerSession(loginResult.data.token);
    await expect(page).toHaveURL('/roles');

    const accountResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/account/current',
    );

    await page.goto(`/users/modify?userId=${user.userId}`);

    const accountResponse = await accountResponsePromise;
    const accountResult: API.SuccessResult<API.Account> = await accountResponse.json();

    expect(accountResponse.ok()).toBeTruthy();
    expect(accountResult.success).toBeTruthy();
    expect(accountResult.data.userId).toBe(user.userId);
    await expect(page).toHaveURL('/403');
    await expect(page.getByText('暂无访问权限', { exact: true })).toBeVisible();
  });
});
