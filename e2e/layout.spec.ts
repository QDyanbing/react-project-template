import { expect, test } from './fixtures';

test.describe('公共布局', () => {
  test('Case 5.1：点击品牌标识返回首页', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'React 项目模板' }).click();

    await expect(page).toHaveURL('/roles');
    await expect(page.getByPlaceholder('请输入角色名称')).toBeVisible();
  });

  test('Case 5.2：账号菜单可以进入个人中心和修改密码页面', async ({ page }) => {
    await page.goto('/roles');
    await page.getByRole('button', { name: '管理员' }).click();
    await page.getByRole('menuitem', { name: '个人中心' }).click();

    await expect(page).toHaveURL('/profile');
    await expect(page.getByText('账号信息', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: '管理员' }).click();
    await page.getByRole('menuitem', { name: '修改密码' }).click();

    await expect(page).toHaveURL('/profile/password');
    await expect(page.getByRole('heading', { name: '修改密码' })).toBeVisible();
  });

  test('Case 5.3：语言切换同步更新页面并在刷新后保持', async ({ page }) => {
    await page.goto('/roles');
    await page.getByRole('button', { name: '切换语言' }).click();
    await page.getByText('English', { exact: true }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'React Project Template' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Roles' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create role' })).toBeVisible();

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US');
    await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Roles' })).toBeVisible();
  });

  test('Case 5.4：侧边菜单收起状态在刷新后保持', async ({ page }) => {
    await page.goto('/roles');
    await page.getByRole('button', { name: '收起菜单' }).click();

    await expect(page.getByRole('button', { name: '展开菜单' })).toBeVisible();

    await page.reload();

    await expect(page.getByRole('button', { name: '展开菜单' })).toBeVisible();
    await page.getByRole('button', { name: '展开菜单' }).click();
    await expect(page.getByRole('button', { name: '收起菜单' })).toBeVisible();
  });
});

test.describe('基础状态页面', () => {
  test('Case 5.5：未知地址进入 404 并可返回首页', async ({ page }) => {
    await page.goto(`/unknown-${Date.now()}`);

    await expect(page).toHaveURL('/404');
    await expect(page.getByText('页面不存在', { exact: true })).toBeVisible();
    await expect(page.getByText('访问地址可能有误，或页面已经被移除。')).toBeVisible();

    await page.getByRole('button', { name: '返回首页' }).click();

    await expect(page).toHaveURL('/roles');
  });

  test('Case 5.6：403 页面说明权限不足并可返回首页', async ({ page }) => {
    await page.goto('/403');

    await expect(page.getByText('暂无访问权限', { exact: true })).toBeVisible();
    await expect(page.getByText('当前账号无权访问该页面，请联系管理员开通权限。')).toBeVisible();

    await page.getByRole('button', { name: '返回首页' }).click();

    await expect(page).toHaveURL('/roles');
  });

  test('Case 5.11：500 页面说明异常并可返回首页', async ({ page }) => {
    await page.goto('/500');

    await expect(page.getByText('页面出现异常', { exact: true })).toBeVisible();
    await expect(page.getByText('页面暂时无法正常显示，请返回首页后重试。')).toBeVisible();
    await page.getByRole('button', { name: '返回首页' }).click();

    await expect(page).toHaveURL('/roles');
  });
});
