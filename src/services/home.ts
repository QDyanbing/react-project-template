import Request from '@/utils/request';

/**
 * 创建项目。
 *
 * 权限：无需权限。
 */
export const setCreate = (data: API.HomeSetParams) =>
  Request.post<API.HomeSetParams, boolean>(`/api/home`, data);

/**
 * 修改指定项目。
 *
 * 权限：无需权限。
 */
export const setModify = (uuid: string, data: API.HomeSetParams) =>
  Request.put<API.HomeSetParams, boolean>(`/api/home/${uuid}`, data);

/**
 * 删除指定项目。
 *
 * 权限：无需权限。
 */
export const setDelete = (uuid: string) => Request.delete<undefined, boolean>(`/api/home/${uuid}`);

/**
 * 分页查询项目列表。
 *
 * 权限：无需权限。
 */
export const getSearch = (data: API.HomeParams) =>
  Request.get<API.HomeParams, API.PageResult<API.Home>>(`/api/home`, data);

/**
 * 获取指定项目的详情。
 *
 * 权限：无需权限。
 */
export const getDetail = (uuid: string) => Request.get<undefined, API.Home>(`/api/home/${uuid}`);
