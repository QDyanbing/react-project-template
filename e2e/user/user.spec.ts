import { expect, test } from '../fixtures';
import { createRole } from '../role/data';
import { createUser } from './data';

test.describe('用户新增结果', () => {
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
    await expect(page.getByText('共 1 名用户')).toBeVisible();
  });
});
