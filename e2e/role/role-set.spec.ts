import { errors } from '@playwright/test';
import { expect, test } from '../fixtures';
import { createRole, registerRole } from './data';

test.describe('角色新增', () => {
  test('Case 2.1：角色名称为空时阻止提交', async ({ page }) => {
    const permissionResponsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/permission/options',
    );

    await page.goto('/roles/create');
    await permissionResponsePromise;
    await page.getByLabel('权限标识').click();
    await page.getByText('查看用户 (user:view)', { exact: true }).click();
    await page.keyboard.press('Escape');

    const createRequestResultPromise = page
      .waitForRequest(
        (request) => request.method() === 'POST' && new URL(request.url()).pathname === '/api/role',
        { timeout: 500 },
      )
      .catch((error: unknown) => error);

    await page.getByRole('button', { name: /保\s*存/ }).click();

    await expect(page.getByText('此项为必填项')).toBeVisible();
    await expect(page).toHaveURL('/roles/create');

    const createRequestResult = await createRequestResultPromise;

    expect(createRequestResult).toBeInstanceOf(errors.TimeoutError);
  });

  test('Case 2.2：通过真实权限接口加载权限选项', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/permission/options',
    );

    await page.goto('/roles/create');

    const response = await responsePromise;
    const result: API.SuccessResult<API.Permission[]> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.length).toBeGreaterThan(0);

    await page.getByLabel('权限标识').click();

    await expect(page.getByText('查看用户 (user:view)', { exact: true })).toBeVisible();
    await expect(page.getByText('查看角色 (role:view)', { exact: true })).toBeVisible();
  });

  test('Case 2.3：新增角色并配置权限成功', async ({ page }) => {
    const name = `测试角色-${Date.now()}`;
    const description = '通过浏览器功能测试创建';

    await registerRole(name);
    await page.goto('/roles/create');
    await page.getByLabel('角色名称').fill(name);
    await page.getByLabel('角色描述').fill(description);
    await page.getByLabel('权限标识').click();
    await page.getByText('查看用户 (user:view)', { exact: true }).click();
    await page.getByText('查看角色 (role:view)', { exact: true }).click();
    await page.keyboard.press('Escape');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/role',
    );

    await page.getByRole('button', { name: /保\s*存/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data).toBeTruthy();
    expect(response.request().postDataJSON()).toEqual({
      name,
      description,
      permissionCodes: ['user:view', 'role:view'],
    });
    await expect(page.getByText('角色创建成功')).toBeVisible();
    await expect(page).toHaveURL('/roles');
  });

  test('Case 2.18：角色名称重复时展示接口错误并保留表单', async ({ page }) => {
    const name = `重复角色-${Date.now()}`;
    await createRole(page, { name, permissionCodes: [] });

    await page.goto('/roles/create');
    await page.getByLabel('角色名称').fill(name);
    await page.getByLabel('权限标识').click();
    await page.getByText('查看角色 (role:view)', { exact: true }).click();
    await page.keyboard.press('Escape');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/role',
    );

    await page.getByRole('button', { name: /保\s*存/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeFalsy();
    if (!result.success) expect(result.errorMessage).toBe('角色名称已存在');
    await expect(page.getByText('角色名称已存在')).toBeVisible();
    await expect(page.getByLabel('角色名称')).toHaveValue(name);
    await expect(page).toHaveURL('/roles/create');
  });
});

test.describe('角色修改', () => {
  test('Case 2.6：修改角色名称、描述和权限成功', async ({ page }) => {
    const name = `待修改角色-${Date.now()}`;
    const modifiedName = `${name}-已修改`;
    const modifiedDescription = '通过浏览器功能测试修改';
    const role = await createRole(page, {
      name,
      description: '修改前描述',
      permissionCodes: [],
    });
    await registerRole(modifiedName);

    await page.goto(`/roles/modify?uuid=${role.uuid}`);
    await expect(page.getByLabel('角色名称')).toHaveValue(name);
    await page.getByLabel('角色名称').fill(modifiedName);
    await page.getByLabel('角色描述').fill(modifiedDescription);
    await page.getByLabel('权限标识').click();
    await page.getByText('查看角色 (role:view)', { exact: true }).click();
    await page.keyboard.press('Escape');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        new URL(response.url()).pathname === `/api/role/${role.uuid}`,
    );

    await page.getByRole('button', { name: /保\s*存/ }).click();

    const response = await responsePromise;
    const result: API.SuccessResult<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data).toBeTruthy();
    await expect(page.getByText('角色修改成功')).toBeVisible();
    await expect(page).toHaveURL('/roles');

    await page.goto(`/roles/modify?uuid=${role.uuid}`);
    await expect(page.getByLabel('角色名称')).toHaveValue(modifiedName);
    await expect(page.getByLabel('角色描述')).toHaveValue(modifiedDescription);
    await expect(page.getByText('查看角色 (role:view)', { exact: true })).toBeVisible();
  });
});
