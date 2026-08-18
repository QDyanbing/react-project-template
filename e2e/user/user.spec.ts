import { expect, test } from '../fixtures';
import { getPaginationTotal } from '../helpers/pagination';
import { createRole } from '../role/data';
import { createUser } from './data';

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

  test('Case 3.7：重置用户密码后展示并复制新密码', async ({ page }) => {
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
});
