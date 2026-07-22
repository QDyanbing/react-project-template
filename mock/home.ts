import { delay, http, HttpResponse } from "msw";

const homeListSeeds = [
  ["用户中心", "陈晨"],
  ["权限管理", "李敏"],
  ["数据看板", "王宁"],
  ["消息中心", "赵青"],
  ["订单管理", "周明"],
  ["内容管理", "孙悦"],
  ["资产管理", "吴桐"],
  ["审批中心", "郑杰"],
  ["运营平台", "许言"],
  ["报表中心", "林溪"],
  ["客户管理", "何安"],
  ["配置中心", "高远"],
] as const;

const homeList: API.HomeData[] = homeListSeeds.map(([name, owner], index) => ({
  id: index + 1,
  name,
  owner,
  status: index % 2 === 0 ? "进行中" : "已完成",
  updatedAt: `2026-07-${String(21 - index).padStart(2, "0")}`,
}));

export default [
  http.post<never, API.HomeParams>(
    "/api/home/search.json",
    async ({ request }) => {
      const params = await request.json();
      const keyword = params.keyword?.trim().toLowerCase();
      const filteredList = keyword
        ? homeList.filter(({ name, owner }) =>
            `${name}${owner}`.toLowerCase().includes(keyword),
          )
        : homeList;
      const start = (params.pageNum - 1) * params.pageSize;

      await delay(300);

      return HttpResponse.json<API.Result<API.PageResult<API.HomeData>>>({
        success: true,
        data: {
          list: filteredList.slice(start, start + params.pageSize),
          total: filteredList.length,
        },
      });
    },
  ),
];
