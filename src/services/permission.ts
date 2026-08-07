import Request from '@/utils/request';

/**
 * 获取角色可配置的权限选项。
 *
 * 权限：`role:create` 或 `role:modify`。
 */
export const getOptions = () => Request.get<undefined, API.Permission[]>(`/api/permission/options`);
