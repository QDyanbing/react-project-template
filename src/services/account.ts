import Request from '@/utils/request';

/**
 * 登录账号并获取访问 Token。
 *
 * 权限：无需权限。
 */
export const setLogin = (data: API.AccountLoginParams) =>
  Request.post<API.AccountLoginParams, { token: string }>(`/api/login`, data);

/**
 * 退出当前账号并结束服务端会话。
 *
 * 权限：无需权限。
 */
export const setLogout = () => Request.post<undefined, boolean>(`/api/logout`);

/**
 * 修改当前用户的个人资料。
 *
 * 权限：无需权限。
 */
export const setModifyProfile = (data: API.AccountProfileParams) =>
  Request.put<API.AccountProfileParams, boolean>(`/api/account/profile`, data);

/**
 * 修改当前用户的登录密码。
 *
 * 权限：无需权限。
 */
export const setModifyPassword = (data: API.AccountPasswordParams) =>
  Request.put<API.AccountPasswordParams, boolean>(`/api/account/password`, data);

/**
 * 获取当前用户的资料、角色和权限。
 *
 * 权限：无需权限。
 */
export const getCurrent = () => Request.get<undefined, API.Account>(`/api/account/current`);
