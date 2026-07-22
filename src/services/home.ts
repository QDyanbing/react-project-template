import Request from "@/utils/request";

export function setCreate(data: API.HomeSetParams) {
  return Request.post<API.HomeSetParams, boolean>(`/api/home`, data);
}

export function setModify(uuid: string, data: API.HomeSetParams) {
  return Request.put<API.HomeSetParams, boolean>(`/api/home/${uuid}`, data);
}

export function setDelete(uuid: string) {
  return Request.delete<undefined, boolean>(`/api/home/${uuid}`);
}

export function getSearch(data: API.HomeParams) {
  return Request.get<API.HomeParams, API.PageResult<API.HomeData>>(
    `/api/home`,
    data
  );
}

export function getDetail(uuid: string) {
  return Request.get<undefined, API.HomeData>(`/api/home/${uuid}`);
}
