import type { APIRequestContext, Page } from '@playwright/test';
import { type CleanupRegistry, expect, test } from './fixtures';

const getProjectName = (action: string) => `E2E ${action} ${crypto.randomUUID()}`;

async function openHome(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /登\s*录/ }).click();
  await expect(page).toHaveURL('/home');
}

async function findProjectUuid(request: APIRequestContext, name: string) {
  const response = await request.get('/api/home', {
    params: { keyword: name, pageNum: 1, pageSize: 10 },
  });
  expect(response.ok()).toBeTruthy();

  const result = (await response.json()) as API.SuccessResult<API.PageResult<API.HomeData>>;

  return result.data.list.find((item) => item.name === name)?.uuid;
}

async function deleteProject(request: APIRequestContext, uuid: string) {
  const response = await request.delete(`/api/home/${uuid}`);
  if (response.ok() || response.status() === 404) return;

  throw new Error(`删除项目失败：${response.status()}`);
}

async function deleteProjectByName(request: APIRequestContext, name: string) {
  const uuid = await findProjectUuid(request, name);
  if (uuid) await deleteProject(request, uuid);
}

async function createProject(page: Page, cleanup: CleanupRegistry, data: API.HomeSetParams) {
  cleanup.add(`项目 ${data.name}`, (request) => deleteProjectByName(request, data.name));
  const response = await page.request.post('/api/home', { data });
  expect(response.ok()).toBeTruthy();
  const uuid = await findProjectUuid(page.request, data.name);
  expect(uuid).toBeTruthy();
  cleanup.add(`项目 ${uuid}`, (request) => deleteProject(request, uuid as string));

  return uuid as string;
}

test.describe('项目管理', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('根据关键词查询项目', async () => {
    await openHome(page);
    const search = page.getByPlaceholder('请输入项目名称或描述');
    await search.fill('用户中心');
    await page.getByRole('button', { name: /查\s*询/ }).click();

    await expect(page.getByRole('row', { name: /用户中心/ })).toBeVisible();
    await expect(page.getByRole('row', { name: /权限管理/ })).toHaveCount(0);
  });

  test('新增项目', async ({ cleanup }) => {
    const projectName = getProjectName('新增项目');
    cleanup.add(`项目 ${projectName}`, (request) => deleteProjectByName(request, projectName));

    await openHome(page);
    await page.getByRole('button', { name: /新增项目/ }).click();
    await expect(page).toHaveURL('/home/create');
    await page.getByLabel('项目名称').fill(projectName);
    await page.getByLabel('项目描述').fill('用于验证项目新增');
    await page.getByRole('button', { name: /保\s*存/ }).click();

    await expect(page).toHaveURL('/home');
    await expect(page.getByText('项目创建成功')).toBeVisible();
    await page.getByPlaceholder('请输入项目名称或描述').fill(projectName);
    await page.getByRole('button', { name: /查\s*询/ }).click();
    await expect(page.getByRole('row', { name: new RegExp(projectName) })).toBeVisible();
  });

  test('查看项目详情', async () => {
    await openHome(page);
    const search = page.getByPlaceholder('请输入项目名称或描述');
    await search.fill('用户中心');
    await page.getByRole('button', { name: /查\s*询/ }).click();
    const row = page.getByRole('row', { name: /用户中心/ });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: '详情' }).click();

    await expect(page).toHaveURL(/\/home\/detail\?uuid=/);
    await expect(page.getByRole('cell', { name: '用户中心', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '管理用户基础信息和账号状态' })).toBeVisible();
  });

  test('修改项目', async ({ cleanup }) => {
    const projectName = getProjectName('修改前项目');
    const modifiedName = getProjectName('修改后项目');
    const uuid = await createProject(page, cleanup, {
      name: projectName,
      description: '用于验证项目修改',
    });

    await openHome(page);
    await page.goto(`/home/modify?uuid=${uuid}`);
    const name = page.getByLabel('项目名称');
    await expect(name).toHaveValue(projectName);
    await name.fill(modifiedName);
    await page.getByRole('button', { name: /保\s*存/ }).click();

    await expect(page).toHaveURL('/home');
    await expect(page.getByText('项目修改成功')).toBeVisible();
    await page.getByPlaceholder('请输入项目名称或描述').fill(modifiedName);
    await page.getByRole('button', { name: /查\s*询/ }).click();
    await expect(page.getByRole('row', { name: new RegExp(modifiedName) })).toBeVisible();
  });

  test('删除项目', async ({ cleanup }) => {
    const projectName = getProjectName('删除项目');
    await createProject(page, cleanup, {
      name: projectName,
      description: '用于验证项目删除',
    });

    await openHome(page);
    const search = page.getByPlaceholder('请输入项目名称或描述');
    await search.fill(projectName);
    await page.getByRole('button', { name: /查\s*询/ }).click();
    const row = page.getByRole('row', { name: new RegExp(projectName) });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: '删除' }).click();
    await page.getByRole('button', { name: /确\s*定/ }).click();

    await expect(page.getByText('项目删除成功')).toBeVisible();
    await expect(row).toHaveCount(0);
  });
});
