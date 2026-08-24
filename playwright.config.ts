import { defineConfig } from '@playwright/test';

const E2E_PORT = Number(process.env.E2E_PORT ?? 8001);
if (!Number.isInteger(E2E_PORT) || E2E_PORT < 1 || E2E_PORT > 65535) {
  throw new Error('E2E_PORT must be an integer between 1 and 65535.');
}

const BASE_URL = `http://127.0.0.1:${E2E_PORT}`;

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    locale: 'zh-CN',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
  webServer: {
    command: `ut run dev:mock --host 127.0.0.1 --port ${E2E_PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /auth\.teardown\.ts/,
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      testIgnore: /auth\.(setup|teardown)\.ts/,
      use: {
        browserName: 'chromium',
        storageState: 'playwright/.auth/admin.json',
      },
    },
  ],
});
