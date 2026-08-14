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
export const setModify = (userId: string, data: API.UserSetParams) =>
  Request.put<API.UserSetParams, boolean>(`/api/user/${userId}`, data);

/**
 * 删除指定用户。
 *
 * 权限：`user:delete`。
 */
export const setDelete = (userId: string) =>
  Request.delete<undefined, boolean>(`/api/user/${userId}`);

/**
 * 启用指定用户。
 *
 * 权限：`user:enable`。
 */
export const setEnable = (userId: string) =>
  Request.put<Pick<API.User, 'status'>, boolean>(`/api/user/${userId}/status`, {
    status: 'enabled',
  });

/**
 * 禁用指定用户。
 *
 * 权限：`user:disable`。
 */
export const setDisable = (userId: string) =>
  Request.put<Pick<API.User, 'status'>, boolean>(`/api/user/${userId}/status`, {
    status: 'disabled',
  });

/**
 * 重置指定用户的密码并返回新密码。
 *
 * 权限：`user:reset-password`。
 */
export const setResetPassword = (userId: string) =>
  Request.put<undefined, { password: string }>(`/api/user/${userId}/password`);

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
export const getDetail = (userId: string) =>
  Request.get<undefined, API.User>(`/api/user/${userId}`);
