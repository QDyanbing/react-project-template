import { setTimeout as delay } from 'node:timers/promises';
import type { MockContext, MockRoute } from '../plugins/mock';
import { getAccountData, tokens, users } from './database';
import { authorize, createError, createSuccess, getRequestTokenValue } from './utils';

export default [
  {
    method: 'POST',
    path: `/api/login`,
    handler: async ({ body }: MockContext<API.AccountLoginParams>) => {
      await delay(300);

      const user = users.find(({ account }) => account === body.account);
      if (!user || user.password !== body.password) {
        return createError('账号或密码错误');
      }
      if (user.status !== 'enabled') return createError('当前账号已被禁用');

      const token = crypto.randomUUID();
      tokens.set(token, user.uuid);

      return createSuccess({ token });
    },
  },
  {
    method: 'POST',
    path: `/api/logout`,
    handler: async ({ request }: MockContext) => {
      const token = getRequestTokenValue(request);
      if (token) tokens.delete(token);
      await delay(200);

      return createSuccess(true);
    },
  },
  {
    method: 'PUT',
    path: `/api/account/profile`,
    handler: async ({ body, request }: MockContext<API.AccountProfileParams>) => {
      const authorization = authorize(request);
      if (!authorization.authorized) return authorization.response;
      await delay(300);

      Object.assign(authorization.user, body);

      return createSuccess(true);
    },
  },
  {
    method: 'PUT',
    path: `/api/account/password`,
    handler: async ({ body, request }: MockContext<API.AccountPasswordParams>) => {
      const authorization = authorize(request);
      if (!authorization.authorized) return authorization.response;
      await delay(300);

      if (authorization.user.password !== body.currentPassword) {
        return createError('当前密码不正确');
      }

      authorization.user.password = body.password;
      for (const [token, uuid] of tokens) {
        if (uuid === authorization.user.uuid) tokens.delete(token);
      }

      return createSuccess(true);
    },
  },
  {
    method: 'GET',
    path: `/api/account/current`,
    handler: async ({ request }: MockContext) => {
      const authorization = authorize(request);
      await delay(300);

      if (!authorization.authorized) return authorization.response;

      return createSuccess(getAccountData(authorization.user));
    },
  },
] satisfies MockRoute[];
