import { randomInt } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import type { MockContext, MockRoute } from '../plugins/mock';
import { getUserData, roles, users } from './database';
import { authorize, createError, createSuccess } from './utils';

const createNotFound = () => createError('用户不存在', 404);

const USER_ID_VERSION = '01';
const USER_ID_SYSTEM = '01';
const USER_SOURCE_CONSOLE = '01';
const USER_TYPE_PERSON = '01';

const createUserIdChecksum = (value: string) => {
  const remainder = `${value}00`.split('').reduce((result, digit) => {
    return (result * 10 + Number(digit)) % 97;
  }, 0);

  return String(98 - remainder).padStart(2, '0');
};

const createUserId = () => {
  let userId = '';

  do {
    const random = String(randomInt(0, 1_000_000_000_000)).padStart(12, '0');
    const value = `${USER_ID_VERSION}${USER_ID_SYSTEM}${USER_SOURCE_CONSOLE}${USER_TYPE_PERSON}${random}`;
    userId = `${value}${createUserIdChecksum(value)}`;
  } while (users.some((user) => user.userId === userId));

  return userId;
};

const createPassword = (currentPassword?: string) => {
  let password = crypto.randomUUID().replaceAll('-', '').slice(0, 12);

  while (password === currentPassword) {
    password = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
  }

  return password;
};

const hasInvalidRole = (roleUuids: string[]) =>
  roleUuids.some((uuid) => !roles.some((role) => role.uuid === uuid));

export default [
  {
    method: 'POST',
    path: `/api/user`,
    handler: async ({ body, request }: MockContext<API.UserSetParams>) => {
      const authorization = authorize(request, 'user:create');
      if (!authorization.authorized) return authorization.response;
      await delay(300);

      if (hasInvalidRole(body.roleUuids)) return createError('选择的角色不存在');

      const userId = createUserId();
      const password = createPassword();
      users.unshift({
        ...body,
        userId,
        account: `user-${userId}`,
        password,
        status: 'enabled',
        gmtCreate: new Date().toISOString(),
      });

      return createSuccess({ password }, 201);
    },
  },
  {
    method: 'PUT',
    path: `/api/user/:userId`,
    handler: async ({ body, params, request }: MockContext<API.UserSetParams>) => {
      const authorization = authorize(request, 'user:modify');
      if (!authorization.authorized) return authorization.response;
      const user = users.find(({ userId }) => userId === params.userId);
      await delay(300);

      if (!user) return createNotFound();
      if (hasInvalidRole(body.roleUuids)) return createError('选择的角色不存在');

      Object.assign(user, body);

      return createSuccess(true);
    },
  },
  {
    method: 'DELETE',
    path: `/api/user/:userId`,
    handler: async ({ params, request }: MockContext) => {
      const authorization = authorize(request, 'user:delete');
      if (!authorization.authorized) return authorization.response;
      const index = users.findIndex(({ userId }) => userId === params.userId);
      await delay(300);

      if (index < 0) return createNotFound();
      if (users[index]?.userId === authorization.user.userId)
        return createError('不能删除当前登录用户');

      users.splice(index, 1);

      return createSuccess(true);
    },
  },
  {
    method: 'PUT',
    path: `/api/user/:userId/status`,
    handler: async ({ body, params, request }: MockContext<Pick<API.User, 'status'>>) => {
      const permission = body.status === 'enabled' ? 'user:enable' : 'user:disable';
      const authorization = authorize(request, permission);
      if (!authorization.authorized) return authorization.response;
      const user = users.find(({ userId }) => userId === params.userId);
      await delay(300);

      if (!user) return createNotFound();
      if (user.userId === authorization.user.userId && body.status === 'disabled') {
        return createError('不能禁用当前登录用户');
      }

      user.status = body.status;

      return createSuccess(true);
    },
  },
  {
    method: 'PUT',
    path: `/api/user/:userId/password`,
    handler: async ({ params, request }: MockContext) => {
      const authorization = authorize(request, 'user:reset-password');
      if (!authorization.authorized) return authorization.response;
      const user = users.find(({ userId }) => userId === params.userId);
      await delay(300);

      if (!user) return createNotFound();

      const password = createPassword(user.password);
      user.password = password;

      return createSuccess({ password });
    },
  },
  {
    method: 'GET',
    path: `/api/user`,
    handler: async ({ request, url }: MockContext) => {
      const authorization = authorize(request, 'user:view');
      if (!authorization.authorized) return authorization.response;
      const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
      const status = url.searchParams.get('status');
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const filteredUsers = users.filter((user) => {
        const matchedKeyword = keyword
          ? `${user.account}${user.name}`.toLowerCase().includes(keyword)
          : true;
        const matchedStatus = status ? user.status === status : true;

        return matchedKeyword && matchedStatus;
      });
      const start = (pageNum - 1) * pageSize;
      await delay(300);

      return createSuccess({
        list: filteredUsers.slice(start, start + pageSize).map(getUserData),
        total: filteredUsers.length,
      });
    },
  },
  {
    method: 'GET',
    path: `/api/user/:userId`,
    handler: async ({ params, request }: MockContext) => {
      const authorization = authorize(request, 'user:view');
      if (!authorization.authorized) return authorization.response;
      const user = users.find(({ userId }) => userId === params.userId);
      await delay(300);

      return user ? createSuccess(getUserData(user)) : createNotFound();
    },
  },
] satisfies MockRoute[];
