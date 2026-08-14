import { test as teardown } from '@playwright/test';
import { clearSessions, getSessions } from './helpers/session';
import { clearRoles } from './role/data';
import { clearUsers } from './user/data';

teardown('清理测试数据和认证会话', async ({ request }) => {
  const tokens = await getSessions();
  const [token] = tokens;
  const errors: unknown[] = [];

  if (token) {
    try {
      await clearUsers(request, token);
    } catch (error) {
      errors.push(error);
    }

    try {
      await clearRoles(request, token);
    } catch (error) {
      errors.push(error);
    }
  } else {
    errors.push(new Error('未找到用于清理测试数据的管理员会话'));
  }

  try {
    await clearSessions(request);
  } catch (error) {
    errors.push(error);
  }

  if (errors.length > 0) throw new AggregateError(errors, '测试数据或认证会话清理失败');
});
