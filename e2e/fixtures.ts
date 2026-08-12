import { test as base, expect, type BrowserContextOptions, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

type WorkerFixtures = {
  sharedPage: Page | null;
};

type StorageState = Exclude<BrowserContextOptions['storageState'], string | undefined>;

const getStorageState = async (storageState: BrowserContextOptions['storageState']) => {
  if (typeof storageState !== 'string') return storageState;

  return JSON.parse(await readFile(storageState, 'utf8')) as StorageState;
};

const resetPage = async (page: Page, storageState: BrowserContextOptions['storageState']) => {
  const context = page.context();
  const state = await getStorageState(storageState);

  await context.clearCookies();
  await page.goto('/login');

  const origin = new URL(page.url()).origin;
  const localStorageData =
    state?.origins.find((item) => item.origin === origin)?.localStorage ?? [];

  await page.evaluate((data) => {
    localStorage.clear();
    sessionStorage.clear();
    data.forEach(({ name, value }) => localStorage.setItem(name, value));
  }, localStorageData);

  if (state && state.cookies.length > 0) await context.addCookies(state.cookies);
};

export const test = base.extend<object, WorkerFixtures>({
  sharedPage: [
    async ({ browser }, use, workerInfo) => {
      if (workerInfo.project.use.headless !== false) {
        await use(null);
        return;
      }

      const { baseURL, locale, viewport } = workerInfo.project.use;
      const context = await browser.newContext({
        baseURL,
        locale,
        viewport,
      });
      const page = await context.newPage();

      await use(page);
      await context.close();
    },
    { scope: 'worker' },
  ],
  page: async ({ context, sharedPage, storageState }, use) => {
    if (sharedPage) {
      await resetPage(sharedPage, storageState);
      await use(sharedPage);
      return;
    }

    const page = await context.newPage();

    await use(page);
    await page.close();
  },
});

export { expect };
