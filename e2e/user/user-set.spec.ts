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

  test('Case 3.10：邮箱、手机号或角色无效时阻止提交', async ({ page }) => {
    await page.goto('/users/create');
    await page.getByLabel('用户姓名').fill(`表单校验用户-${Date.now()}`);
    await page.getByLabel('邮箱').fill('invalid-email');
    await page.getByLabel('手机号').fill('12345');

    const createRequestResultPromise = page
      .waitForRequest(
        (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/user',
        { timeout: 500 },
      )
      .catch((error: unknown) => error);

    await page.getByRole('button', { name: /保\s*存/ }).click();

    await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
    await expect(page.getByText('请输入有效的手机号')).toBeVisible();
    await expect(page.getByText('此项为必填项')).toBeVisible();
    await expect(page).toHaveURL('/users/create');
    expect(await createRequestResultPromise).toHaveProperty('name', 'TimeoutError');
  });

  test('Case 3.11：修改页面回显资料并保存最新用户信息', async ({ page }) => {
    const roleName = `用户修改角色-${Date.now()}`;
    const otherRoleName = `用户修改追加角色-${Date.now()}`;
    const name = `待修改用户-${Date.now()}`;
    const modifiedName = `${name}-已修改`;
    const modifiedEmail = 'modified-user@example.com';
    const modifiedPhone = '13900000002';
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const otherRole = await createRole(page, { name: otherRoleName, permissionCodes: [] });
    const { user } = await createUser(page, {
      name,
      email: 'before-modify@example.com',
      phone: '13800000004',
      roleUuids: [role.uuid],
    });
    await registerUser(modifiedName);

    await page.goto(`/users/modify?userId=${user.userId}`);
    await expect(page.getByLabel('用户姓名')).toHaveValue(name);
    await expect(page.getByLabel('邮箱')).toHaveValue('before-modify@example.com');
    await expect(page.getByLabel('手机号')).toHaveValue('13800000004');
    await expect(page.getByText(roleName, { exact: true })).toBeVisible();
    await page.getByLabel('用户姓名').fill(modifiedName);
    await page.getByLabel('邮箱').fill(modifiedEmail);
    await page.getByLabel('手机号').fill(modifiedPhone);
    await page.getByLabel('角色').click();
    await page.getByText(otherRoleName, { exact: true }).click();
    await page.keyboard.press('Escape');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}`,
    );

    await page.getByRole('button', { name: /保\s*存/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    if (result.success) expect(result.data).toBeTruthy();
    expect(response.request().postDataJSON()).toEqual({
      name: modifiedName,
      email: modifiedEmail,
      phone: modifiedPhone,
      roleUuids: [role.uuid, otherRole.uuid],
    });
    await expect(page.getByText('用户修改成功')).toBeVisible();
    await expect(page).toHaveURL('/users');

    const modifiedUser = await getUser(page, modifiedName);

    expect(modifiedUser).toEqual(
      expect.objectContaining({
        userId: user.userId,
        name: modifiedName,
        email: modifiedEmail,
        phone: modifiedPhone,
        roles: expect.arrayContaining([
          expect.objectContaining({ uuid: role.uuid }),
          expect.objectContaining({ uuid: otherRole.uuid }),
        ]),
      }),
    );
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
    await expect(page).toHaveURL('/403');

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
