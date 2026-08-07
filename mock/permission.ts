import { setTimeout as delay } from 'node:timers/promises';
import type { MockContext, MockRoute } from '../plugins/mock';
import { permissions } from './database';
import { authorize, createSuccess } from './utils';

export default [
  {
    method: 'GET',
    path: `/api/permission/options`,
    handler: async ({ request }: MockContext) => {
      const authorization = authorize(request, ['role:create', 'role:modify']);
      if (!authorization.authorized) return authorization.response;
      await delay(200);

      return createSuccess(permissions);
    },
  },
] satisfies MockRoute[];
