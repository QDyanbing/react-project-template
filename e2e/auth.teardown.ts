import { expect, test as teardown } from '@playwright/test';
import { getSessions } from './helpers/session';

teardown('清理认证会话', async ({ request }) => {
  const tokens = await getSessions();

  for (const token of tokens) {
    const response = await request.post('/api/logout', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result: API.SuccessResult<boolean> = await response.json();

    expect(response.ok()).toBeTruthy();
    expect(result.success).toBeTruthy();
    expect(result.data).toBeTruthy();
  }
});
