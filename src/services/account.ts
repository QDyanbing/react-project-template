import Request from "@/utils/request";

export function setLogin(data: API.LoginParams) {
  return Request.post<API.LoginParams, { token: string }>(`/api/login`, data);
}
