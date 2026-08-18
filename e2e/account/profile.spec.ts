import { errors } from '@playwright/test';
import { expect, test } from '../fixtures';
import { loginSession } from '../helpers/session';
import { createRole } from '../role/data';
import { createUser, registerUser } from '../user/data';

test.describe('个人中心', () => {
  test('Case 4.1：展示当前账号资料、角色和权限', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByText('账号信息', { exact: true })).toBeVisible();
    await expect(page.getByText('用户账号', { exact: true })).toBeVisible();
    await expect(page.getByText('admin', { exact: true })).toBeVisible();
    await expect(page.getByText('admin@example.com', { exact: true })).toBeVisible();
    await expect(page.getByText('13800000000', { exact: true })).toBeVisible();
    await expect(page.getByText('超级管理员', { exact: true })).toBeVisible();
    await expect(page.getByText('全部权限 (*)', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '修改账号信息' })).toBeVisible();
  });

  test('Case 4.2：修改账号信息时回显资料并执行表单校验', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: '修改账号信息' }).click();

    await expect(page).toHaveURL('/profile/modify');
    await expect(page.getByLabel('用户姓名')).toHaveValue('管理员');
    await expect(page.getByLabel('邮箱')).toHaveValue('admin@example.com');
    await expect(page.getByLabel('手机号')).toHaveValue('13800000000');

    await page.getByLabel('用户姓名').clear();
    await page.getByLabel('邮箱').fill('invalid-email');

    const modifyRequestResultPromise = page
      .waitForRequest(
        (request) =>
          request.method() === 'PUT' && new URL(request.url()).pathname === '/api/account/profile',
        { timeout: 500 },
      )
      .catch((error: unknown) => error);

    await page.getByRole('button', { name: /保\s*存/ }).click();

    await expect(page.getByText('此项为必填项')).toBeVisible();
    await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
    await expect(page).toHaveURL('/profile/modify');
    expect(await modifyRequestResultPromise).toBeInstanceOf(errors.TimeoutError);
  });

  test('Case 4.3：修改当前账号资料后个人中心展示最新内容', async ({ page }) => {
    const roleName = `资料修改角色-${Date.now()}`;
    const name = `资料修改用户-${Date.now()}`;
    const modifiedName = `${name}-已修改`;
    const modifiedEmail = 'modified-profile@example.com';
    const modifiedPhone = '13900000001';
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    const { user, password } = await createUser(page, {
      name,
      email: 'profile@example.com',
      phone: '13800000001',
      roleUuids: [role.uuid],
    });
    await registerUser(modifiedName);
    await loginSession(page, { account: user.account, password });

    await page.goto('/profile');
    await page.getByRole('button', { name: '修改账号信息' }).click();
    await expect(page.getByLabel('用户姓名')).toHaveValue(name);
    await expect(page.getByLabel('邮箱')).toHaveValue('profile@example.com');
    await expect(page.getByLabel('手机号')).toHaveValue('13800000001');
    await page.getByLabel('用户姓名').fill(modifiedName);
    await page.getByLabel('邮箱').fill(modifiedEmail);
    await page.getByLabel('手机号').fill(modifiedPhone);

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === '/api/account/profile',
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
    });
    await expect(page.getByText('账号信息修改成功')).toBeVisible();
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('rowgroup').getByText(modifiedName, { exact: true })).toBeVisible();
    await expect(page.getByText(modifiedEmail, { exact: true })).toBeVisible();
    await expect(page.getByText(modifiedPhone, { exact: true })).toBeVisible();
  });
});
