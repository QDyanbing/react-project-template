import { expect, test } from './fixtures';
import { loginSession } from './helpers/session';
import { createRole } from './role/data';
import { createUser } from './user/data';

test.describe('菜单、按钮和路由权限', () => {
  test('Case 5.7：只有角色查看权限时隐藏无权菜单并禁用写操作', async ({ page }) => {
    const roleName = `角色只读权限-${Date.now()}`;
    const targetName = `角色权限目标-${Date.now()}`;
    const userName = `角色只读用户-${Date.now()}`;
    const role = await createRole(page, {
      name: roleName,
      permissionCodes: ['role:view'],
    });
    const targetRole = await createRole(page, { name: targetName, permissionCodes: [] });
    const { user, password } = await createUser(page, {
      name: userName,
      roleUuids: [role.uuid],
    });
    await loginSession(page, { account: user.account, password });

    await expect(page).toHaveURL('/roles');
    await expect(page.getByRole('menuitem', { name: '角色管理' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: '用户管理' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '新增角色' })).toBeDisabled();

    await page.getByPlaceholder('请输入角色名称').fill(targetName);
    await page.getByPlaceholder('请输入角色名称').press('Enter');

    const row = page.getByRole('row').filter({ hasText: targetName });

    await expect(row.getByRole('button', { name: '详情' })).toBeEnabled();
    await expect(row.getByRole('button', { name: '编辑' })).toBeDisabled();
    await expect(row.getByRole('button', { name: '删除' })).toBeDisabled();

    await page.goto('/roles/create');
    await expect(page).toHaveURL('/403');

    await page.goto(`/roles/modify?uuid=${targetRole.uuid}`);
    await expect(page).toHaveURL('/403');
  });

  test('Case 5.8：只有用户查看权限时限制角色首页和用户写操作', async ({ page }) => {
    const roleName = `用户只读权限-${Date.now()}`;
    const userName = `用户只读账号-${Date.now()}`;
    const role = await createRole(page, {
      name: roleName,
      permissionCodes: ['user:view'],
    });
    const { user, password } = await createUser(page, {
      name: userName,
      roleUuids: [role.uuid],
    });
    await loginSession(page, { account: user.account, password });

    await expect(page).toHaveURL('/403');

    await page.goto('/users');
    await expect(page.getByRole('menuitem', { name: '角色管理' })).toHaveCount(0);
    await expect(page.getByRole('menuitem', { name: '用户管理' })).toBeVisible();
    await expect(page.getByRole('button', { name: '新增用户' })).toBeDisabled();

    await page.getByPlaceholder('请输入用户账号或姓名').fill(userName);
    await page.getByPlaceholder('请输入用户账号或姓名').press('Enter');

    const row = page.getByRole('row').filter({ hasText: userName });

    await expect(row.getByRole('button', { name: '详情' })).toBeEnabled();
    await expect(row.getByRole('button', { name: '编辑' })).toBeDisabled();
    await expect(row.getByRole('button', { name: '禁用' })).toBeDisabled();
    await expect(row.getByRole('button', { name: '重置密码' })).toBeDisabled();
    await expect(row.getByRole('button', { name: '删除' })).toBeDisabled();

    await page.goto('/users/create');
    await expect(page).toHaveURL('/403');
  });

  test('Case 5.9：角色修改页面同时要求查看和修改权限', async ({ page }) => {
    const modifyRoleName = `角色修改权限-${Date.now()}`;
    const modifyUserName = `仅角色修改用户-${Date.now()}`;
    const fullRoleName = `角色查看修改权限-${Date.now()}`;
    const fullUserName = `角色查看修改用户-${Date.now()}`;
    const targetName = `角色修改权限目标-${Date.now()}`;
    const modifyRole = await createRole(page, {
      name: modifyRoleName,
      permissionCodes: ['role:modify'],
    });
    const fullRole = await createRole(page, {
      name: fullRoleName,
      permissionCodes: ['role:view', 'role:modify'],
    });
    const targetRole = await createRole(page, { name: targetName, permissionCodes: [] });
    const { user: modifyUser, password: modifyPassword } = await createUser(page, {
      name: modifyUserName,
      roleUuids: [modifyRole.uuid],
    });
    const { user: fullUser, password: fullPassword } = await createUser(page, {
      name: fullUserName,
      roleUuids: [fullRole.uuid],
    });

    await loginSession(page, { account: modifyUser.account, password: modifyPassword });
    await page.goto(`/roles/modify?uuid=${targetRole.uuid}`);
    await expect(page).toHaveURL('/403');

    await loginSession(page, { account: fullUser.account, password: fullPassword });
    await page.goto(`/roles/modify?uuid=${targetRole.uuid}`);

    await expect(page).toHaveURL(`/roles/modify?uuid=${targetRole.uuid}`);
    await expect(page.getByLabel('角色名称')).toHaveValue(targetName);
  });
});
