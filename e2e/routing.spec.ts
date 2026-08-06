import { expect, test } from './fixtures';

test('访问无权限页面后可以返回首页', async ({ page }) => {
  await page.goto('/403');

  await expect(page.getByText('暂无访问权限')).toBeVisible();
  await page.getByRole('button', { name: /返回首页/ }).click();

  await expect(page).toHaveURL('/home');
});

test('访问不存在的地址时进入 404 页面', async ({ page }) => {
  await page.goto('/not-exist');

  await expect(page).toHaveURL('/404');
  await expect(page.getByText('页面不存在')).toBeVisible();
});
