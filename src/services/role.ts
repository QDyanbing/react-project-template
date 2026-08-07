import Request from '@/utils/request';

/**
 * 创建角色并配置权限标识。
 *
 * 权限：`role:create`。
 */
export const setCreate = (data: API.RoleSetParams) =>
  Request.post<API.RoleSetParams, boolean>(`/api/role`, data);

/**
 * 修改指定角色的资料和权限标识。
 *
 * 权限：`role:modify`。
 */
export const setModify = (uuid: string, data: API.RoleSetParams) =>
  Request.put<API.RoleSetParams, boolean>(`/api/role/${uuid}`, data);

/**
 * 删除指定角色。
 *
 * 权限：`role:delete`。
 */
export const setDelete = (uuid: string) => Request.delete<undefined, boolean>(`/api/role/${uuid}`);

/**
 * 分页查询角色列表。
 *
 * 权限：`role:view`。
 */
export const getSearch = (data: API.RoleParams) =>
  Request.get<API.RoleParams, API.PageResult<API.Role>>(`/api/role`, data);

/**
 * 获取指定角色的详情。
 *
 * 权限：`role:view`。
 */
export const getDetail = (uuid: string) => Request.get<undefined, API.Role>(`/api/role/${uuid}`);

/**
 * 获取用户表单可选择的角色选项。
 *
 * 权限：`user:create` 或 `user:modify`。
 */
export const getOptions = () => Request.get<undefined, API.Role[]>(`/api/role/options`);
