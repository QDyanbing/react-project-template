import { expect, test } from '../fixtures';
import { getPaginationTotal } from '../helpers/pagination';
import { loginAccount, loginSession, registerSession } from '../helpers/session';
import { createRole } from '../role/data';
import { createUser, getUser, getUsers, setUserStatus } from './data';

test.describe('用户管理', () => {
  test('Case 3.5：通过查询确认用户创建成功', async ({ page }) => {
    const roleName = `用户查询角色-${Date.now()}`;
    const name = `查询确认用户-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user } = await createUser(page, {
      name,
      email: 'search-user@example.com',
      phone: '13800000002',
      roleUuids: [role.uuid],
    });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });

    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').nth(0)).toHaveText(user.account);
    await expect(row.getByRole('cell').nth(1)).toHaveText(name);
    await expect(row.getByText(roleName, { exact: true })).toBeVisible();
    await expect(row.getByText('启用', { exact: true })).toBeVisible();
    await expect(getPaginationTotal(page, 1)).toBeVisible();
  });

  test('Case 3.7：重置用户密码后展示新密码且登录凭证同步更新', async ({ page }) => {
    const roleName = `密码重置角色-${Date.now()}`;
    const name = `密码重置用户-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user, password: oldPassword } = await createUser(page, {
      name,
      roleUuids: [role.uuid],
    });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}/password`,
    );

    await row.getByRole('button', { name: '重置密码' }).click();
    await page.getByRole('button', { name: '确 定' }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ password: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.password).not.toBe('');
    expect(result.data.password).not.toBe(oldPassword);

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

    await expect(page.getByText('密码信息', { exact: true })).not.toBeVisible();
    await expect(page).toHaveURL('/users');

    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const oldLogin = await loginAccount(page, {
      account: user.account,
      password: oldPassword,
    });

    expect(oldLogin.response.ok()).toBeTruthy();
    expect(oldLogin.result.success).toBeFalsy();
    await expect(page.getByText('账号或密码错误')).toBeVisible();

    const newLogin = await loginAccount(page, {
      account: user.account,
      password: result.data.password,
    });

    expect(newLogin.response.ok()).toBeTruthy();
    expect(newLogin.result.success).toBeTruthy();
    if (!newLogin.result.success) throw new Error('重置后的密码登录失败');

    await registerSession(newLogin.result.data.token);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('token')))
      .toBe(JSON.stringify(newLogin.result.data.token));
  });

  test('Case 3.8：离开用户列表后清除未关闭的密码', async ({ page }) => {
    const roleName = `密码清理角色-${Date.now()}`;
    const name = `密码清理用户-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user } = await createUser(page, {
      name,
      roleUuids: [role.uuid],
    });

    await page.goto('/users');
    await page.getByRole('button', { name: '新增用户' }).click();
    await expect(page).toHaveURL('/users/create');
    await page.goBack();
    await expect(page).toHaveURL('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}/password`,
    );

    await row.getByRole('button', { name: '重置密码' }).click();
    await page.getByRole('button', { name: '确 定' }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<{ password: string }> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    await expect(page.getByText(result.data.password, { exact: true })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL('/users/create');
    await page.goBack();
    await expect(page).toHaveURL('/users');

    await expect(page.getByText('密码信息', { exact: true })).not.toBeVisible();
  });

  test('Case 3.12：按账号状态筛选用户并重置页码', async ({ page }) => {
    const roleName = `状态筛选角色-${Date.now()}`;
    const prefix = `状态筛选用户-${Date.now()}`;
    const disabledName = `${prefix}-禁用`;
    const enabledNames = Array.from({ length: 10 }, (_, index) => `${prefix}-启用-${index + 1}`);
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    for (const name of enabledNames) {
      await createUser(page, { name, roleUuids: [role.uuid] });
    }
    const { user: disabledUser } = await createUser(page, {
      name: disabledName,
      roleUuids: [role.uuid],
    });
    await setUserStatus(page, disabledUser.userId, 'disabled');

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(prefix);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');
    await expect(getPaginationTotal(page, 11)).toBeVisible();

    const pageResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());

      return (
        response.request().method() === 'GET' &&
        url.pathname === '/api/user' &&
        url.searchParams.get('pageNum') === '2'
      );
    });

    await page.getByTitle('2').click();
    await pageResponsePromise;

    const statusResponsePromise = page.waitForResponse((response) => {
      const url = new URL(response.url());

      return (
        response.request().method() === 'GET' &&
        url.pathname === '/api/user' &&
        url.searchParams.get('status') === 'disabled'
      );
    });

    await page.getByLabel('请选择账号状态').click();
    await page.getByText('禁用', { exact: true }).last().click();

    const statusResponse = await statusResponsePromise;

    expect(new URL(statusResponse.url()).searchParams.get('pageNum')).toBe('1');
    await expect(page.getByRole('row').filter({ hasText: disabledName })).toBeVisible();
    for (const name of enabledNames) {
      await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
    }
    await expect(getPaginationTotal(page, 1)).toBeVisible();
  });

  test('Case 3.13：禁用和启用用户后列表与详情状态同步更新', async ({ page }) => {
    const roleName = `用户启停角色-${Date.now()}`;
    const name = `用户启停账号-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user } = await createUser(page, { name, roleUuids: [role.uuid] });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });
    const disableResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}/status`,
    );

    await row.getByRole('button', { name: '禁用' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const disableResponse = await disableResponsePromise;
    const disableResult: API.Result<boolean> = await disableResponse.json();

    expect(disableResponse.ok()).toBeTruthy();
    expect(disableResult.success).toBeTruthy();
    expect(disableResponse.request().postDataJSON()).toEqual({ status: 'disabled' });
    await expect(page.getByText('用户禁用成功')).toBeVisible();
    await expect(row.getByText('禁用', { exact: true })).toBeVisible();
    await row.getByRole('button', { name: '详情' }).click();

    await expect(page).toHaveURL(`/users/detail?userId=${user.userId}`);
    await expect(page.getByRole('rowgroup').getByText('禁用', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '返回' }).click();

    await expect(page).toHaveURL('/users');
    await expect(row).toBeVisible();

    const enableResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}/status`,
    );

    await row.getByRole('button', { name: '启用' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const enableResponse = await enableResponsePromise;
    const enableResult: API.Result<boolean> = await enableResponse.json();

    expect(enableResponse.ok()).toBeTruthy();
    expect(enableResult.success).toBeTruthy();
    expect(enableResponse.request().postDataJSON()).toEqual({ status: 'enabled' });
    await expect(page.getByText('用户启用成功')).toBeVisible();
    await expect(row.getByText('启用', { exact: true })).toBeVisible();
    await row.getByRole('button', { name: '详情' }).click();

    await expect(page).toHaveURL(`/users/detail?userId=${user.userId}`);
    await expect(page.getByRole('rowgroup').getByText('启用', { exact: true })).toBeVisible();
  });

  test('Case 3.14：取消删除保留用户，确认删除后无法继续查询', async ({ page }) => {
    const roleName = `用户删除角色-${Date.now()}`;
    const name = `待删除用户-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user } = await createUser(page, { name, roleUuids: [role.uuid] });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });

    await row.getByRole('button', { name: '删除' }).click();
    await page.getByRole('button', { name: /取\s*消/ }).click();
    await expect(row).toBeVisible();
    expect((await getUser(page, name)).userId).toBe(user.userId);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}`,
    );

    await row.getByRole('button', { name: '删除' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    if (result.success) expect(result.data).toBeTruthy();
    await expect(page.getByText('用户删除成功')).toBeVisible();
    await expect(row).toHaveCount(0);

    const users = await getUsers(page, { keyword: name, pageNum: 1, pageSize: 10 });

    expect(users.list.some(({ userId }) => userId === user.userId)).toBeFalsy();
  });

  test('Case 3.15：用户列表分页后展示下一页数据', async ({ page }) => {
    const roleName = `用户分页角色-${Date.now()}`;
    const prefix = `用户分页数据-${Date.now()}`;
    const names = Array.from({ length: 11 }, (_, index) => `${prefix}-${index + 1}`);
    const role = await createRole(page, { name: roleName, permissionCodes: [] });

    for (const name of names) {
      await createUser(page, { name, roleUuids: [role.uuid] });
    }

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(prefix);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    await expect(getPaginationTotal(page, 11)).toBeVisible();
    await expect(page.locator('tbody').getByRole('row')).toHaveCount(10);

    await page.getByTitle('2').click();

    await expect(page.locator('tbody').getByRole('row')).toHaveCount(1);
    await expect(page.getByRole('row').filter({ hasText: names[0] })).toBeVisible();
    await expect(getPaginationTotal(page, 11)).toBeVisible();
  });

  test('Case 3.17：禁止当前登录用户禁用自己', async ({ page }) => {
    const roleName = `禁止自我禁用角色-${Date.now()}`;
    const name = `禁止自我禁用用户-${Date.now()}`;
    const role = await createRole(page, {
      name: roleName,
      permissionCodes: ['user:view', 'user:disable'],
    });
    const { user, password } = await createUser(page, {
      name,
      roleUuids: [role.uuid],
    });
    await loginSession(page, { account: user.account, password });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}/status`,
    );

    await row.getByRole('button', { name: '禁用' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeFalsy();
    if (!result.success) expect(result.errorMessage).toBe('不能禁用当前登录用户');
    await expect(page.getByText('不能禁用当前登录用户')).toBeVisible();
    await expect(row.getByText('启用', { exact: true })).toBeVisible();
    expect((await getUser(page, name)).status).toBe('enabled');
  });

  test('Case 3.18：禁止当前登录用户删除自己', async ({ page }) => {
    const roleName = `禁止自我删除角色-${Date.now()}`;
    const name = `禁止自我删除用户-${Date.now()}`;
    const role = await createRole(page, {
      name: roleName,
      permissionCodes: ['user:view', 'user:delete'],
    });
    const { user, password } = await createUser(page, {
      name,
      roleUuids: [role.uuid],
    });
    await loginSession(page, { account: user.account, password });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}`,
    );

    await row.getByRole('button', { name: '删除' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeFalsy();
    if (!result.success) expect(result.errorMessage).toBe('不能删除当前登录用户');
    await expect(page.getByText('不能删除当前登录用户')).toBeVisible();
    await expect(row).toBeVisible();
    expect((await getUser(page, name)).userId).toBe(user.userId);
  });
});
