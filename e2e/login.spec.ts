import { expect, test } from '@playwright/test';

test('使用演示账号登录后进入首页', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /登\s*录/ }).click();

  await expect(page).toHaveURL('/home');
  await expect(page.getByText('项目管理').first()).toBeVisible();
});
