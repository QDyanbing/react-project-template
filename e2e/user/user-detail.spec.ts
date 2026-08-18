import { expect, test } from '../fixtures';
import { createRole } from '../role/data';
import { createUser } from './data';

test.describe('用户详情', () => {
  test('Case 3.6：用户详情返回完整角色对象', async ({ page }) => {
    const roleName = `用户详情角色-${Date.now()}`;
    const roleDescription = '用于验证用户详情中的完整角色对象';
    const name = `详情用户-${Date.now()}`;
    const role = await createRole(page, {
      name: roleName,
      description: roleDescription,
      permissionCodes: ['user:view'],
    });
    const { user } = await createUser(page, {
      name,
      email: 'detail-user@example.com',
      phone: '13800000003',
      roleUuids: [role.uuid],
    });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === `/api/user/${user.userId}`,
    );

    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '详情' })
      .click();

    const response = await responsePromise;
    const result: API.SuccessResult<API.User> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.roles).toEqual([{ ...role, userCount: 1 }]);
    await expect(page).toHaveURL(`/users/detail?userId=${user.userId}`);
    await expect(page.getByText(user.account, { exact: true })).toBeVisible();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText(roleName, { exact: true })).toBeVisible();
    await expect(page.getByText('detail-user@example.com', { exact: true })).toBeVisible();
    await expect(page.getByText('13800000003', { exact: true })).toBeVisible();
  });

  test('Case 3.16：用户详情可以返回列表并进入编辑页面', async ({ page }) => {
    const roleName = `详情导航角色-${Date.now()}`;
    const name = `详情导航用户-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user } = await createUser(page, { name, roleUuids: [role.uuid] });

    await page.goto('/users');
    await page.getByPlaceholder('请输入用户账号或姓名').fill(name);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');
    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '详情' })
      .click();

    await expect(page).toHaveURL(`/users/detail?userId=${user.userId}`);
    await page.getByRole('button', { name: '返回' }).click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();

    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '详情' })
      .click();
    await page.getByRole('button', { name: '编辑用户' }).click();

    await expect(page).toHaveURL(`/users/modify?userId=${user.userId}`);
    await expect(page.getByLabel('用户姓名')).toHaveValue(name);
  });
});
