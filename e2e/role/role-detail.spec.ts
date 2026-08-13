import { expect, test } from '../fixtures';
import { createRole, registerRole } from './data';

test.describe('角色详情', () => {
  test('Case 2.5：角色详情正确展示角色资料和完整权限对象', async ({ page }) => {
    const name = `详情角色-${Date.now()}`;
    const description = '展示完整角色资料和权限对象';
    const role = await createRole(page, {
      name,
      description,
      permissionCodes: ['user:view', 'role:view'],
    });

    await page.goto('/roles');
    await page.getByPlaceholder('请输入角色名称').fill(name);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === `/api/role/${role.uuid}`,
    );

    await page
      .getByRole('row')
      .filter({ hasText: name })
      .getByRole('button', { name: '详情' })
      .click();

    const response = await responsePromise;
    const result: API.SuccessResult<API.Role> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data.permissions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'user:view', name: '查看用户' }),
        expect.objectContaining({ code: 'role:view', name: '查看角色' }),
      ]),
    );
    await expect(page).toHaveURL(`/roles/detail?uuid=${role.uuid}`);
    await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
    await expect(page.getByText('查看用户 (user:view)', { exact: true })).toBeVisible();
    await expect(page.getByText('查看角色 (role:view)', { exact: true })).toBeVisible();
    await expect(page.getByText(String(result.data.userCount), { exact: true })).toBeVisible();
    await expect(page.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)).toBeVisible();
  });

  test('Case 2.7：列表和详情展示修改结果', async ({ page }) => {
    const name = `修改结果角色-${Date.now()}`;
    const modifiedName = `${name}-已修改`;
    const modifiedDescription = '列表和详情展示修改后的角色数据';
    const role = await createRole(page, { name, permissionCodes: [] });
    await registerRole(modifiedName);

    await page.goto(`/roles/modify?uuid=${role.uuid}`);
    await expect(page.getByLabel('角色名称')).toHaveValue(name);
    await page.getByLabel('角色名称').fill(modifiedName);
    await page.getByLabel('角色描述').fill(modifiedDescription);
    await page.getByLabel('权限标识').click();
    await page.getByText('查看角色 (role:view)', { exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /保\s*存/ }).click();
    await expect(page.getByText('角色修改成功')).toBeVisible();
    await expect(page).toHaveURL('/roles');

    await page.getByPlaceholder('请输入角色名称').fill(modifiedName);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const row = page.getByRole('row').filter({ hasText: modifiedName });

    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').nth(1)).toHaveText('1');
    await row.getByRole('button', { name: '详情' }).click();

    await expect(page).toHaveURL(`/roles/detail?uuid=${role.uuid}`);
    await expect(page.getByText(modifiedName, { exact: true })).toBeVisible();
    await expect(page.getByText(modifiedDescription, { exact: true })).toBeVisible();
    await expect(page.getByText('查看角色 (role:view)', { exact: true })).toBeVisible();
  });
});
