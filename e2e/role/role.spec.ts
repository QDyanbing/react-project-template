import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';
import { getPaginationTotal } from '../helpers/pagination';
import { createUser } from '../user/data';
import { createRole, getRoles, registerRole } from './data';

const openRoleList = async (page: Page) => {
  await page.goto('/roles');
  await expect(page.getByPlaceholder('请输入角色名称')).toBeVisible();
};

const createRoles = async (page: Page, prefix: string) => {
  const names = Array.from({ length: 11 }, (_, index) => `${prefix}-${index + 1}`);

  for (const name of names) {
    await createRole(page, { name, permissionCodes: ['role:view'] });
  }

  return names;
};

test.describe('角色新增结果', () => {
  test('Case 2.4：通过查询确认角色创建成功', async ({ page }) => {
    const name = `列表确认角色-${Date.now()}`;

    await registerRole(name);
    await page.goto('/roles/create');
    await page.getByLabel('角色名称').fill(name);
    await page.getByLabel('权限标识').click();
    await page.getByText('查看角色 (role:view)', { exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /保\s*存/ }).click();
    await expect(page.getByText('角色创建成功')).toBeVisible();

    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });

    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').nth(1)).toHaveText('1');
    await expect(row.getByRole('cell').nth(2)).toHaveText('0');
  });
});

test.describe('角色删除', () => {
  test('Case 2.8：点击删除后展示确认框', async ({ page }) => {
    const name = `删除确认角色-${Date.now()}`;

    await createRole(page, { name, permissionCodes: [] });
    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');
    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '删除' })
      .click();

    await expect(page.getByText('确定删除该角色吗？')).toBeVisible();
    await expect(page.getByRole('button', { name: /确\s*定/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /取\s*消/ })).toBeVisible();
  });

  test('Case 2.9：取消删除时角色保持存在', async ({ page }) => {
    const name = `取消删除角色-${Date.now()}`;

    await createRole(page, { name, permissionCodes: [] });
    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const row = page.getByRole('row').filter({ hasText: name });

    await row.getByRole('button', { name: '删除' }).click();
    await page.getByRole('button', { name: /取\s*消/ }).click();

    await expect(page.getByText('确定删除该角色吗？')).toBeHidden();
    await expect(row).toBeVisible();

    const result = await getRoles(page, { keyword: name, pageNum: 1, pageSize: 10 });

    expect(result.list.some((role) => role.name === name)).toBeTruthy();
  });

  test('Case 2.10：删除未绑定用户的角色成功', async ({ page }) => {
    const name = `删除成功角色-${Date.now()}`;
    const role = await createRole(page, { name, permissionCodes: [] });

    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        new URL(response.url()).pathname === `/api/role/${role.uuid}`,
    );

    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '删除' })
      .click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    if (result.success) expect(result.data).toBeTruthy();
    await expect(page.getByText('角色删除成功')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
  });

  test('Case 2.11：无法继续查询已删除角色', async ({ page }) => {
    const name = `删除后查询角色-${Date.now()}`;
    await createRole(page, { name, permissionCodes: [] });

    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');
    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '删除' })
      .click();
    await page.getByRole('button', { name: /确\s*定/ }).click();
    await expect(page.getByText('角色删除成功')).toBeVisible();

    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0);
    await expect(getPaginationTotal(page, 0)).toBeVisible();
  });

  test('Case 2.17：角色仍被用户使用时禁止删除', async ({ page }) => {
    const roleName = `使用中角色-${Date.now()}`;
    const userName = `角色关联用户-${Date.now()}`;
    const role = await createRole(page, { name: roleName, permissionCodes: [] });
    await createUser(page, { name: userName, roleUuids: [role.uuid] });

    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(roleName);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const row = page.getByRole('row').filter({ hasText: roleName });
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        new URL(response.url()).pathname === `/api/role/${role.uuid}`,
    );

    await row.getByRole('button', { name: '删除' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    const response = await responsePromise;
    const result: API.Result<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeFalsy();
    if (!result.success) expect(result.errorMessage).toBe('角色仍被用户使用，无法删除');
    await expect(page.getByText('角色仍被用户使用，无法删除')).toBeVisible();
    await expect(row).toBeVisible();

    const roles = await getRoles(page, { keyword: roleName, pageNum: 1, pageSize: 10 });

    expect(roles.list.some(({ uuid }) => uuid === role.uuid)).toBeTruthy();
  });
});

test.describe('角色列表', () => {
  test('Case 2.12：创建一组角色分页测试数据', async ({ page }) => {
    const prefix = `分页数据-${Date.now()}`;

    await createRoles(page, prefix);
    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(prefix);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    await expect(getPaginationTotal(page, 11)).toBeVisible();
    await expect(page.locator('tbody').getByRole('row')).toHaveCount(10);
  });

  test('Case 2.13：默认列表正确展示角色数据', async ({ page }) => {
    const name = `默认列表角色-${Date.now()}`;

    await createRole(page, { name, permissionCodes: ['role:view'] });
    await openRoleList(page);

    await expect(page.getByRole('columnheader', { name: '角色名称' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '权限数量' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '用户数量' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '操作' })).toBeVisible();

    const row = page.getByRole('row').filter({ hasText: name });

    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').nth(1)).toHaveText('1');
    await expect(row.getByRole('cell').nth(2)).toHaveText('0');
    await expect(row.getByRole('button', { name: '详情' })).toBeVisible();
    await expect(row.getByRole('button', { name: '编辑' })).toBeVisible();
    await expect(row.getByRole('button', { name: '删除' })).toBeVisible();
  });

  test('Case 2.14：按角色名称查询', async ({ page }) => {
    const prefix = `名称查询-${Date.now()}`;
    const matchedName = `${prefix}-目标`;
    const unmatchedName = `其他角色-${Date.now()}`;

    await createRole(page, { name: matchedName, permissionCodes: [] });
    await createRole(page, { name: unmatchedName, permissionCodes: [] });
    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(prefix);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    await expect(page.getByRole('row').filter({ hasText: matchedName })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: unmatchedName })).toHaveCount(0);
    await expect(getPaginationTotal(page, 1)).toBeVisible();
  });

  test('Case 2.15：清空查询条件后恢复完整列表', async ({ page }) => {
    const name = `清空查询角色-${Date.now()}`;
    const otherName = `清空查询对照-${Date.now()}`;

    await createRole(page, { name, permissionCodes: [] });
    await createRole(page, { name: otherName, permissionCodes: [] });
    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');
    await expect(getPaginationTotal(page, 1)).toBeVisible();

    await page.getByPlaceholder('请输入角色名称').clear();
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    await expect(getPaginationTotal(page, 1)).toBeHidden();
    await expect(page.getByRole('row').filter({ hasText: name })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: otherName })).toBeVisible();
  });

  test('Case 2.16：切换页码后展示对应角色数据', async ({ page }) => {
    const prefix = `分页切换-${Date.now()}`;

    const names = await createRoles(page, prefix);
    await openRoleList(page);
    await page.getByPlaceholder('请输入角色名称').fill(prefix);
    await page.getByPlaceholder('请输入角色名称').press('Enter');
    await expect(page.locator('tbody').getByRole('row')).toHaveCount(10);

    await page.getByTitle('2').click();

    await expect(page.locator('tbody').getByRole('row')).toHaveCount(1);
    await expect(page.getByRole('row').filter({ hasText: names[0] })).toBeVisible();
    await expect(getPaginationTotal(page, 11)).toBeVisible();
  });
});
