import type { Page } from '@playwright/test';

export const getPaginationTotal = (page: Page, total: number) =>
  page.getByText(`共 ${total} 条`, { exact: true });
