import { expect, test } from './fixtures';

test('使用演示账号登录后进入首页', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /登\s*录/ }).click();

  await expect(page).toHaveURL('/home');
  await expect(page.getByText('项目管理').first()).toBeVisible();
});

test('账号或密码错误时停留在登录页并展示提示', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('密码').fill('错误密码');
  await page.getByRole('button', { name: /登\s*录/ }).click();

  await expect(page).toHaveURL('/login');
  await expect(page.getByText('账号或密码错误')).toBeVisible();
});

test('登录成功后返回 URL 指定的来源页面', async ({ page }) => {
  await page.goto('/login?redirect=%2F403');
  await page.getByRole('button', { name: /登\s*录/ }).click();

  await expect(page).toHaveURL('/403');
  await expect(page.getByText('暂无访问权限')).toBeVisible();
});
