import { errors, type Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { registerRole } from './helpers/data';

const getAuthorization = async (page: Page) => {
  const storageState = await page.context().storageState();
  const tokenValue = storageState.origins
    .flatMap((origin) => origin.localStorage)
    .find(({ name }) => name === 'token')?.value;
  const token = JSON.parse(tokenValue ?? 'null');

  expect(token).toBeTruthy();

  return { Authorization: `Bearer ${token}` };
};

const getRole = async (page: Page, name: string) => {
  const headers = await getAuthorization(page);
  const searchResponse = await page.request.get('/api/role', {
    headers,
    params: { keyword: name, pageNum: 1, pageSize: 10 },
  });
  const searchResult: API.SuccessResult<API.PageResult<API.Role>> = await searchResponse.json();

  expect(searchResponse.ok()).toBeTruthy();
  expect(searchResult.success).toBeTruthy();

  const role = searchResult.data.list.find((item) => item.name === name);

  if (!role) throw new Error(`未找到测试角色：${name}`);

  return role;
};

const createRole = async (page: Page, data: API.RoleSetParams) => {
  await registerRole(data.name);

  const headers = await getAuthorization(page);
  const createResponse = await page.request.post('/api/role', { headers, data });
  const createResult: API.SuccessResult<boolean> = await createResponse.json();

  expect(createResponse.ok()).toBeTruthy();
  expect(createResult.success).toBeTruthy();
  expect(createResult.data).toBeTruthy();

  return getRole(page, data.name);
};

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
    await expect(page).toHaveURL('/home');
  });
});

test.describe('角色修改', () => {
  test('Case 2.5：角色详情正确展示角色资料和完整权限对象', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        new URL(response.url()).pathname === '/api/role/10000000-0000-4000-8000-000000000002',
    );

    await page.goto('/roles/modify?uuid=10000000-0000-4000-8000-000000000002');

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
    await expect(page.getByLabel('角色名称')).toHaveValue('运营人员');
    await expect(page.getByLabel('角色描述')).toHaveValue('负责用户和角色的日常查看与维护');
    await expect(page.getByText('查看用户 (user:view)', { exact: true })).toBeVisible();
    await expect(page.getByText('查看角色 (role:view)', { exact: true })).toBeVisible();
  });

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
    await expect(page).toHaveURL('/home');

    await page.goto(`/roles/modify?uuid=${role.uuid}`);
    await expect(page.getByLabel('角色名称')).toHaveValue(modifiedName);
    await expect(page.getByLabel('角色描述')).toHaveValue(modifiedDescription);
    await expect(page.getByText('查看角色 (role:view)', { exact: true })).toBeVisible();
  });
});
