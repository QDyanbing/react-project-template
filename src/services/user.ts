import Request from '@/utils/request';

/**
 * 创建用户、分配角色并返回初始密码。
 *
 * 权限：`user:create`。
 */
export const setCreate = (data: API.UserSetParams) =>
  Request.post<API.UserSetParams, { password: string }>(`/api/user`, data);

/**
 * 修改指定用户的资料和角色。
 *
 * 权限：`user:modify`。
 */
export const setModify = (uuid: string, data: API.UserSetParams) =>
  Request.put<API.UserSetParams, boolean>(`/api/user/${uuid}`, data);

/**
 * 删除指定用户。
 *
 * 权限：`user:delete`。
 */
export const setDelete = (uuid: string) => Request.delete<undefined, boolean>(`/api/user/${uuid}`);

/**
 * 启用指定用户。
 *
 * 权限：`user:enable`。
 */
export const setEnable = (uuid: string) =>
  Request.put<Pick<API.User, 'status'>, boolean>(`/api/user/${uuid}/status`, {
    status: 'enabled',
  });

/**
 * 禁用指定用户。
 *
 * 权限：`user:disable`。
 */
export const setDisable = (uuid: string) =>
  Request.put<Pick<API.User, 'status'>, boolean>(`/api/user/${uuid}/status`, {
    status: 'disabled',
  });

/**
 * 重置指定用户的密码并返回新密码。
 *
 * 权限：`user:reset-password`。
 */
export const setResetPassword = (uuid: string) =>
  Request.put<undefined, { password: string }>(`/api/user/${uuid}/password`);

/**
 * 分页查询用户列表。
 *
 * 权限：`user:view`。
 */
export const getSearch = (data: API.UserParams) =>
  Request.get<API.UserParams, API.PageResult<API.User>>(`/api/user`, data);

/**
 * 获取指定用户的详情。
 *
 * 权限：`user:view`。
 */
export const getDetail = (uuid: string) => Request.get<undefined, API.User>(`/api/user/${uuid}`);
