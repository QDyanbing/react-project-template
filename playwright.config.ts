import { defineConfig } from '@playwright/test';

const BASE_URL = 'http://localhost:8000';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: BASE_URL,
    locale: 'zh-CN',
    trace: 'retain-on-failure',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
    },
  },
  webServer: {
    command: 'ut run dev:mock',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
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
