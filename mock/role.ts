import { setTimeout as delay } from 'node:timers/promises';
import type { MockContext, MockRoute } from '../plugins/mock';
import { getRoleData, permissions, roles, users } from './database';
import { authorize, createError, createSuccess } from './utils';

const createNotFound = () => createError('角色不存在', 404);

const hasDuplicate = (data: API.RoleSetParams, uuid?: string) =>
  roles.some(
    (role) =>
      role.uuid !== uuid && role.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
  );

const hasInvalidPermission = (permissionCodes: string[]) =>
  permissionCodes.some(
    (code) => code !== '*' && !permissions.some((permission) => permission.code === code),
  );

export default [
  {
    method: 'POST',
    path: `/api/role`,
    handler: async ({ body, request }: MockContext<API.RoleSetParams>) => {
      const authorization = authorize(request, 'role:create');
      if (!authorization.authorized) return authorization.response;
      await delay(300);

      if (hasDuplicate(body)) return createError('角色名称已存在');
      if (hasInvalidPermission(body.permissionCodes)) return createError('包含无效的权限标识');

      roles.unshift({
        ...body,
        uuid: crypto.randomUUID(),
        gmtCreate: new Date().toISOString(),
      });

      return createSuccess(true, 201);
    },
  },
  {
    method: 'PUT',
    path: `/api/role/:uuid`,
    handler: async ({ body, params, request }: MockContext<API.RoleSetParams>) => {
      const authorization = authorize(request, 'role:modify');
      if (!authorization.authorized) return authorization.response;
      const role = roles.find(({ uuid }) => uuid === params.uuid);
      await delay(300);

      if (!role) return createNotFound();
      if (hasDuplicate(body, role.uuid)) return createError('角色名称已存在');
      if (hasInvalidPermission(body.permissionCodes)) return createError('包含无效的权限标识');

      Object.assign(role, body);

      return createSuccess(true);
    },
  },
  {
    method: 'DELETE',
    path: `/api/role/:uuid`,
    handler: async ({ params, request }: MockContext) => {
      const authorization = authorize(request, 'role:delete');
      if (!authorization.authorized) return authorization.response;
      const { uuid } = params;
      const index = roles.findIndex((role) => role.uuid === uuid);
      await delay(300);

      if (!uuid || index < 0) return createNotFound();
      if (users.some(({ roleUuids }) => roleUuids.includes(uuid))) {
        return createError('角色仍被用户使用，无法删除');
      }

      roles.splice(index, 1);

      return createSuccess(true);
    },
  },
  {
    method: 'GET',
    path: `/api/role/options`,
    handler: async ({ request }: MockContext) => {
      const authorization = authorize(request, ['user:create', 'user:modify']);
      if (!authorization.authorized) return authorization.response;
      await delay(200);

      return createSuccess(roles.map(getRoleData));
    },
  },
  {
    method: 'GET',
    path: `/api/role`,
    handler: async ({ request, url }: MockContext) => {
      const authorization = authorize(request, 'role:view');
      if (!authorization.authorized) return authorization.response;
      const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
      const pageNum = Number(url.searchParams.get('pageNum')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;
      const filteredRoles = roles.filter((role) => {
        const matchedKeyword = keyword ? role.name.toLowerCase().includes(keyword) : true;
        return matchedKeyword;
      });
      const start = (pageNum - 1) * pageSize;
      await delay(300);

      return createSuccess({
        list: filteredRoles.slice(start, start + pageSize).map(getRoleData),
        total: filteredRoles.length,
      });
    },
  },
  {
    method: 'GET',
    path: `/api/role/:uuid`,
    handler: async ({ params, request }: MockContext) => {
      const authorization = authorize(request, 'role:view');
      if (!authorization.authorized) return authorization.response;
      const role = roles.find(({ uuid }) => uuid === params.uuid);
      await delay(300);

      return role ? createSuccess(getRoleData(role)) : createNotFound();
    },
  },
] satisfies MockRoute[];
