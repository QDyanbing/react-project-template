import Request from "@/utils/request";

export function getSearch(data: API.HomeParams) {
  return Request.post<API.HomeParams, API.PageResult<API.HomeData>>(
    "/api/home/search.json",
    data,
  );
}
